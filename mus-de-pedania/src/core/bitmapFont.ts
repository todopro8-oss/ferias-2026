// Fuente bitmap propia de 5×7 con avance de 6 px, definida en código.
// Cada glifo ocupa una celda de 5×11: filas −2 y −1 para las tildes de las mayúsculas,
// 0..6 para el cuerpo y 7..8 para los descendentes. El origen (x, y) es la fila 0.
// Variantes: normal (un color), tiza (con ruido de 1 px), dorada (degradado por filas),
// y negrita (cada píxel duplicado en horizontal, avance 7) para títulos.

import { crearLienzo } from './pantalla';
import { hexARgb } from '../data/palette';

export const AVANCE = 6;
export const AVANCE_NEGRITA = 7;
export const ALTO_LINEA = 11;
const FILAS = 11;
const FILA0 = 2; // índice de la fila 0 dentro de la celda

type Glifo = string[]; // filas −2..8 (11 cadenas de 5 caracteres)

// Filas 0..6 (y 7..8 si hay descendente), separadas por espacios.
const BASE: Record<string, string> = {
  ' ': '..... ..... ..... ..... ..... ..... .....',
  '!': '..#.. ..#.. ..#.. ..#.. ..#.. ..... ..#..',
  '"': '.#.#. .#.#. .#.#. ..... ..... ..... .....',
  '#': '.#.#. .#.#. ##### .#.#. ##### .#.#. .#.#.',
  $: '..#.. .#### #.#.. .###. ..#.# ####. ..#..',
  '%': '##... ##..# ...#. ..#.. .#... #..## ...##',
  '&': '.##.. #..#. #.#.. .#... #.#.# #..#. .##.#',
  "'": '..#.. ..#.. ..... ..... ..... ..... .....',
  '(': '...#. ..#.. .#... .#... .#... ..#.. ...#.',
  ')': '.#... ..#.. ...#. ...#. ...#. ..#.. .#...',
  '*': '..... ..#.. #.#.# .###. #.#.# ..#.. .....',
  '+': '..... ..#.. ..#.. ##### ..#.. ..#.. .....',
  ',': '..... ..... ..... ..... .##.. .##.. ..#.. .#...',
  '-': '..... ..... ..... .###. ..... ..... .....',
  '.': '..... ..... ..... ..... ..... .##.. .##..',
  '/': '..... ....# ...#. ..#.. .#... #.... .....',
  '0': '.###. #...# #..## #.#.# ##..# #...# .###.',
  '1': '..#.. .##.. ..#.. ..#.. ..#.. ..#.. .###.',
  '2': '.###. #...# ....# ...#. ..#.. .#... #####',
  '3': '##### ...#. ..#.. ...#. ....# #...# .###.',
  '4': '...#. ..##. .#.#. #..#. ##### ...#. ...#.',
  '5': '##### #.... ####. ....# ....# #...# .###.',
  '6': '..##. .#... #.... ####. #...# #...# .###.',
  '7': '##### ....# ...#. ..#.. .#... .#... .#...',
  '8': '.###. #...# #...# .###. #...# #...# .###.',
  '9': '.###. #...# #...# .#### ....# ...#. .##..',
  ':': '..... .##.. .##.. ..... .##.. .##.. .....',
  ';': '..... .##.. .##.. ..... .##.. .##.. ..#.. .#...',
  '<': '...#. ..#.. .#... #.... .#... ..#.. ...#.',
  '=': '..... ..... ##### ..... ##### ..... .....',
  '>': '.#... ..#.. ...#. ....# ...#. ..#.. .#...',
  '?': '.###. #...# ....# ...#. ..#.. ..... ..#..',
  '@': '.###. #...# ....# .##.# #.#.# #.#.# .###.',
  A: '.###. #...# #...# #...# ##### #...# #...#',
  B: '####. #...# #...# ####. #...# #...# ####.',
  C: '.###. #...# #.... #.... #.... #...# .###.',
  D: '###.. #..#. #...# #...# #...# #..#. ###..',
  E: '##### #.... #.... ####. #.... #.... #####',
  F: '##### #.... #.... ####. #.... #.... #....',
  G: '.###. #...# #.... #.### #...# #...# .####',
  H: '#...# #...# #...# ##### #...# #...# #...#',
  I: '.###. ..#.. ..#.. ..#.. ..#.. ..#.. .###.',
  J: '..### ...#. ...#. ...#. ...#. #..#. .##..',
  K: '#...# #..#. #.#.. ##... #.#.. #..#. #...#',
  L: '#.... #.... #.... #.... #.... #.... #####',
  M: '#...# ##.## #.#.# #.#.# #...# #...# #...#',
  N: '#...# #...# ##..# #.#.# #..## #...# #...#',
  O: '.###. #...# #...# #...# #...# #...# .###.',
  P: '####. #...# #...# ####. #.... #.... #....',
  Q: '.###. #...# #...# #...# #.#.# #..#. .##.#',
  R: '####. #...# #...# ####. #.#.. #..#. #...#',
  S: '.#### #.... #.... .###. ....# ....# ####.',
  T: '##### ..#.. ..#.. ..#.. ..#.. ..#.. ..#..',
  U: '#...# #...# #...# #...# #...# #...# .###.',
  V: '#...# #...# #...# #...# #...# .#.#. ..#..',
  W: '#...# #...# #...# #.#.# #.#.# #.#.# .#.#.',
  X: '#...# #...# .#.#. ..#.. .#.#. #...# #...#',
  Y: '#...# #...# #...# .#.#. ..#.. ..#.. ..#..',
  Z: '##### ....# ...#. ..#.. .#... #.... #####',
  '[': '.###. .#... .#... .#... .#... .#... .###.',
  '\\': '..... #.... .#... ..#.. ...#. ....# .....',
  ']': '.###. ...#. ...#. ...#. ...#. ...#. .###.',
  '^': '..#.. .#.#. #...# ..... ..... ..... .....',
  _: '..... ..... ..... ..... ..... ..... #####',
  '`': '.#... ..#.. ..... ..... ..... ..... .....',
  a: '..... ..... .###. ....# .#### #...# .####',
  b: '#.... #.... #.##. ##..# #...# #...# ####.',
  c: '..... ..... .###. #.... #.... #...# .###.',
  d: '....# ....# .##.# #..## #...# #...# .####',
  e: '..... ..... .###. #...# ##### #.... .###.',
  f: '..##. .#..# .#... ###.. .#... .#... .#...',
  g: '..... ..... .#### #...# #...# .#### ....# .###.',
  h: '#.... #.... #.##. ##..# #...# #...# #...#',
  i: '..#.. ..... .##.. ..#.. ..#.. ..#.. .###.',
  j: '...#. ..... ..##. ...#. ...#. ...#. ...#. #..#. .##..',
  k: '#.... #.... #..#. #.#.. ##... #.#.. #..#.',
  l: '.##.. ..#.. ..#.. ..#.. ..#.. ..#.. .###.',
  m: '..... ..... ##.#. #.#.# #.#.# #...# #...#',
  n: '..... ..... #.##. ##..# #...# #...# #...#',
  o: '..... ..... .###. #...# #...# #...# .###.',
  p: '..... ..... ####. #...# #...# ####. #.... #....',
  q: '..... ..... .#### #...# #...# .#### ....# ....#',
  r: '..... ..... #.##. ##..# #.... #.... #....',
  s: '..... ..... .###. #.... .###. ....# ####.',
  t: '.#... .#... ###.. .#... .#... .#..# ..##.',
  u: '..... ..... #...# #...# #...# #..## .##.#',
  v: '..... ..... #...# #...# #...# .#.#. ..#..',
  w: '..... ..... #...# #...# #.#.# #.#.# .#.#.',
  x: '..... ..... #...# .#.#. ..#.. .#.#. #...#',
  y: '..... ..... #...# #...# #...# .#### ....# .###.',
  z: '..... ..... ##### ...#. ..#.. .#... #####',
  '{': '...#. ..#.. ..#.. .#... ..#.. ..#.. ...#.',
  '|': '..#.. ..#.. ..#.. ..#.. ..#.. ..#.. ..#..',
  '}': '.#... ..#.. ..#.. ...#. ..#.. ..#.. .#...',
  '~': '..... ..... .#... #.#.# ...#. ..... .....',
  '¡': '..#.. ..... ..#.. ..#.. ..#.. ..#.. ..#..',
  '¿': '..#.. ..... ..#.. .#... #.... #...# .###.',
  '«': '..... ..#.# .#.#. #.#.. .#.#. ..#.# .....',
  '»': '..... #.#.. .#.#. ..#.# .#.#. #.#.. .....',
  '·': '..... ..... ..... ..#.. ..... ..... .....',
  '…': '..... ..... ..... ..... ..... ..... #.#.#',
  '×': '..... #...# .#.#. ..#.. .#.#. #...# .....',
  '−': '..... ..... ..... ##### ..... ..... .....',
  '—': '..... ..... ..... ##### ..... ..... .....',
  º: '.##.. #..#. .##.. ..... ..... ..... .....',
  '◂': '..... ...#. ..##. .###. ..##. ...#. .....',
  '→': '..... ..#.. ...#. ##### ...#. ..#.. .....',
  '←': '..... ..#.. .#... ##### .#... ..#.. .....',
  '↑': '..#.. .###. #.#.# ..#.. ..#.. ..#.. .....',
  '↓': '..#.. ..#.. ..#.. #.#.# .###. ..#.. .....',
  '★': '..#.. ..#.. ##### .###. .#.#. #...# .....',
  '▸': '..... .#... .##.. .###. .##.. .#... .....',
  '♪': '..##. ..#.# ..#.. ..#.. ###.. ###.. .....',
  // Iconos propios (caracteres de uso privado): palos y flechas.
  '\u0001': '.###. #####  ##.## ##### .###. ..... .....', // oros
  '\u0002': '..#.. .###. ..#.. .###. ##### ..... .....',
  '\u0003': '..#.. ..#.. .###. ..#.. ..#.. ..... .....',
  '\u0004': '..#.. .###. ##### ..#.. .###. ..... .....',
  '\u0005': '..#.. .###. ##### ..#.. ..#.. ..#.. .....', // flecha arriba
  '\u0006': '..#.. ..#.. ..#.. ##### .###. ..#.. .....', // flecha abajo
};

const ACENTO_MAYUS: Record<string, [string, string]> = {
  agudo: ['...#.', '..#..'],
  dieresis: ['.....', '.#.#.'],
  tilde: ['.##.#', '#.##.'],
};

const ACENTUADAS: Record<string, [string, keyof typeof ACENTO_MAYUS]> = {
  Á: ['A', 'agudo'],
  É: ['E', 'agudo'],
  Í: ['I', 'agudo'],
  Ó: ['O', 'agudo'],
  Ú: ['U', 'agudo'],
  Ü: ['U', 'dieresis'],
  Ñ: ['N', 'tilde'],
  á: ['a', 'agudo'],
  é: ['e', 'agudo'],
  í: ['ı', 'agudo'],
  ó: ['o', 'agudo'],
  ú: ['u', 'agudo'],
  ü: ['u', 'dieresis'],
  ñ: ['n', 'tilde'],
};

function construirGlifos(): Map<string, Glifo> {
  const mapa = new Map<string, Glifo>();
  const vacio = '.....';
  for (const [ch, def] of Object.entries(BASE)) {
    const filas = def.split(/\s+/).filter(Boolean);
    while (filas.length < 9) filas.push(vacio);
    mapa.set(ch, [vacio, vacio, ...filas.slice(0, 9)]);
  }
  // «ı» auxiliar: la i sin punto, para la í.
  mapa.set('ı', [vacio, vacio, vacio, vacio, '.##..', '..#..', '..#..', '..#..', '.###.', vacio, vacio]);
  for (const [ch, [base, tipo]] of Object.entries(ACENTUADAS)) {
    const g = [...mapa.get(base)!];
    const [a, b] = ACENTO_MAYUS[tipo];
    if (base === base.toUpperCase() && base !== 'ı') {
      g[0] = a;
      g[1] = b;
    } else {
      // Minúsculas: el acento va en las filas 0 y 1, encima de la altura de la x.
      g[FILA0] = a;
      g[FILA0 + 1] = b;
    }
    mapa.set(ch, g);
  }
  return mapa;
}

const GLIFOS = construirGlifos();
const CARACTERES = [...GLIFOS.keys()];
const INDICE = new Map(CARACTERES.map((c, i) => [c, i]));

export type Variante = 'normal' | 'tiza' | 'dorada';

interface Atlas {
  canvas: HTMLCanvasElement;
  ancho: number;
}

const atlas = new Map<string, Atlas>();

function hash(a: number, b: number, c: number): number {
  let h = (a * 374761393 + b * 668265263 + c * 2147483647) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function obtenerAtlas(color: string, variante: Variante, negrita: boolean): Atlas {
  const clave = `${color}|${variante}|${negrita ? 1 : 0}`;
  const hecho = atlas.get(clave);
  if (hecho) return hecho;
  const anchoCelda = negrita ? 6 : 5;
  const { canvas, ctx } = crearLienzo(anchoCelda * CARACTERES.length, FILAS);
  const img = ctx.createImageData(canvas.width, canvas.height);
  const [r, g, b] = hexARgb(color);
  CARACTERES.forEach((ch, i) => {
    const glifo = GLIFOS.get(ch)!;
    for (let fy = 0; fy < FILAS; fy++) {
      const fila = glifo[fy];
      for (let fx = 0; fx < 5; fx++) {
        if (fila[fx] !== '#') continue;
        for (let dx = 0; dx < (negrita ? 2 : 1); dx++) {
          const px = i * anchoCelda + fx + dx;
          const o = (fy * canvas.width + px) * 4;
          let k = 1;
          if (variante === 'tiza') k = hash(i, fx + dx, fy) < 0.14 ? 0.72 : 1;
          if (variante === 'dorada') k = 1.25 - (fy / FILAS) * 0.55;
          img.data[o] = Math.min(255, r * k);
          img.data[o + 1] = Math.min(255, g * k);
          img.data[o + 2] = Math.min(255, b * k * (variante === 'dorada' ? 0.9 : 1));
          img.data[o + 3] = 255;
        }
      }
    }
  });
  ctx.putImageData(img, 0, 0);
  const a = { canvas, ancho: anchoCelda };
  atlas.set(clave, a);
  return a;
}

export interface OpcionesTexto {
  variante?: Variante;
  negrita?: boolean;
  /** Color de sombra a (+1, +1). */
  sombra?: string;
  /** Escala entera (2 para rótulos grandes). */
  escala?: number;
  /** Alineación respecto a x. */
  alinear?: 'izquierda' | 'centro' | 'derecha';
}

export function medir(texto: string, op: OpcionesTexto = {}): number {
  const av = op.negrita ? AVANCE_NEGRITA : AVANCE;
  const n = [...texto].length;
  return n === 0 ? 0 : (n * av - 1) * (op.escala ?? 1);
}

/** Dibuja texto con la fuente bitmap. (x, y) es la esquina de la fila 0 (altura de las mayúsculas). */
export function texto(
  ctx: CanvasRenderingContext2D,
  s: string,
  x: number,
  y: number,
  color: string,
  op: OpcionesTexto = {},
): number {
  const escala = op.escala ?? 1;
  const ancho = medir(s, op);
  let x0 = Math.round(x);
  if (op.alinear === 'centro') x0 = Math.round(x - ancho / 2);
  else if (op.alinear === 'derecha') x0 = Math.round(x - ancho);
  const y0 = Math.round(y) - FILA0 * escala;
  if (op.sombra) texto(ctx, s, x0 + escala, y + escala, op.sombra, { ...op, sombra: undefined, alinear: 'izquierda' });
  const a = obtenerAtlas(color, op.variante ?? 'normal', !!op.negrita);
  const av = (op.negrita ? AVANCE_NEGRITA : AVANCE) * escala;
  let cx = x0;
  for (const ch of s) {
    const i = INDICE.get(ch) ?? INDICE.get('?')!;
    if (ch !== ' ') {
      ctx.drawImage(a.canvas, i * a.ancho, 0, a.ancho, FILAS, cx, y0, a.ancho * escala, FILAS * escala);
    }
    cx += av;
  }
  return ancho;
}

/** Parte un texto en líneas de como mucho `maxCaracteres`, respetando palabras. */
export function envolver(s: string, maxCaracteres: number): string[] {
  const palabras = s.split(/\s+/).filter(Boolean);
  const lineas: string[] = [];
  let actual = '';
  for (const p of palabras) {
    let palabra = p;
    while ([...palabra].length > maxCaracteres) {
      if (actual) {
        lineas.push(actual);
        actual = '';
      }
      lineas.push([...palabra].slice(0, maxCaracteres).join(''));
      palabra = [...palabra].slice(maxCaracteres).join('');
    }
    const prueba = actual ? `${actual} ${palabra}` : palabra;
    if ([...prueba].length <= maxCaracteres) actual = prueba;
    else {
      lineas.push(actual);
      actual = palabra;
    }
  }
  if (actual) lineas.push(actual);
  return lineas;
}

/** ¿Tiene glifo este carácter? (para los tests de textos). */
export function tieneGlifo(ch: string): boolean {
  return GLIFOS.has(ch);
}
