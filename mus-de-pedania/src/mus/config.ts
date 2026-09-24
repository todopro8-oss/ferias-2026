import type { Reyes } from './cards';

export type ModoSenas = 'clasico' | 'discreto' | 'off';
export type VelocidadIA = 'lenta' | 'normal' | 'rapida';

export interface MusConfig {
  reyes: Reyes;
  puntosJuego: 40 | 30;
  /** 1 juego, o 3 (gana quien gane 2). */
  juegosPartida: 1 | 3;
  musCorrido: boolean;
  senas: ModoSenas;
  senasDeLaCasa: boolean;
  velocidadIA: VelocidadIA;
}

export const CONFIG_POR_DEFECTO: Readonly<MusConfig> = Object.freeze({
  reyes: 8,
  puntosJuego: 40,
  juegosPartida: 1,
  musCorrido: false,
  senas: 'clasico',
  senasDeLaCasa: false,
  velocidadIA: 'normal',
});

export function crearConfig(parcial: Partial<MusConfig> = {}): MusConfig {
  return { ...CONFIG_POR_DEFECTO, ...parcial };
}

/** Juegos que hay que ganar para llevarse la partida. */
export function juegosParaGanar(config: MusConfig): number {
  return config.juegosPartida === 1 ? 1 : 2;
}

// ---------------------------------------------------------------------------
// Asientos y equipos
// ---------------------------------------------------------------------------

/** 0 = humano (sur), 1 = rival derecha (este), 2 = compañero (norte), 3 = rival izquierda (oeste). */
export type Seat = 0 | 1 | 2 | 3;
/** 0 = «Nosotros» {0, 2}; 1 = «Ellos» {1, 3}. */
export type Equipo = 0 | 1;

export const ASIENTOS: readonly Seat[] = [0, 1, 2, 3];

export function equipoDe(s: Seat): Equipo {
  return (s % 2) as Equipo;
}

export function companero(s: Seat): Seat {
  return ((s + 2) % 4) as Seat;
}

/** Siguiente en sentido de juego (antihorario: 0 → 1 → 2 → 3 → 0). */
export function siguiente(s: Seat): Seat {
  return ((s + 1) % 4) as Seat;
}

export function anterior(s: Seat): Seat {
  return ((s + 3) % 4) as Seat;
}

/** Orden de habla empezando por la mano. */
export function ordenDesde(mano: Seat): Seat[] {
  return [mano, siguiente(mano), siguiente(siguiente(mano)), anterior(mano)];
}

/** 0 para la mano, 3 para el postre. */
export function distanciaAMano(s: Seat, mano: Seat): number {
  return (s - mano + 4) % 4;
}

export function miembros(e: Equipo): [Seat, Seat] {
  return e === 0 ? [0, 2] : [1, 3];
}

export function rival(e: Equipo): Equipo {
  return (1 - e) as Equipo;
}
