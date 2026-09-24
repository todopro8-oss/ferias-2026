// Secuenciador propio: canciones como datos de patrones, compiladas a eventos con tiempo.
// Notación de cada pista: fichas separadas por espacios «NOTAS:DURACIÓN», con la duración
// en semicorcheas (2 = corchea, 4 = negra, 3 = corchea con puntillo…). NOTAS puede ser una
// nota («A4», «C#5»), un acorde («A3,C4,E4»), un silencio («R») o, en percusión, un golpe
// («b» bombo, «s» caja, «h» charles, «c» castañuela, «p» palmas, «t» pandereta, «pl» platillo).
// «|» marca los compases (sólo para leer y comprobar).

import type { NombrePatch } from './synth';

export type Instrumento = NombrePatch | 'percusion';

export interface Pista {
  instrumento: Instrumento;
  volumen: number;
  notas: string;
}

export interface Seccion {
  nombre: string;
  bpm: number;
  compas: [number, number];
  pistas: Pista[];
  repeticiones?: number;
}

export interface Cancion {
  nombre: string;
  secciones: Seccion[];
  bucle: boolean;
}

export interface EventoNota {
  t: number;
  dur: number;
  instrumento: Instrumento;
  notas: string[];
  volumen: number;
}

export const GOLPES = ['b', 's', 'h', 'c', 'p', 't', 'pl'] as const;
export type Golpe = (typeof GOLPES)[number];

interface Ficha {
  notas: string[];
  dur: number;
}

function fichas(texto: string): (Ficha | '|')[] {
  return texto
    .split(/\s+/)
    .filter(Boolean)
    .map((f) => {
      if (f === '|') return '|';
      const [n, d] = f.split(':');
      const dur = Number(d);
      if (!n || !Number.isFinite(dur) || dur <= 0) throw new Error(`Ficha no válida: «${f}»`);
      return { notas: n === 'R' ? [] : n.split(','), dur };
    });
}

/** Semicorcheas que caben en un compás. */
export function semicorcheasPorCompas(compas: [number, number]): number {
  return compas[0] * (16 / compas[1]);
}

/** Comprueba que cada compás de cada pista suma lo que debe. Devuelve los errores. */
export function validar(c: Cancion): string[] {
  const errores: string[] = [];
  for (const s of c.secciones) {
    const porCompas = semicorcheasPorCompas(s.compas);
    let largoSeccion = -1;
    s.pistas.forEach((p, ip) => {
      let enCompas = 0;
      let numCompas = 1;
      let total = 0;
      for (const f of fichas(p.notas)) {
        if (f === '|') {
          if (Math.abs(enCompas - porCompas) > 1e-6) {
            errores.push(`${c.nombre}/${s.nombre} pista ${ip} compás ${numCompas}: ${enCompas} en vez de ${porCompas}`);
          }
          enCompas = 0;
          numCompas++;
          continue;
        }
        enCompas += f.dur;
        total += f.dur;
      }
      if (enCompas > 0 && Math.abs(enCompas - porCompas) > 1e-6) {
        errores.push(`${c.nombre}/${s.nombre} pista ${ip} último compás: ${enCompas} en vez de ${porCompas}`);
      }
      if (largoSeccion < 0) largoSeccion = total;
      else if (Math.abs(total - largoSeccion) > 1e-6) {
        errores.push(`${c.nombre}/${s.nombre} pista ${ip}: dura ${total} y la primera ${largoSeccion}`);
      }
    });
  }
  return errores;
}

/** Convierte la canción en eventos con tiempo (segundos desde el principio). */
export function compilar(c: Cancion): { eventos: EventoNota[]; duracion: number } {
  const eventos: EventoNota[] = [];
  let t0 = 0;
  for (const s of c.secciones) {
    const semicorchea = 60 / s.bpm / 4;
    const reps = s.repeticiones ?? 1;
    let largo = 0;
    for (let r = 0; r < reps; r++) {
      for (const p of s.pistas) {
        let t = 0;
        for (const f of fichas(p.notas)) {
          if (f === '|') continue;
          if (f.notas.length > 0) {
            eventos.push({
              t: t0 + t * semicorchea,
              dur: f.dur * semicorchea,
              instrumento: p.instrumento,
              notas: f.notas,
              volumen: p.volumen,
            });
          }
          t += f.dur;
        }
        largo = Math.max(largo, t);
      }
      t0 += largo * semicorchea;
    }
  }
  eventos.sort((a, b) => a.t - b.t);
  return { eventos, duracion: t0 };
}

// ---------------------------------------------------------------------------
// Ayudas para escribir acompañamientos a partir de una lista de acordes por compás.
// ---------------------------------------------------------------------------

export interface Acorde {
  /** Notas del acorde en la zona media («A3,C4,E4»). */
  notas: string;
  /** Bajo: fundamental y quinta. */
  bajo: [string, string];
}

/** «Chumpa-chumpa» de pasodoble o charanga en 2/4: bajo · acorde · quinta · acorde. */
export function oomPah(acordes: Acorde[]): { bajo: string; acordes: string } {
  return {
    bajo: acordes.map((a) => `${a.bajo[0]}:2 R:2 ${a.bajo[1]}:2 R:2`).join(' | '),
    acordes: acordes.map((a) => `R:2 ${a.notas}:2 R:2 ${a.notas}:2`).join(' | '),
  };
}

/** Jota en 3/4: bajo en la parte fuerte y el acorde rasgueado en las otras dos. */
export function jota(acordes: Acorde[]): { bajo: string; acordes: string } {
  return {
    bajo: acordes.map((a) => `${a.bajo[0]}:4 ${a.bajo[1]}:4 ${a.bajo[1]}:4`).join(' | '),
    acordes: acordes.map((a) => `R:4 ${a.notas}:4 ${a.notas}:4`).join(' | '),
  };
}

/** Rumba en 4/4: rasgueo 3-3-2 y bajo que lo sigue. */
export function rumba(acordes: Acorde[]): { bajo: string; acordes: string } {
  return {
    bajo: acordes.map((a) => `${a.bajo[0]}:6 ${a.bajo[0]}:6 ${a.bajo[1]}:4`).join(' | '),
    acordes: acordes
      .map((a) => `${a.notas}:3 ${a.notas}:3 ${a.notas}:2 ${a.notas}:3 ${a.notas}:3 ${a.notas}:2`)
      .join(' | '),
  };
}

export function repetir(patron: string, veces: number): string {
  return Array.from({ length: veces }, () => patron).join(' | ');
}
