// I Campeonato Comarcal de Mus: cuadro de 8 parejas → cuartos, semifinal y final.
// Tu pareja se enfrenta a parejas formadas con los personajes restantes (pareja nueva
// cada ronda; en la final, los dos de más nivel). El resto del cuadro son parejas de relleno
// con nombres del pueblo y resultados simulados.

import { barajarEnSitio, mulberry32, type Rng } from '../core/rng';
import { IDS_PERSONAJES, PERSONAJES, type IdPersonaje } from './characters';

export const PAREJAS_DE_RELLENO = [
  'Los del Casino',
  'Hermanos Peña',
  'Club de Jubilados',
  'Los de la Cooperativa',
  'Los Forasteros',
  'Peña El Botijo',
  'Los de la Ermita',
  'Las del Mercadillo',
];

/** Forma corta para el cuadro (máx. 16 caracteres). */
export function nombreCorto(nombre: string): string {
  const cortos: Record<string, string> = {
    'Club de Jubilados': 'Club Jubilados',
    'Los de la Cooperativa': 'La Cooperativa',
    'Las del Mercadillo': 'Las del Mercado',
  };
  const c = cortos[nombre] ?? nombre;
  return [...c].length > 16 ? `${[...c].slice(0, 15).join('')}…` : c;
}

export const RONDAS = ['Cuartos', 'Semifinal', 'Final'] as const;
export type NombreRonda = (typeof RONDAS)[number];

export interface ParejaTorneo {
  id: number;
  nombre: string;
  /** Si es una pareja de personajes, quiénes la forman. */
  miembros?: [IdPersonaje, IdPersonaje];
  /** La tuya. */
  humano?: boolean;
}

export interface Partido {
  a: number;
  b: number;
  ganador: number | null;
  /** Marcador en piedras (a, b), si ya se jugó. */
  marcador?: [number, number];
}

export interface EstadoTorneo {
  semilla: number;
  nombreJugador: string;
  companero: IdPersonaje;
  parejas: ParejaTorneo[];
  /** rondas[0] = 4 partidos de cuartos, rondas[1] = 2 semis, rondas[2] = final. */
  rondas: Partido[][];
  /** Ronda que toca jugar (0..2), o 3 si ya eres campeón. */
  rondaActual: number;
  eliminado: boolean;
  campeon: boolean;
}

export const VERSION_TORNEO = 1;

function nombrePareja(m: [IdPersonaje, IdPersonaje]): string {
  return `${PERSONAJES[m[0]].corto} y ${PERSONAJES[m[1]].corto}`;
}

/** Monta el cuadro. Tus rivales: cuartos y semis con 3 personajes; la final, los 2 de más nivel. */
export function nuevoTorneo(companero: IdPersonaje, nombreJugador: string, semilla: number): EstadoTorneo {
  const rng = mulberry32(semilla);
  const restantes = IDS_PERSONAJES.filter((id) => id !== companero);
  // Los dos de más nivel (desempate aleatorio) van a la final.
  const porNivel = barajarEnSitio([...restantes], rng).sort((a, b) => PERSONAJES[b].nivel - PERSONAJES[a].nivel);
  const finalistas = porNivel.slice(0, 2) as [IdPersonaje, IdPersonaje];
  // Quedan 6 personajes (7 menos tu compañero): cuartos y semis con los otros 4, sin repetir nadie.
  const otros = barajarEnSitio(porNivel.slice(2), rng);
  const cuartos: [IdPersonaje, IdPersonaje] = [otros[0], otros[1]];
  const semis: [IdPersonaje, IdPersonaje] = [otros[2], otros[3]];
  const relleno = barajarEnSitio([...PAREJAS_DE_RELLENO], rng).slice(0, 4);

  const parejas: ParejaTorneo[] = [
    { id: 0, nombre: `${nombreJugador} y ${PERSONAJES[companero].corto}`, humano: true },
    { id: 1, nombre: nombrePareja(cuartos), miembros: cuartos },
    { id: 2, nombre: nombrePareja(semis), miembros: semis },
    { id: 3, nombre: relleno[0] },
    { id: 4, nombre: nombrePareja(finalistas), miembros: finalistas },
    { id: 5, nombre: relleno[1] },
    { id: 6, nombre: relleno[2] },
    { id: 7, nombre: relleno[3] },
  ];
  // Cuadro: tú contra los de cuartos; el ganador de 2-3 (serán los de semis) te espera en semifinal;
  // los finalistas salen por el otro lado.
  const rondas: Partido[][] = [
    [
      { a: 0, b: 1, ganador: null },
      { a: 2, b: 3, ganador: null },
      { a: 4, b: 5, ganador: null },
      { a: 6, b: 7, ganador: null },
    ],
    [
      { a: -1, b: -1, ganador: null },
      { a: -1, b: -1, ganador: null },
    ],
    [{ a: -1, b: -1, ganador: null }],
  ];
  return { semilla, nombreJugador, companero, parejas, rondas, rondaActual: 0, eliminado: false, campeon: false };
}

/** Rivales (este, oeste) del partido que te toca en la ronda actual. */
export function rivalesActuales(t: EstadoTorneo): [IdPersonaje, IdPersonaje] | null {
  if (t.eliminado || t.campeon) return null;
  const partido = t.rondas[t.rondaActual].find((p) => p.a === 0 || p.b === 0);
  if (!partido) return null;
  const rival = t.parejas[partido.a === 0 ? partido.b : partido.a];
  return rival?.miembros ?? null;
}

function marcadorSimulado(rng: Rng): [number, number] {
  const perdedor = 12 + Math.floor(rng() * 26);
  return [40, perdedor];
}

/** Resultado simulado de un partido de relleno. `favorito` gana si se indica. */
function simular(p: Partido, rng: Rng, favorito?: number): void {
  const ganaA = favorito !== undefined ? favorito === p.a : rng() < 0.5;
  const [g, pe] = marcadorSimulado(rng);
  p.ganador = ganaA ? p.a : p.b;
  p.marcador = ganaA ? [g, pe] : [pe, g];
}

/**
 * Apunta el resultado de tu partido, simula el resto de la ronda y prepara la siguiente.
 * Los personajes rivales siempre ganan sus partidos contra parejas de relleno, para que
 * te los encuentres donde toca.
 */
export function registrarResultado(t: EstadoTorneo, ganaste: boolean, marcador: [number, number]): EstadoTorneo {
  const n = structuredClone(t);
  const rng = mulberry32(n.semilla + 101 * (n.rondaActual + 1));
  const ronda = n.rondas[n.rondaActual];
  for (const p of ronda) {
    if (p.a === 0 || p.b === 0) {
      const rival = p.a === 0 ? p.b : p.a;
      p.ganador = ganaste ? 0 : rival;
      p.marcador = p.a === 0 ? marcador : [marcador[1], marcador[0]];
      continue;
    }
    const conPersonajes = [p.a, p.b].filter((i) => n.parejas[i]?.miembros);
    simular(p, rng, conPersonajes.length === 1 ? conPersonajes[0] : undefined);
  }
  if (!ganaste) {
    n.eliminado = true;
    // Se simula el resto del torneo para que el cuadro quede completo.
    avanzarCuadro(n, rng);
    return n;
  }
  if (n.rondaActual === 2) {
    n.campeon = true;
    n.rondaActual = 3;
    return n;
  }
  const siguiente = n.rondas[n.rondaActual + 1];
  for (let i = 0; i < siguiente.length; i++) {
    siguiente[i].a = ronda[i * 2].ganador!;
    siguiente[i].b = ronda[i * 2 + 1].ganador!;
  }
  n.rondaActual++;
  return n;
}

function avanzarCuadro(n: EstadoTorneo, rng: Rng): void {
  for (let r = n.rondaActual + 1; r < 3; r++) {
    const previa = n.rondas[r - 1];
    n.rondas[r].forEach((p, i) => {
      p.a = previa[i * 2].ganador!;
      p.b = previa[i * 2 + 1].ganador!;
      const conPersonajes = [p.a, p.b].filter((k) => n.parejas[k]?.miembros);
      simular(p, rng, conPersonajes.length === 1 ? conPersonajes[0] : undefined);
    });
  }
}

export function nombreRonda(i: number): NombreRonda | 'Campeón' {
  return RONDAS[i] ?? 'Campeón';
}
