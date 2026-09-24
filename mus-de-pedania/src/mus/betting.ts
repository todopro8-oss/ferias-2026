// Apuestas dentro de un lance (sección 4.7). Funciones puras: cada acción devuelve
// un estado nuevo; el estado anterior no se toca.

import { equipoDe, type Equipo, type Seat } from './config';

export type AccionApuesta =
  | { tipo: 'paso' }
  | { tipo: 'envido'; cantidad: number }
  | { tipo: 'quiero' }
  | { tipo: 'noQuiero' }
  | { tipo: 'ordago' };

export type TipoAccionApuesta = AccionApuesta['tipo'];

export type ResultadoApuesta =
  | { tipo: 'paso' }
  | { tipo: 'querido'; puntos: number; ordago: boolean }
  | { tipo: 'rechazado'; ganador: Equipo; piedras: number; ordago: boolean };

export interface EstadoApuesta {
  /** Quienes pueden hablar en el lance, en orden de habla desde la mano. */
  readonly participantes: readonly Seat[];
  /** Total propuesto ahora mismo (0 = no hay apuesta). */
  readonly apuestaVigente: number;
  /** Total ya aceptado implícitamente (lo que se cobra si se rechaza una subida). */
  readonly apuestaAnterior: number;
  readonly apostadoPor: Equipo | null;
  readonly apostador: Seat | null;
  readonly ordago: boolean;
  readonly turno: Seat | null;
  /** Índice del que habla en la ronda de apertura (sin apuesta). */
  readonly indiceApertura: number;
  /** Jugadores del equipo que responde que ya han dicho «no quiero» a la apuesta vigente. */
  readonly rechazan: readonly Seat[];
  readonly resultado: ResultadoApuesta | null;
}

export const ENVITE_MINIMO = 2;
export const ENVITE_MAXIMO = 40;

export function iniciarApuesta(participantes: readonly Seat[]): EstadoApuesta {
  if (participantes.length === 0) throw new Error('Un lance con apuestas necesita participantes');
  return {
    participantes: [...participantes],
    apuestaVigente: 0,
    apuestaAnterior: 0,
    apostadoPor: null,
    apostador: null,
    ordago: false,
    turno: participantes[0],
    indiceApertura: 0,
    rechazan: [],
    resultado: null,
  };
}

/** Jugadores del equipo contrario al apostador, en orden de habla a partir del apostador. */
export function respondedores(participantes: readonly Seat[], apostador: Seat): Seat[] {
  const n = participantes.length;
  const i = participantes.indexOf(apostador);
  const res: Seat[] = [];
  for (let k = 1; k < n; k++) {
    const p = participantes[(i + k) % n];
    if (equipoDe(p) !== equipoDe(apostador)) res.push(p);
  }
  return res;
}

export function opcionesApuesta(e: EstadoApuesta): TipoAccionApuesta[] {
  if (e.resultado || e.turno === null) return [];
  if (e.apostadoPor === null) return ['paso', 'envido', 'ordago'];
  if (e.ordago) return ['quiero', 'noQuiero'];
  return ['quiero', 'noQuiero', 'envido', 'ordago'];
}

/** Voz asociada a una acción, para los eventos y los bocadillos. */
export type VozApuesta = 'paso' | 'envido' | 'envidoMas' | 'quiero' | 'noQuiero' | 'ordago' | 'quieroOrdago';

export function vozDeAccion(e: EstadoApuesta, a: AccionApuesta): VozApuesta {
  switch (a.tipo) {
    case 'paso':
      return 'paso';
    case 'envido':
      return e.apostadoPor === null ? 'envido' : 'envidoMas';
    case 'quiero':
      return e.ordago ? 'quieroOrdago' : 'quiero';
    case 'noQuiero':
      return 'noQuiero';
    case 'ordago':
      return 'ordago';
  }
}

/** Piedras que cobra el equipo apostador si le rechazan: 1 si era la apertura (deje), si no la apuesta anterior. */
export function piedrasPorRechazo(e: EstadoApuesta): number {
  return e.apuestaAnterior > 0 ? e.apuestaAnterior : 1;
}

function apostar(e: EstadoApuesta, jugador: Seat, total: number, ordago: boolean): EstadoApuesta {
  const resp = respondedores(e.participantes, jugador);
  if (resp.length === 0) throw new Error('No hay nadie que pueda responder a la apuesta');
  return {
    ...e,
    apuestaAnterior: e.apostadoPor === null ? 0 : e.apuestaVigente,
    apuestaVigente: total,
    apostadoPor: equipoDe(jugador),
    apostador: jugador,
    ordago,
    turno: resp[0],
    rechazan: [],
  };
}

export function aplicarApuesta(e: EstadoApuesta, jugador: Seat, a: AccionApuesta): EstadoApuesta {
  if (e.resultado) throw new Error('El lance ya está cerrado');
  if (jugador !== e.turno) throw new Error(`No es el turno del jugador ${jugador} (le toca a ${e.turno})`);
  const validas = opcionesApuesta(e);
  if (!validas.includes(a.tipo)) throw new Error(`Acción no válida ahora: ${a.tipo}`);

  switch (a.tipo) {
    case 'paso': {
      const i = e.indiceApertura + 1;
      if (i >= e.participantes.length) {
        return { ...e, indiceApertura: i, turno: null, resultado: { tipo: 'paso' } };
      }
      return { ...e, indiceApertura: i, turno: e.participantes[i] };
    }
    case 'envido': {
      const n = Math.floor(a.cantidad);
      if (!(n >= ENVITE_MINIMO && n <= ENVITE_MAXIMO)) {
        throw new Error(`Envite fuera de rango: ${a.cantidad}`);
      }
      // Sin apuesta: el total es N. Con apuesta: «N más» sobre la apuesta vigente.
      const total = e.apostadoPor === null ? n : e.apuestaVigente + n;
      return apostar(e, jugador, total, false);
    }
    case 'ordago':
      // El órdago es una subida «a todo»: conserva la apuesta vigente como anterior.
      return apostar(e, jugador, e.apuestaVigente, true);
    case 'quiero':
      return {
        ...e,
        turno: null,
        resultado: { tipo: 'querido', puntos: e.apuestaVigente, ordago: e.ordago },
      };
    case 'noQuiero': {
      const rechazan = [...e.rechazan, jugador];
      const quedan = respondedores(e.participantes, e.apostador!).filter((p) => !rechazan.includes(p));
      if (quedan.length > 0) return { ...e, rechazan, turno: quedan[0] };
      return {
        ...e,
        rechazan,
        turno: null,
        resultado: { tipo: 'rechazado', ganador: e.apostadoPor!, piedras: piedrasPorRechazo(e), ordago: e.ordago },
      };
    }
  }
}
