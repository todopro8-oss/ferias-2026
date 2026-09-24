// Baraja española dibujada desde cero (sección 11.3), con la iconografía tradicional
// genérica: monedas, cálices, espadas y bastos; «pinta» en el marco según el palo.
// Tamaños: 38×58 (tus cartas), 24×36 (destape) y 12×14 (dorsos en la mesa).

import { numero, palo, type Carta } from '../mus/cards';
import { DERIVADOS as D, PALETA as P } from '../data/palette';
import { Pixeles } from './pixel';

export const CARTA_W = 38;
export const CARTA_H = 58;
export const MINI_W = 24;
export const MINI_H = 36;
export const DORSO_W = 12;
export const DORSO_H = 14;

const COLOR_PALO = [P.oros, P.copas, P.espadas, P.bastos];
const OSCURO_PALO = [D.oros_osc, D.copas_osc, D.espadas_osc, D.bastos_osc];
const BRILLO_PALO = [D.oros_brillo, D.copas_brillo, D.espadas_brillo, D.bastos_brillo];

const DIGITOS: Record<string, string> = {
  '0': '### #.# #.# #.# ###',
  '1': '.#. ##. .#. .#. ###',
  '2': '### ..# ### #.. ###',
  '3': '### ..# .## ..# ###',
  '4': '#.# #.# ### ..# ..#',
  '5': '### #.. ### ..# ###',
  '6': '### #.. ### #.# ###',
  '7': '### ..# .#. .#. .#.',
  '8': '### #.# ### #.# ###',
  '9': '### #.# ### ..# ###',
};

function digitos(p: Pixeles, s: string, x: number, y: number, color: string): void {
  let cx = x;
  for (const ch of s) {
    const filas = DIGITOS[ch].split(' ');
    filas.forEach((f, j) => [...f].forEach((c, i) => c === '#' && p.px(cx + i, y + j, color)));
    cx += 4;
  }
}

// ---------------------------------------------------------------------------
// Pips
// ---------------------------------------------------------------------------

function oro(p: Pixeles, cx: number, cy: number, r: number): void {
  p.elipse(cx, cy, r + 1, r + 1, P.negro);
  p.elipse(cx, cy, r, r, P.oros);
  p.elipse(cx - r * 0.25, cy - r * 0.25, r * 0.45, r * 0.45, D.oros_brillo);
  if (r >= 3) {
    p.elipseBorde(cx, cy, r * 0.62, r * 0.62, D.oros_osc);
    p.px(cx, cy, D.oros_osc);
  }
  if (r >= 7) {
    // As de oros: rostro de sol estilizado.
    p.elipse(cx, cy, r * 0.4, r * 0.4, D.oros_brillo);
    p.px(cx - 2, cy - 1, P.tinta);
    p.px(cx + 1, cy - 1, P.tinta);
    p.linea(cx - 1, cy + 2, cx + 1, cy + 2, D.oros_osc);
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2;
      p.px(cx + Math.cos(a) * r * 0.82, cy + Math.sin(a) * r * 0.82, D.oros_osc);
    }
  }
}

function copa(p: Pixeles, cx: number, cy: number, s: number): void {
  // s = escala (1 normal, 2 as).
  const w = 3 * s;
  const top = cy - 4 * s;
  // Cáliz: copa, tallo y pie.
  p.elipse(cx, top + 2 * s, w + 1, 2.5 * s + 1, P.negro);
  p.poligono(
    [
      [cx - w - 1, top + 1 * s],
      [cx + w + 1, top + 1 * s],
      [cx + 1.5 * s + 1, top + 4.5 * s + 1],
      [cx - 1.5 * s - 1, top + 4.5 * s + 1],
    ],
    P.negro,
  );
  p.elipse(cx, top + 2 * s, w, 2.5 * s, P.copas);
  p.poligono(
    [
      [cx - w, top + 1 * s],
      [cx + w, top + 1 * s],
      [cx + 1.5 * s, top + 4.5 * s],
      [cx - 1.5 * s, top + 4.5 * s],
    ],
    P.copas,
  );
  p.rect(cx - w + 1, top + s, Math.max(1, s), 2 * s, D.copas_brillo);
  p.rect(cx - Math.max(1, s * 0.5), top + 4.5 * s, Math.max(2, s), 2.5 * s, D.oros_osc);
  p.rect(cx - 2 * s - 1, top + 7 * s - 1, 4 * s + 2, Math.max(2, s) + 2, P.negro);
  p.rect(cx - 2 * s, top + 7 * s, 4 * s, Math.max(1, s), P.oros);
  p.rect(cx - w, top + 1 * s - 1, 2 * w, 1, D.oros_osc);
}

/** Espada de (x0, y0) punta a (x1, y1) empuñadura. */
function espada(p: Pixeles, x0: number, y0: number, x1: number, y1: number, grande = false): void {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  const nx = -uy;
  const ny = ux;
  const hoja = grande ? 1.5 : 0.8;
  const puno = len * 0.72;
  // Hoja
  for (let t = 0; t <= puno; t += 0.5) {
    const x = x0 + ux * t;
    const y = y0 + uy * t;
    for (let k = -hoja - 0.8; k <= hoja + 0.8; k += 0.5) p.px(x + nx * k, y + ny * k, P.negro);
  }
  for (let t = 0.5; t <= puno; t += 0.5) {
    const x = x0 + ux * t;
    const y = y0 + uy * t;
    for (let k = -hoja + 0.2; k <= hoja - 0.2; k += 0.5) p.px(x + nx * k, y + ny * k, P.espadas);
    p.px(x + nx * (hoja - 0.4), y + ny * (hoja - 0.4), D.espadas_brillo);
  }
  // Guarda
  const gx = x0 + ux * puno;
  const gy = y0 + uy * puno;
  const ga = grande ? 5 : 3;
  p.linea(gx - nx * ga, gy - ny * ga, gx + nx * ga, gy + ny * ga, P.negro);
  p.linea(gx - nx * (ga - 1) + ux, gy - ny * (ga - 1) + uy, gx + nx * (ga - 1) + ux, gy + ny * (ga - 1) + uy, P.oros);
  // Puño y pomo
  p.linea(gx + ux * 2, gy + uy * 2, x1, y1, D.oros_osc);
  p.elipse(x1 + 0.5, y1 + 0.5, grande ? 2 : 1.2, grande ? 2 : 1.2, P.oros);
}

/** Basto (garrote nudoso) de (x0, y0) cabeza gruesa a (x1, y1) mango. */
function basto(p: Pixeles, x0: number, y0: number, x1: number, y1: number, grande = false): void {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  const nx = -uy;
  const ny = ux;
  const g = grande ? 2.2 : 1;
  for (let t = 0; t <= len; t += 0.5) {
    const r = g * (1.9 - 0.9 * (t / len)) + 0.2;
    const x = x0 + ux * t;
    const y = y0 + uy * t;
    for (let k = -r - 0.7; k <= r + 0.7; k += 0.5) p.px(x + nx * k, y + ny * k, P.negro);
  }
  for (let t = 0.5; t <= len - 0.5; t += 0.5) {
    const r = g * (1.9 - 0.9 * (t / len)) - 0.3;
    const x = x0 + ux * t;
    const y = y0 + uy * t;
    for (let k = -r; k <= r; k += 0.5) p.px(x + nx * k, y + ny * k, P.bastos);
    p.px(x - nx * r * 0.6, y - ny * r * 0.6, D.bastos_brillo);
  }
  // Nudos
  for (const f of [0.22, 0.5, 0.75]) {
    const x = x0 + ux * len * f;
    const y = y0 + uy * len * f;
    const r = g * (1.9 - 0.9 * f) + 0.6;
    p.px(x + nx * r, y + ny * r, D.bastos_osc);
    p.px(x + nx * (r + 0.6), y + ny * (r + 0.6), D.bastos_osc);
  }
}

/** Dibuja un pip «inclinado» (espada o basto) centrado en (cx, cy) con ángulo. */
function palito(pal: number, p: Pixeles, cx: number, cy: number, ang: number, largo: number, grande = false): void {
  const ux = Math.sin(ang);
  const uy = -Math.cos(ang);
  const x0 = cx + (ux * largo) / 2;
  const y0 = cy + (uy * largo) / 2;
  const x1 = cx - (ux * largo) / 2;
  const y1 = cy - (uy * largo) / 2;
  if (pal === 2) espada(p, x0, y0, x1, y1, grande);
  else basto(p, x0, y0, x1, y1, grande);
}

function pip(pal: number, p: Pixeles, cx: number, cy: number, escala = 1): void {
  if (pal === 0) oro(p, cx, cy, 3.5 * escala);
  else if (pal === 1) copa(p, cx, cy, escala);
  else palito(pal, p, cx, cy, 0, 11 * escala, escala > 1);
}

const DISPOSICION_REDONDA: Record<number, [number, number][]> = {
  2: [
    [19, 19],
    [19, 40],
  ],
  3: [
    [19, 15],
    [19, 29],
    [19, 43],
  ],
  4: [
    [12, 19],
    [26, 19],
    [12, 39],
    [26, 39],
  ],
  5: [
    [12, 17],
    [26, 17],
    [19, 29],
    [12, 41],
    [26, 41],
  ],
  6: [
    [12, 16],
    [26, 16],
    [12, 29],
    [26, 29],
    [12, 42],
    [26, 42],
  ],
  7: [
    [11, 15],
    [27, 15],
    [19, 22],
    [11, 30],
    [27, 30],
    [11, 44],
    [27, 44],
  ],
};

/** Filas de espadas/bastos: 'X' cruz de dos, 'V' uno vertical, 'XV' tres cruzados. */
const DISPOSICION_CRUZADA: Record<number, [string, number][]> = {
  2: [['X', 29]],
  3: [['XV', 29]],
  4: [
    ['X', 19],
    ['X', 39],
  ],
  5: [
    ['X', 17],
    ['V', 29],
    ['X', 41],
  ],
  6: [
    ['X', 16],
    ['X', 29],
    ['X', 42],
  ],
  7: [
    ['X', 15],
    ['XV', 29],
    ['X', 43],
  ],
};

// ---------------------------------------------------------------------------
// Figuras (sota, caballo, rey) de diseño propio
// ---------------------------------------------------------------------------

function cara(p: Pixeles, cx: number, cy: number, barba: boolean): void {
  p.elipse(cx, cy, 3.5, 4, P.negro);
  p.elipse(cx, cy, 2.6, 3.1, P.piel_1);
  p.px(cx - 1, cy - 1, P.tinta);
  p.px(cx + 1, cy - 1, P.tinta);
  p.px(cx, cy + 1, D.piel_1_sombra);
  if (barba) {
    p.rect(cx - 2, cy + 1, 5, 2, D.gris_claro);
    p.rect(cx - 1, cy + 3, 3, 1, D.gris_claro);
    p.px(cx, cy + 1, D.rojo_labios);
  } else {
    p.px(cx, cy + 2, D.rojo_labios);
  }
}

function sota(p: Pixeles, pal: number): void {
  const c = COLOR_PALO[pal];
  const o = OSCURO_PALO[pal];
  const b = BRILLO_PALO[pal];
  // Piernas y zapatos
  p.rect(15, 38, 3, 9, P.negro);
  p.rect(20, 38, 3, 9, P.negro);
  p.rect(16, 38, 1, 8, D.copas_osc);
  p.rect(21, 38, 1, 8, D.copas_osc);
  p.rect(14, 46, 4, 2, P.tinta);
  p.rect(20, 46, 4, 2, P.tinta);
  // Túnica
  p.poligono(
    [
      [13, 21],
      [25, 21],
      [27, 39],
      [11, 39],
    ],
    P.negro,
  );
  p.poligono(
    [
      [14, 22],
      [24, 22],
      [26, 38],
      [12, 38],
    ],
    c,
  );
  p.linea(19, 22, 19, 38, o);
  p.linea(12, 36, 26, 36, P.oros);
  p.linea(14, 23, 14, 30, b);
  // Cinturón
  p.rect(13, 30, 13, 1, P.madera_osc);
  // Cuello y cabeza
  cara(p, 19, 16, false);
  // Gorro con pluma
  p.rect(14, 11, 10, 3, P.negro);
  p.rect(15, 11, 8, 2, o);
  p.rect(13, 13, 12, 1, P.negro);
  p.linea(23, 11, 26, 8, D.papel_sombra);
  p.linea(24, 11, 27, 9, D.copas_brillo);
  // Brazos y objeto
  p.rect(10, 23, 3, 9, P.negro);
  p.rect(11, 24, 1, 7, c);
  p.rect(26, 23, 3, 8, P.negro);
  p.rect(27, 24, 1, 6, c);
  if (pal === 0) oro(p, 28, 33, 3);
  else if (pal === 1) copa(p, 29, 31, 0.8);
  else if (pal === 2) espada(p, 29, 12, 28, 33);
  else basto(p, 29, 12, 28, 34);
}

function caballo(p: Pixeles, pal: number): void {
  const c = COLOR_PALO[pal];
  const o = OSCURO_PALO[pal];
  const pelaje = pal % 2 === 0 ? P.madera_clara : P.papel;
  const pelajeO = pal % 2 === 0 ? P.madera : D.papel_sombra;
  // Patas
  for (const x of [10, 14, 23, 27]) {
    p.rect(x - 1, 36, 3, 11, P.negro);
    p.rect(x, 36, 1, 10, pelajeO);
    p.rect(x - 1, 46, 3, 2, P.tinta);
  }
  // Cuerpo
  p.elipse(18.5, 33, 12, 6, P.negro);
  p.elipse(18.5, 33, 11, 5, pelaje);
  p.linea(9, 35, 28, 35, pelajeO);
  // Cuello y cabeza (mirando a la izquierda)
  p.poligono(
    [
      [6, 22],
      [11, 21],
      [14, 31],
      [8, 32],
    ],
    P.negro,
  );
  p.poligono(
    [
      [7, 23],
      [10, 22],
      [13, 31],
      [9, 31],
    ],
    pelaje,
  );
  p.elipse(6, 23, 3.5, 2.5, P.negro);
  p.elipse(6, 23, 2.6, 1.6, pelaje);
  p.px(5, 22, P.tinta);
  p.linea(8, 20, 9, 18, P.negro);
  // Crin y cola
  p.linea(10, 21, 13, 29, P.tinta);
  p.linea(30, 30, 32, 38, P.tinta);
  p.linea(31, 30, 33, 37, P.tinta);
  // Jinete
  p.rect(16, 18, 7, 12, P.negro);
  p.rect(17, 19, 5, 10, c);
  p.linea(19, 19, 19, 28, o);
  p.rect(15, 27, 9, 2, P.oros);
  cara(p, 19, 13, false);
  p.rect(15, 8, 9, 2, P.negro);
  p.rect(16, 7, 7, 2, o);
  // Objeto
  if (pal === 0) oro(p, 27, 20, 3);
  else if (pal === 1) copa(p, 27, 19, 0.8);
  else if (pal === 2) espada(p, 27, 6, 24, 25);
  else basto(p, 28, 7, 24, 26);
}

function rey(p: Pixeles, pal: number): void {
  const c = COLOR_PALO[pal];
  const o = OSCURO_PALO[pal];
  const b = BRILLO_PALO[pal];
  // Manto
  p.poligono(
    [
      [12, 19],
      [26, 19],
      [30, 48],
      [8, 48],
    ],
    P.negro,
  );
  p.poligono(
    [
      [13, 20],
      [25, 20],
      [29, 47],
      [9, 47],
    ],
    c,
  );
  p.poligono(
    [
      [16, 20],
      [22, 20],
      [23, 47],
      [15, 47],
    ],
    o,
  );
  p.linea(19, 21, 19, 46, P.oros);
  p.linea(10, 44, 28, 44, P.oros);
  p.linea(13, 21, 11, 40, b);
  // Armiño
  p.rect(13, 19, 13, 2, P.papel);
  p.px(15, 19, P.tinta);
  p.px(19, 20, P.tinta);
  p.px(23, 19, P.tinta);
  // Cabeza, barba y corona
  cara(p, 19, 14, true);
  p.rect(14, 7, 11, 4, P.negro);
  p.rect(15, 8, 9, 3, P.oros);
  p.px(15, 6, P.oros);
  p.px(19, 5, P.oros);
  p.px(23, 6, P.oros);
  p.px(15, 7, P.oros);
  p.px(19, 6, P.oros);
  p.px(19, 7, P.oros);
  p.px(23, 7, P.oros);
  p.px(19, 9, D.copas_brillo);
  p.px(16, 9, D.espadas_brillo);
  p.px(22, 9, D.espadas_brillo);
  // Objeto
  if (pal === 0) oro(p, 27, 28, 3.5);
  else if (pal === 1) copa(p, 27, 27, 0.9);
  else if (pal === 2) espada(p, 28, 9, 26, 34);
  else basto(p, 28, 9, 25, 35);
}

// ---------------------------------------------------------------------------
// Cartas completas
// ---------------------------------------------------------------------------

function fondo(p: Pixeles, w: number, h: number, colorFondo: string): void {
  p.rect(1, 0, w - 2, h, P.negro);
  p.rect(0, 1, w, h - 2, P.negro);
  p.rect(1, 1, w - 2, h - 2, colorFondo);
  // Esquinas redondeadas
  p.px(1, 1, P.negro);
  p.px(w - 2, 1, P.negro);
  p.px(1, h - 2, P.negro);
  p.px(w - 2, h - 2, P.negro);
}

/** Marco interior con la «pinta»: oros sin cortes, copas uno, espadas dos, bastos tres. */
function marcoPinta(p: Pixeles, pal: number, x0: number, y0: number, x1: number, y1: number): void {
  const col = P.tinta;
  p.linea(x0, y0, x1, y0, col);
  p.linea(x0, y1, x1, y1, col);
  p.linea(x0, y0, x0, y1, col);
  p.linea(x1, y0, x1, y1, col);
  const cortes = pal;
  const w = x1 - x0;
  for (let k = 1; k <= cortes; k++) {
    const x = Math.round(x0 + (w * k) / (cortes + 1));
    for (const y of [y0, y1]) {
      p.borrar(x - 1, y);
      p.borrar(x, y);
      p.borrar(x + 1, y);
      p.px(x - 1, y, P.papel);
      p.px(x, y, P.papel);
      p.px(x + 1, y, P.papel);
    }
  }
}

function cartaGrande(c: Carta): Pixeles {
  const p = new Pixeles(CARTA_W, CARTA_H);
  const pal = palo(c);
  const n = numero(c);
  fondo(p, CARTA_W, CARTA_H, P.papel);
  marcoPinta(p, pal, 3, 3, CARTA_W - 4, CARTA_H - 4);
  const idx = String(n);
  // Índices en las esquinas (dentro del marco).
  p.rect(4, 4, idx.length * 4 + 1, 7, P.papel);
  digitos(p, idx, 5, 5, OSCURO_PALO[pal]);
  const xd = CARTA_W - 5 - idx.length * 4;
  p.rect(xd - 1, CARTA_H - 11, idx.length * 4 + 1, 7, P.papel);
  digitos(p, idx, xd, CARTA_H - 10, OSCURO_PALO[pal]);

  if (n === 1) {
    if (pal === 0) oro(p, 19, 29, 9);
    else if (pal === 1) copa(p, 19, 30, 2.2);
    else palito(pal, p, 19, 29, pal === 2 ? 0 : 0.25, 36, true);
  } else if (n <= 7) {
    if (pal <= 1) for (const [x, y] of DISPOSICION_REDONDA[n]) pip(pal, p, x, y);
    else {
      for (const [tipo, y] of DISPOSICION_CRUZADA[n]) {
        const solo = DISPOSICION_CRUZADA[n].length === 1;
        if (tipo.includes('V')) palito(pal, p, 19, y, 0, solo ? 32 : 15);
        if (tipo.includes('X')) {
          const largo = solo ? 30 : 25;
          const ang = solo ? 0.62 : 1.08;
          palito(pal, p, 19, y, ang, largo);
          palito(pal, p, 19, y, -ang, largo);
        }
      }
    }
  } else if (n === 10) sota(p, pal);
  else if (n === 11) caballo(p, pal);
  else rey(p, pal);
  return p;
}

function cartaMini(c: Carta): Pixeles {
  const p = new Pixeles(MINI_W, MINI_H);
  const pal = palo(c);
  const n = numero(c);
  fondo(p, MINI_W, MINI_H, P.papel);
  marcoPinta(p, pal, 2, 2, MINI_W - 3, MINI_H - 3);
  const idx = String(n);
  if (n === 1 || n >= 10) {
    p.rect(3, 3, idx.length * 4, 6, P.papel);
    digitos(p, idx, 3, 3, OSCURO_PALO[pal]);
  }
  const cx = 12;
  const cy = 22;
  if (n >= 10) {
    // Figura en miniatura: letra de la figura y su palo.
    const letra = n === 10 ? 'S' : n === 11 ? 'C' : 'R';
    const letras: Record<string, string> = {
      S: '.### #... .##. ...# ###.',
      C: '.### #... #... #... .###',
      R: '###. #..# ###. #.#. #..#',
    };
    letras[letra].split(' ').forEach((f, j) =>
      [...f].forEach((ch, i) => {
        if (ch === '#') {
          p.px(15 + i, 4 + j, OSCURO_PALO[pal]);
        }
      }),
    );
    if (n === 12) {
      p.rect(8, 11, 9, 3, P.oros);
      p.px(8, 10, P.oros);
      p.px(12, 10, P.oros);
      p.px(16, 10, P.oros);
    }
    p.elipse(cx, cy - 2, 3, 3, P.negro);
    p.elipse(cx, cy - 2, 2.2, 2.2, P.piel_1);
    p.rect(cx - 4, cy + 1, 9, 9, P.negro);
    p.rect(cx - 3, cy + 2, 7, 8, COLOR_PALO[pal]);
    if (pal === 0) oro(p, cx + 5, cy + 5, 2);
    else if (pal === 1) copa(p, cx + 5, cy + 6, 0.55);
    else palito(pal, p, cx + 6, cy + 3, 0.2, 10);
  } else if (n === 1) {
    if (pal === 0) oro(p, cx, cy, 5);
    else if (pal === 1) copa(p, cx, cy + 1, 1.2);
    else palito(pal, p, cx, cy, 0, 20, true);
  } else {
    // Número grande y un pip: legible a 24×36.
    const d = DIGITOS[String(n)].split(' ');
    d.forEach((f, j) =>
      [...f].forEach((ch, i) => {
        if (ch === '#') p.rect(9 + i * 2, 8 + j * 2, 2, 2, OSCURO_PALO[pal]);
      }),
    );
    if (pal === 0) oro(p, cx, 26, 4);
    else if (pal === 1) copa(p, cx, 27, 0.9);
    else palito(pal, p, cx, 26, 1.1, 16);
  }
  return p;
}

/** Reverso: rombos granate y crema con el escudo del Bar El Envite. */
function reverso(w: number, h: number): Pixeles {
  const p = new Pixeles(w, h);
  fondo(p, w, h, P.papel);
  const x0 = w >= 20 ? 3 : 2;
  const y0 = w >= 20 ? 3 : 2;
  for (let y = y0; y < h - y0; y++)
    for (let x = x0; x < w - x0; x++) {
      const u = (x - x0 + (y - y0)) % 6;
      const v = (x - x0 - (y - y0) + 600) % 6;
      p.px(x, y, u === 0 || v === 0 ? P.papel : P.copas);
    }
  if (w >= 20) {
    p.rectBorde(x0 - 1, y0 - 1, w - 2 * x0 + 2, h - 2 * y0 + 2, D.copas_osc);
    // Escudo inventado: blasón con un vaso de vino y una «E».
    const cx = w / 2;
    const cy = h / 2;
    const s = w >= 30 ? 1 : 0.7;
    p.poligono(
      [
        [cx - 8 * s, cy - 10 * s],
        [cx + 8 * s, cy - 10 * s],
        [cx + 8 * s, cy + 3 * s],
        [cx, cy + 11 * s],
        [cx - 8 * s, cy + 3 * s],
      ],
      P.negro,
    );
    p.poligono(
      [
        [cx - 7 * s, cy - 9 * s],
        [cx + 7 * s, cy - 9 * s],
        [cx + 7 * s, cy + 2.5 * s],
        [cx, cy + 9.5 * s],
        [cx - 7 * s, cy + 2.5 * s],
      ],
      P.oros,
    );
    p.poligono(
      [
        [cx - 6 * s, cy - 8 * s],
        [cx, cy - 8 * s],
        [cx, cy + 8 * s],
        [cx - 6 * s, cy + 2 * s],
      ],
      D.copas_osc,
    );
    // Vaso
    p.rect(cx + 1 * s, cy - 6 * s, 4 * s, 5 * s, P.papel);
    p.rect(cx + 1 * s, cy - 3 * s, 4 * s, 2 * s, P.copas);
    p.rect(cx + 2.5 * s, cy - 1 * s, 1, 3 * s, P.papel);
    p.rect(cx + 1 * s, cy + 2 * s, 4 * s, 1, P.papel);
    // «E»
    if (w >= 30) {
      p.rect(cx - 5, cy - 5, 1, 7, P.oros);
      p.rect(cx - 5, cy - 5, 4, 1, P.oros);
      p.rect(cx - 5, cy - 2, 3, 1, P.oros);
      p.rect(cx - 5, cy + 1, 4, 1, P.oros);
    }
  }
  return p;
}

// ---------------------------------------------------------------------------
// Caché de canvases
// ---------------------------------------------------------------------------

const cache = new Map<string, HTMLCanvasElement>();

function cacheado(clave: string, gen: () => Pixeles): HTMLCanvasElement {
  let c = cache.get(clave);
  if (!c) {
    c = gen().aCanvas();
    cache.set(clave, c);
  }
  return c;
}

export function imagenCarta(c: Carta): HTMLCanvasElement {
  return cacheado(`g${c}`, () => cartaGrande(c));
}

export function imagenMini(c: Carta): HTMLCanvasElement {
  return cacheado(`m${c}`, () => cartaMini(c));
}

export function imagenReverso(): HTMLCanvasElement {
  return cacheado('reverso', () => reverso(CARTA_W, CARTA_H));
}

export function imagenReversoMini(): HTMLCanvasElement {
  return cacheado('reversoMini', () => reverso(MINI_W, MINI_H));
}

export function imagenDorso(): HTMLCanvasElement {
  return cacheado('dorso', () => reverso(DORSO_W, DORSO_H));
}

/** Dorso visto de lado (para animar el volteo): se estrecha horizontalmente. */
export function dibujarVolteo(
  ctx: CanvasRenderingContext2D,
  frente: HTMLCanvasElement,
  dorso: HTMLCanvasElement,
  x: number,
  y: number,
  p: number,
): void {
  const img = p < 0.5 ? dorso : frente;
  const k = Math.abs(Math.cos(p * Math.PI));
  const w = Math.max(1, Math.round(img.width * k));
  ctx.drawImage(img, 0, 0, img.width, img.height, Math.round(x + (img.width - w) / 2), Math.round(y), w, img.height);
}
