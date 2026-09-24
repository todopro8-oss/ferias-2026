// Lienzo de píxeles en memoria para el arte procedural: primitivas con bordes nítidos
// (sin antialias), contorno automático y volcado a canvas.

import { crearLienzo } from '../core/pantalla';
import { hexARgb } from '../data/palette';

const cacheColor = new Map<string, number>();

/** Color hex → entero RGBA empaquetado (little-endian: 0xAABBGGRR). */
export function empaquetar(hex: string, alfa = 255): number {
  const clave = `${hex}${alfa}`;
  const hecho = cacheColor.get(clave);
  if (hecho !== undefined) return hecho;
  const [r, g, b] = hexARgb(hex);
  const v = ((alfa << 24) | (b << 16) | (g << 8) | r) >>> 0;
  cacheColor.set(clave, v);
  return v;
}

export class Pixeles {
  readonly datos: Uint32Array;
  constructor(
    readonly ancho: number,
    readonly alto: number,
  ) {
    this.datos = new Uint32Array(ancho * alto);
  }

  clonar(): Pixeles {
    const p = new Pixeles(this.ancho, this.alto);
    p.datos.set(this.datos);
    return p;
  }

  dentro(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.ancho && y < this.alto;
  }

  get(x: number, y: number): number {
    return this.dentro(x, y) ? this.datos[y * this.ancho + x] : 0;
  }

  opaco(x: number, y: number): boolean {
    return this.get(x, y) >>> 24 > 0;
  }

  px(x: number, y: number, color: string | number): void {
    x = Math.round(x);
    y = Math.round(y);
    if (!this.dentro(x, y)) return;
    this.datos[y * this.ancho + x] = typeof color === 'number' ? color : empaquetar(color);
  }

  borrar(x: number, y: number): void {
    if (this.dentro(x, y)) this.datos[y * this.ancho + x] = 0;
  }

  rect(x: number, y: number, w: number, h: number, color: string): void {
    const c = empaquetar(color);
    for (let j = Math.max(0, Math.round(y)); j < Math.min(this.alto, Math.round(y + h)); j++)
      for (let i = Math.max(0, Math.round(x)); i < Math.min(this.ancho, Math.round(x + w)); i++)
        this.datos[j * this.ancho + i] = c;
  }

  rectBorde(x: number, y: number, w: number, h: number, color: string): void {
    this.linea(x, y, x + w - 1, y, color);
    this.linea(x, y + h - 1, x + w - 1, y + h - 1, color);
    this.linea(x, y, x, y + h - 1, color);
    this.linea(x + w - 1, y, x + w - 1, y + h - 1, color);
  }

  /** Bresenham. */
  linea(x0: number, y0: number, x1: number, y1: number, color: string): void {
    x0 = Math.round(x0);
    y0 = Math.round(y0);
    x1 = Math.round(x1);
    y1 = Math.round(y1);
    const c = empaquetar(color);
    const dx = Math.abs(x1 - x0);
    const dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      if (this.dentro(x0, y0)) this.datos[y0 * this.ancho + x0] = c;
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        x0 += sx;
      }
      if (e2 <= dx) {
        err += dx;
        y0 += sy;
      }
    }
  }

  /** Elipse rellena centrada en (cx, cy) con semiejes rx, ry (admite medios píxeles). */
  elipse(
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    color: string,
    filtro?: (x: number, y: number) => boolean,
  ): void {
    const c = empaquetar(color);
    const y0 = Math.floor(cy - ry);
    const y1 = Math.ceil(cy + ry);
    for (let y = y0; y <= y1; y++) {
      const dy = (y + 0.5 - cy) / ry;
      if (Math.abs(dy) > 1) continue;
      const w = rx * Math.sqrt(1 - dy * dy);
      const xa = Math.round(cx - w);
      const xb = Math.round(cx + w);
      for (let x = xa; x < xb; x++) {
        if (!this.dentro(x, y)) continue;
        if (filtro && !filtro(x, y)) continue;
        this.datos[y * this.ancho + x] = c;
      }
    }
  }

  /** Borde de elipse de 1 px. */
  elipseBorde(cx: number, cy: number, rx: number, ry: number, color: string): void {
    const tmp = new Pixeles(this.ancho, this.alto);
    tmp.elipse(cx, cy, rx, ry, '#FFFFFF');
    const c = empaquetar(color);
    for (let y = 0; y < this.alto; y++)
      for (let x = 0; x < this.ancho; x++) {
        if (!tmp.opaco(x, y)) continue;
        if (!tmp.opaco(x - 1, y) || !tmp.opaco(x + 1, y) || !tmp.opaco(x, y - 1) || !tmp.opaco(x, y + 1))
          this.datos[y * this.ancho + x] = c;
      }
  }

  /** Polígono relleno (regla par-impar, muestreo en el centro del píxel). */
  poligono(puntos: [number, number][], color: string): void {
    const c = empaquetar(color);
    const ys = puntos.map((p) => p[1]);
    const ymin = Math.max(0, Math.floor(Math.min(...ys)));
    const ymax = Math.min(this.alto - 1, Math.ceil(Math.max(...ys)));
    for (let y = ymin; y <= ymax; y++) {
      const yc = y + 0.5;
      const cortes: number[] = [];
      for (let i = 0; i < puntos.length; i++) {
        const [xa, ya] = puntos[i];
        const [xb, yb] = puntos[(i + 1) % puntos.length];
        if ((ya <= yc && yb > yc) || (yb <= yc && ya > yc)) cortes.push(xa + ((yc - ya) / (yb - ya)) * (xb - xa));
      }
      cortes.sort((a, b) => a - b);
      for (let k = 0; k + 1 < cortes.length; k += 2) {
        for (let x = Math.round(cortes[k]); x < Math.round(cortes[k + 1]); x++) {
          if (x >= 0 && x < this.ancho) this.datos[y * this.ancho + x] = c;
        }
      }
    }
  }

  /** Rellena con un patrón de tramado 2×2 (dos colores) dentro de un rectángulo. */
  trama(x: number, y: number, w: number, h: number, a: string, b: string, soloOpacos = false): void {
    const ca = empaquetar(a);
    const cb = empaquetar(b);
    for (let j = y; j < y + h; j++)
      for (let i = x; i < x + w; i++) {
        if (!this.dentro(i, j)) continue;
        if (soloOpacos && !this.opaco(i, j)) continue;
        this.datos[j * this.ancho + i] = (i + j) % 2 === 0 ? ca : cb;
      }
  }

  /** Sustituye un color por otro (para variantes y rampas). */
  sustituir(de: string, a: string): void {
    const cde = empaquetar(de);
    const ca = empaquetar(a);
    for (let i = 0; i < this.datos.length; i++) if (this.datos[i] === cde) this.datos[i] = ca;
  }

  /** Contorno exterior de 1 px alrededor de lo opaco. */
  contorno(color: string, diagonales = false): void {
    const c = empaquetar(color);
    const orig = this.datos.slice();
    const op = (x: number, y: number) =>
      x >= 0 && y >= 0 && x < this.ancho && y < this.alto && orig[y * this.ancho + x] >>> 24 > 0;
    for (let y = 0; y < this.alto; y++)
      for (let x = 0; x < this.ancho; x++) {
        if (op(x, y)) continue;
        let vecino = op(x - 1, y) || op(x + 1, y) || op(x, y - 1) || op(x, y + 1);
        if (!vecino && diagonales)
          vecino = op(x - 1, y - 1) || op(x + 1, y - 1) || op(x - 1, y + 1) || op(x + 1, y + 1);
        if (vecino) this.datos[y * this.ancho + x] = c;
      }
  }

  /** Pega otro lienzo encima (sólo lo opaco). */
  pegar(otro: Pixeles, dx: number, dy: number, espejo = false): void {
    for (let y = 0; y < otro.alto; y++)
      for (let x = 0; x < otro.ancho; x++) {
        const v = otro.datos[y * otro.ancho + (espejo ? otro.ancho - 1 - x : x)];
        if (v >>> 24 === 0) continue;
        const tx = x + dx;
        const ty = y + dy;
        if (this.dentro(tx, ty)) this.datos[ty * this.ancho + tx] = v;
      }
  }

  espejado(): Pixeles {
    const p = new Pixeles(this.ancho, this.alto);
    for (let y = 0; y < this.alto; y++)
      for (let x = 0; x < this.ancho; x++)
        p.datos[y * this.ancho + x] = this.datos[y * this.ancho + this.ancho - 1 - x];
    return p;
  }

  aCanvas(): HTMLCanvasElement {
    const { canvas, ctx } = crearLienzo(this.ancho, this.alto);
    this.volcar(ctx, 0, 0);
    return canvas;
  }

  volcar(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const img = ctx.createImageData(this.ancho, this.alto);
    new Uint32Array(img.data.buffer).set(this.datos);
    ctx.putImageData(img, x, y);
  }
}

/** Dibuja un rectángulo con fillRect alineado a píxel (atajo para la UI). */
export function caja(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

export function marco(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string): void {
  ctx.fillStyle = color;
  x = Math.round(x);
  y = Math.round(y);
  ctx.fillRect(x, y, w, 1);
  ctx.fillRect(x, y + h - 1, w, 1);
  ctx.fillRect(x, y, 1, h);
  ctx.fillRect(x + w - 1, y, 1, h);
}
