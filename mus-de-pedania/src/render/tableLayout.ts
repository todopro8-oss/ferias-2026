// Coordenadas de la pantalla de mesa (sección 10), en píxeles lógicos de 320×200.

import type { Seat } from '../mus/config';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const MESA_Y = 88;

export const LAYOUT = {
  pizarra: { x: 4, y: 4, w: 76, h: 40 },
  puerta: { x: 86, y: 14, w: 26, h: 74 },
  barra: { x: 196, y: 24, w: 48, h: 46 },
  tele: { x: 268, y: 4, w: 44, h: 30 },
  /** Bustos: norte frontal 64×72; oeste y este en 3/4, 60×76. */
  bustos: {
    2: { x: 128, y: 16, w: 64, h: 72 },
    3: { x: 4, y: 54, w: 60, h: 76 },
    1: { x: 256, y: 54, w: 60, h: 76 },
  } as Record<1 | 2 | 3, Rect>,
  /** Caras (para las señas y el clic de «¡Te he visto!»). */
  caras: {
    2: { x: 142, y: 20, w: 36, h: 40 },
    3: { x: 12, y: 58, w: 36, h: 42 },
    1: { x: 272, y: 58, w: 36, h: 42 },
  } as Record<1 | 2 | 3, Rect>,
  /** Dónde dejan sus 4 dorsos (12×14) los jugadores IA. */
  dorsos: {
    2: { x: 134, y: 90, dx: 13, dy: 0 },
    3: { x: 64, y: 100, dx: 7, dy: 3 },
    1: { x: 234, y: 100, dx: -7, dy: 3 },
  } as Record<1 | 2 | 3, { x: number; y: number; dx: number; dy: number }>,
  /** Cartas destapadas (24×36) en el recuento, en abanico. */
  destape: {
    2: { x: 118, y: 86, dx: 21 },
    3: { x: 62, y: 96, dx: 12 },
    1: { x: 206, y: 96, dx: 12 },
  } as Record<1 | 2 | 3, { x: number; y: number; dx: number }>,
  mazo: { x: 146, y: 104 },
  cuenco: { x: 156, y: 118, w: 22, h: 10 },
  descartes: { x: 172, y: 104 },
  piedras: {
    0: { x: 84, y: 124 },
    1: { x: 214, y: 124 },
  } as Record<0 | 1, { x: number; y: number }>,
  cartas: { y: 138, xs: [81, 121, 161, 201], w: 38, h: 58, sube: 8 },
  panelLances: { x: 4, y: 132, w: 74, h: 64 },
  panelAcciones: { x: 246, y: 132, w: 70, h: 64 },
  selector: { x: 246, y: 119, w: 70, h: 11 },
  boton: { w: 70, h: 11, sep: 2 },
  /** Fichas de mano (M) y postre (P). */
  fichas: {
    0: { x: 126, y: 127 },
    1: { x: 246, y: 90 },
    2: { x: 194, y: 78 },
    3: { x: 64, y: 90 },
  } as Record<Seat, { x: number; y: number }>,
  /** Ancla de los bocadillos: punto al que apunta el piquito. */
  bocadillos: {
    0: { x: 160, y: 132, lado: 'arriba' },
    1: { x: 282, y: 60, lado: 'derecha' },
    2: { x: 180, y: 22, lado: 'derecha' },
    3: { x: 38, y: 60, lado: 'izquierda' },
  } as Record<Seat, { x: number; y: number; lado: 'arriba' | 'izquierda' | 'derecha' }>,
};

/** Posición en pantalla desde la que «reparte» cada asiento (para animar cartas). */
export function origenAsiento(s: Seat): { x: number; y: number } {
  switch (s) {
    case 0:
      return { x: 160, y: 190 };
    case 1:
      return { x: 270, y: 100 };
    case 2:
      return { x: 160, y: 80 };
    case 3:
      return { x: 50, y: 100 };
  }
}

export function rectCarta(i: number, seleccionada: boolean): Rect {
  const c = LAYOUT.cartas;
  return { x: c.xs[i], y: c.y - (seleccionada ? c.sube : 0), w: c.w, h: c.h };
}
