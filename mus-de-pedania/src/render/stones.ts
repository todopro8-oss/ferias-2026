// Piedras (garbanzos, alubias… aquí piedrecitas de río): el cuenco central, los montones
// de cada pareja y la pizarra del marcador con amarracos dibujados como palotes de tiza.

import { texto } from '../core/bitmapFont';
import { DERIVADOS as D, PALETA as P } from '../data/palette';
import { enAmarracos } from '../mus/scoring';
import { Pixeles } from './pixel';
import { LAYOUT } from './tableLayout';

const COLORES_PIEDRA = [D.gris_claro, D.papel_sombra, D.gris, P.tiza_sombra];

let piedraCache: HTMLCanvasElement[] | null = null;

function imagenesPiedra(): HTMLCanvasElement[] {
  if (piedraCache) return piedraCache;
  piedraCache = COLORES_PIEDRA.map((c) => {
    const p = new Pixeles(4, 3);
    p.rect(1, 0, 2, 1, P.negro);
    p.rect(0, 1, 4, 1, P.negro);
    p.rect(1, 2, 2, 1, P.negro);
    p.rect(1, 1, 2, 1, c);
    p.px(1, 1, D.blanco);
    return p.aCanvas();
  });
  return piedraCache;
}

export function dibujarPiedra(ctx: CanvasRenderingContext2D, x: number, y: number, variante = 0): void {
  const imgs = imagenesPiedra();
  ctx.drawImage(imgs[variante % imgs.length], Math.round(x), Math.round(y));
}

/** Posición de la piedra i-ésima dentro de un montón (se van apilando en pirámide). */
export function posicionEnMonton(base: { x: number; y: number }, i: number): { x: number; y: number } {
  const fila = Math.floor(i / 6);
  const col = i % 6;
  return { x: base.x + col * 3 + (fila % 2) * 1.5 - 8, y: base.y - fila * 2 };
}

export function dibujarMonton(ctx: CanvasRenderingContext2D, base: { x: number; y: number }, n: number): void {
  const visibles = Math.min(n, 30);
  for (let i = 0; i < visibles; i++) {
    const p = posicionEnMonton(base, i);
    dibujarPiedra(ctx, p.x, p.y, i * 7);
  }
}

export function dibujarCuenco(ctx: CanvasRenderingContext2D): void {
  const { x, y, w, h } = LAYOUT.cuenco;
  ctx.fillStyle = P.negro;
  ctx.fillRect(x + 1, y + 2, w - 2, h - 2);
  ctx.fillRect(x, y + 2, w, h - 4);
  ctx.fillStyle = D.copas_osc;
  ctx.fillRect(x + 1, y + 3, w - 2, h - 5);
  ctx.fillStyle = P.copas;
  ctx.fillRect(x + 2, y + 5, w - 4, h - 7);
  // Piedras asomando
  for (let i = 0; i < 7; i++) dibujarPiedra(ctx, x + 2 + i * 2.6, y + 1 + (i % 2), i);
  ctx.fillStyle = P.negro;
  ctx.fillRect(x + 2, y + h - 1, w - 4, 1);
}

/** Pizarra del marcador: «Nosotros» y «Ellos» con palotes (amarracos), piedras sueltas y cifra. */
export function dibujarPizarra(
  ctx: CanvasRenderingContext2D,
  marcador: [number, number],
  juegos: [number, number],
  juegosParaGanar: number,
  resaltar: [number, number] = [0, 0],
): void {
  const { x, y, w } = LAYOUT.pizarra;
  const filas: [string, number][] = [
    ['NOSOTROS', 0],
    ['ELLOS', 1],
  ];
  filas.forEach(([nombre, e], i) => {
    const fy = y + 3 + i * 19;
    const brilla = resaltar[e] > 0 && Math.floor(resaltar[e] / 100) % 2 === 0;
    const color = brilla ? P.oros : P.tiza;
    texto(ctx, nombre, x + 3, fy, color, { variante: 'tiza' });
    texto(ctx, String(marcador[e]), x + w - 3, fy, color, { variante: 'tiza', alinear: 'derecha' });
    // Juegos ganados (bolitas) si se juega al mejor de 3.
    if (juegosParaGanar > 1) {
      for (let k = 0; k < juegosParaGanar; k++) {
        ctx.fillStyle = k < juegos[e] ? P.oros : D.pizarra_clara;
        ctx.fillRect(x + 52 - 0 + k * 4, fy + 2, 3, 3);
      }
    }
    // Amarracos: palotes de tiza (cada 5 piedras); en grupos de 4 con uno cruzado.
    const { amarracos, piedras } = enAmarracos(marcador[e]);
    let px = x + 3;
    const py = fy + 9;
    for (let k = 0; k < amarracos; k++) {
      ctx.fillStyle = P.tiza;
      ctx.fillRect(px, py, 1, 6);
      if (k % 5 === 4) {
        // El quinto cruza los cuatro anteriores
        for (let j = 0; j < 13; j++) ctx.fillRect(px - 12 + j, py + 4 - Math.floor(j / 3), 1, 1);
        px += 4;
      } else px += 3;
    }
    for (let k = 0; k < piedras; k++) {
      ctx.fillStyle = P.tiza_sombra;
      ctx.fillRect(px + 2 + k * 3, py + 4, 2, 2);
    }
  });
}
