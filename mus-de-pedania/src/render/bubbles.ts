// Bocadillos de texto: como mucho 2 líneas de 22 caracteres, con piquito hacia quien habla.

import { ALTO_LINEA, AVANCE, envolver, texto } from '../core/bitmapFont';
import { PALETA as P } from '../data/palette';
import { caja } from './pixel';

export interface Bocadillo {
  texto: string;
  lineas: string[];
  x: number;
  y: number;
  lado: 'arriba' | 'izquierda' | 'derecha';
  restante: number;
  total: number;
  /** Tinta de color (rojo para órdagos, azul para señas cazadas…). */
  tinta?: string;
  nombre?: string;
}

export const MAX_CARACTERES = 22;
export const MAX_LINEAS = 2;

export function crearBocadillo(
  t: string,
  ancla: { x: number; y: number; lado: 'arriba' | 'izquierda' | 'derecha' },
  ms: number,
  op: { tinta?: string; nombre?: string; maxLineas?: number } = {},
): Bocadillo {
  const lineas = envolver(t, MAX_CARACTERES).slice(0, op.maxLineas ?? MAX_LINEAS);
  return { texto: t, lineas, x: ancla.x, y: ancla.y, lado: ancla.lado, restante: ms, total: ms, ...op };
}

export function medidasBocadillo(b: Bocadillo): { x: number; y: number; w: number; h: number } {
  const anchoTexto = Math.max(...b.lineas.map((l) => [...l].length)) * AVANCE - 1;
  const w = Math.max(anchoTexto + 8, 20);
  const h = b.lineas.length * (ALTO_LINEA - 1) + 5;
  let x: number;
  let y: number;
  if (b.lado === 'arriba') {
    x = b.x - w / 2;
    y = b.y - h - 5;
  } else if (b.lado === 'izquierda') {
    // El que habla está a la izquierda: el bocadillo sale hacia la derecha.
    x = b.x + 8;
    y = b.y - h - 8;
  } else {
    x = b.x - w - 8;
    y = b.y - h - 8;
  }
  x = Math.max(2, Math.min(318 - w, Math.round(x)));
  y = Math.max(2, Math.round(y));
  return { x, y, w, h };
}

export function dibujarBocadillo(ctx: CanvasRenderingContext2D, b: Bocadillo): void {
  const { x, y, w, h } = medidasBocadillo(b);
  // Aparece con un pequeño «pop» y se desvanece al final (a saltos, sin mezclas suaves).
  if (b.restante < 150 && Math.floor(b.restante / 50) % 2 === 0) return;
  // Piquito
  const px = b.lado === 'arriba' ? b.x : b.lado === 'izquierda' ? x + 6 : x + w - 7;
  const py = y + h;
  ctx.fillStyle = P.negro;
  for (let k = 0; k < 5; k++) {
    const dir = b.lado === 'izquierda' ? -1 : b.lado === 'derecha' ? 1 : 0;
    ctx.fillRect(Math.round(px + dir * k - 1), py + k - 1, 3, 1);
  }
  ctx.fillStyle = P.papel;
  for (let k = 0; k < 4; k++) {
    const dir = b.lado === 'izquierda' ? -1 : b.lado === 'derecha' ? 1 : 0;
    ctx.fillRect(Math.round(px + dir * k), py + k - 1, 1, 1);
  }
  // Cuerpo con esquinas redondeadas
  caja(ctx, x + 1, y, w - 2, h, P.negro);
  caja(ctx, x, y + 1, w, h - 2, P.negro);
  caja(ctx, x + 1, y + 1, w - 2, h - 2, P.papel);
  b.lineas.forEach((l, i) => {
    texto(ctx, l, x + 4, y + 3 + i * (ALTO_LINEA - 1), b.tinta ?? P.tinta);
  });
}
