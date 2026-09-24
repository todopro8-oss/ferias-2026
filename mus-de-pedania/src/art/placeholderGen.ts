// Generador procedural de bustos en pixel art (sección 11.4). A partir de los rasgos de
// `characters.ts` dibuja cada personaje con todas sus animaciones y señas, respetando la
// paleta. El juego usa esto mientras no haya un PNG de arte final en assets/sprites/.

import type { Aspecto } from '../data/characters';
import { DERIVADOS as D, PALETA as P, mezclar, rampa } from '../data/palette';
import { Pixeles } from '../render/pixel';

export type Vista = 'frontal' | 'tresCuartos';

export interface Expresion {
  ojos: 'normal' | 'cerrados' | 'guino' | 'muyAbiertos' | 'lado' | 'abajo' | 'entornados' | 'mediocerrados';
  cejas: 'normal' | 'arriba' | 'fruncidas' | 'tristes' | 'unaArriba';
  boca: 'cerrada' | 'A' | 'O' | 'sonrisa' | 'risa' | 'enfado' | 'sorpresa' | 'labio' | 'lengua' | 'torcida' | 'globo';
  mano?: boolean;
  /** Respiración: desplaza el busto hacia abajo. */
  dy?: number;
  /** Mira de reojo (desplaza la cabeza 1 px). */
  dxCabeza?: number;
  /** Globo de chicle (fase 0..1). */
  globo?: number;
}

const E = (x: Partial<Expresion>): Expresion => ({ ojos: 'normal', cejas: 'normal', boca: 'cerrada', ...x });

/** Fotogramas con nombre. Las señas tienen dos fotogramas (inicio y plena). */
export const EXPRESIONES: Record<string, Expresion> = {
  idle0: E({}),
  idle1: E({ dy: 1 }),
  parpadeo: E({ ojos: 'cerrados' }),
  hablarA: E({ boca: 'A' }),
  hablarO: E({ boca: 'O' }),
  hablarC: E({ boca: 'cerrada', dy: 0 }),
  pensar: E({ mano: true, ojos: 'lado', cejas: 'unaArriba', boca: 'torcida' }),
  contento: E({ boca: 'risa', ojos: 'mediocerrados', cejas: 'arriba' }),
  cabreado: E({ boca: 'enfado', ojos: 'entornados', cejas: 'fruncidas' }),
  sorprendido: E({ boca: 'sorpresa', ojos: 'muyAbiertos', cejas: 'arriba' }),
  mirar_pareja: E({ ojos: 'abajo', dxCabeza: 1 }),
  sena_labio0: E({ boca: 'labio', ojos: 'abajo' }),
  sena_labio1: E({ boca: 'labio', ojos: 'abajo', dy: 1 }),
  sena_lengua0: E({ boca: 'lengua', ojos: 'abajo' }),
  sena_lengua1: E({ boca: 'lengua', ojos: 'abajo', dxCabeza: 1 }),
  sena_torcer0: E({ boca: 'torcida', ojos: 'abajo' }),
  sena_torcer1: E({ boca: 'torcida', ojos: 'lado', cejas: 'unaArriba' }),
  sena_cejas0: E({ cejas: 'arriba', ojos: 'muyAbiertos' }),
  sena_cejas1: E({ cejas: 'arriba', ojos: 'muyAbiertos', dy: -1 }),
  sena_guino0: E({ ojos: 'mediocerrados' }),
  sena_guino1: E({ ojos: 'guino', boca: 'sonrisa' }),
  sena_ciego0: E({ ojos: 'mediocerrados' }),
  sena_ciego1: E({ ojos: 'cerrados', cejas: 'tristes' }),
  sena_tresReyes0: E({ boca: 'labio', ojos: 'abajo' }),
  sena_tresReyes1: E({ boca: 'cerrada', ojos: 'abajo', dy: 1 }),
  globo0: E({ boca: 'globo', globo: 0.4 }),
  globo1: E({ boca: 'globo', globo: 1 }),
};

export interface Etiqueta {
  nombre: string;
  frames: string[];
  duraciones: number[];
  bucle: boolean;
}

/** Animaciones (tags al estilo Aseprite). */
export const ETIQUETAS: Etiqueta[] = [
  { nombre: 'idle', frames: ['idle0', 'idle1'], duraciones: [700, 700], bucle: true },
  { nombre: 'parpadeo', frames: ['parpadeo'], duraciones: [110], bucle: false },
  { nombre: 'hablar', frames: ['hablarA', 'hablarC', 'hablarO', 'hablarC'], duraciones: [90, 80, 90, 80], bucle: true },
  { nombre: 'pensar', frames: ['pensar'], duraciones: [900], bucle: false },
  { nombre: 'contento', frames: ['contento'], duraciones: [1200], bucle: false },
  { nombre: 'cabreado', frames: ['cabreado'], duraciones: [1200], bucle: false },
  { nombre: 'sorprendido', frames: ['sorprendido'], duraciones: [900], bucle: false },
  { nombre: 'mirar_pareja', frames: ['mirar_pareja'], duraciones: [600], bucle: false },
  { nombre: 'sena_labio', frames: ['sena_labio0', 'sena_labio1'], duraciones: [150, 150], bucle: true },
  { nombre: 'sena_lengua', frames: ['sena_lengua0', 'sena_lengua1'], duraciones: [150, 150], bucle: true },
  { nombre: 'sena_torcer', frames: ['sena_torcer0', 'sena_torcer1'], duraciones: [160, 160], bucle: true },
  { nombre: 'sena_cejas', frames: ['sena_cejas0', 'sena_cejas1'], duraciones: [140, 140], bucle: true },
  { nombre: 'sena_guino', frames: ['sena_guino0', 'sena_guino1'], duraciones: [120, 220], bucle: true },
  { nombre: 'sena_ciego', frames: ['sena_ciego0', 'sena_ciego1'], duraciones: [120, 260], bucle: true },
  {
    nombre: 'sena_tresReyes',
    frames: ['sena_tresReyes0', 'sena_tresReyes1', 'sena_tresReyes0', 'sena_tresReyes1'],
    duraciones: [140, 110, 140, 200],
    bucle: true,
  },
  { nombre: 'chicle', frames: ['globo0', 'globo1', 'globo0'], duraciones: [260, 420, 160], bucle: false },
];

export const TAMANO_VISTA: Record<Vista, { w: number; h: number }> = {
  frontal: { w: 64, h: 72 },
  tresCuartos: { w: 60, h: 76 },
};

// ---------------------------------------------------------------------------
// Geometría
// ---------------------------------------------------------------------------

interface Geo {
  vista: Vista;
  w: number;
  h: number;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  /** Línea media de la cara (en 3/4 se desplaza hacia donde mira). */
  mx: number;
  ojoA: { x: number; k: number };
  ojoB: { x: number; k: number };
  yOjos: number;
  yNariz: number;
  yBoca: number;
  anchoBoca: number;
  hombros: number;
  yHombros: number;
}

function geometria(a: Aspecto, vista: Vista, ex: Expresion): Geo {
  const { w, h } = TAMANO_VISTA[vista];
  const forma = a.cara.forma;
  const rx = { redonda: 15.5, alargada: 13.5, cuadrada: 15.5, ovalada: 14.5, ancha: 16.5 }[forma];
  const ry = { redonda: 17, alargada: 19.5, cuadrada: 17, ovalada: 18, ancha: 16 }[forma];
  const dy = ex.dy ?? 0;
  const cx = (vista === 'frontal' ? 32 : 27) + (ex.dxCabeza ?? 0);
  const cy = (vista === 'frontal' ? 26 : 30) + dy;
  const frontal = vista === 'frontal';
  const mx = frontal ? cx : cx + 5;
  return {
    vista,
    w,
    h,
    cx,
    cy,
    rx,
    ry,
    mx,
    ojoA: frontal ? { x: cx - 6, k: 1 } : { x: mx - 6, k: 1 },
    ojoB: frontal ? { x: cx + 6, k: 1 } : { x: mx + 5, k: 0.6 },
    yOjos: cy - 1,
    yNariz: cy + 1,
    yBoca: cy + Math.round(ry * 0.6),
    anchoBoca: frontal ? 7 : 6,
    hombros: (frontal ? 25 : 23) * a.corpulencia,
    yHombros: cy + ry + 4 - dy + dy,
  };
}

interface Colores {
  piel: string;
  pielSombra: string;
  pielLuz: string;
  linea: string;
}

const PIELES: Record<Aspecto['piel'], Colores> = {
  piel_1: { piel: P.piel_1, pielSombra: D.piel_1_sombra, pielLuz: D.piel_1_luz, linea: '#9A5A36' },
  piel_2: { piel: P.piel_2, pielSombra: D.piel_2_sombra, pielLuz: D.piel_2_luz, linea: '#5E3620' },
  piel_3: { piel: P.piel_3, pielSombra: D.piel_3_sombra, pielLuz: '#A8704A', linea: '#3E2210' },
};

/** Elipse con contorno negro de 1 px. */
function elipseC(
  p: Pixeles,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  color: string,
  borde: string = P.negro,
): void {
  p.elipse(cx, cy, rx + 1, ry + 1, borde);
  p.elipse(cx, cy, rx, ry, color);
}

// ---------------------------------------------------------------------------
// Pelo (capa de detrás y capa de delante)
// ---------------------------------------------------------------------------

function peloDetras(p: Pixeles, a: Aspecto, g: Geo): void {
  const { color, sombra } = a.pelo;
  const { cx, cy, rx, ry } = g;
  switch (a.pelo.estilo) {
    case 'permanente': {
      // Una nube de rizos enorme, más ancha que la cabeza.
      const bolas: [number, number, number][] = [];
      for (let k = 0; k <= 12; k++) {
        const ang = Math.PI * (1.05 + (k / 12) * 0.9) + (g.vista === 'tresCuartos' ? -0.1 : 0);
        bolas.push([cx + Math.cos(ang) * (rx + 5), cy - 2 + Math.sin(ang) * (ry + 3), 6.5]);
      }
      for (const lado of [-1, 1]) {
        for (let k = 0; k < 3; k++) bolas.push([cx + lado * (rx + 4 - k), cy + 4 + k * 5, 5.5 - k * 0.5]);
      }
      for (const [x, y, r] of bolas) p.elipse(x, y, r + 1, r + 1, P.negro);
      for (const [x, y, r] of bolas) p.elipse(x, y, r, r, color);
      p.elipse(cx, cy - 4, rx + 3, ry + 1, color);
      for (const [x, y, r] of bolas) {
        p.px(x - r * 0.4, y - r * 0.3, sombra);
        p.px(x + r * 0.3, y + r * 0.4, sombra);
        p.px(x - r * 0.2, y - r * 0.6, mezclar(color, '#FFFFFF', 0.3));
      }
      break;
    }
    case 'tupe': {
      // Melena platino por detrás, hasta la mandíbula.
      elipseC(p, cx, cy + 2, rx + 3.5, ry + 1, color);
      p.elipse(cx - 2, cy - 4, rx - 2, ry - 5, sombra);
      break;
    }
    case 'mono': {
      elipseC(p, cx, cy - ry - 1, 6, 5, color);
      p.elipse(cx - 1, cy - ry - 2, 3, 2, mezclar(color, '#FFFFFF', 0.25));
      p.linea(cx - 4, cy - ry, cx + 3, cy - ry - 3, sombra);
      break;
    }
    case 'calvoCerco': {
      // Cerco de pelo blanco a los lados y por detrás.
      if (g.vista === 'frontal') {
        for (const lado of [-1, 1]) elipseC(p, cx + lado * (rx - 1), cy + 1, 4, 7, color);
      } else {
        elipseC(p, cx - rx + 3, cy + 1, 6, 8, color);
        elipseC(p, cx - rx + 8, cy - 3, 5, 5, color);
      }
      break;
    }
    case 'flequillo':
      elipseC(p, cx, cy - 3, rx + 1.5, ry - 1, color);
      break;
    case 'repeinado':
      elipseC(p, cx, cy - 3, rx + 1, ry - 2, color);
      break;
    default:
      break;
  }
}

function peloDelante(p: Pixeles, a: Aspecto, g: Geo): void {
  const { color, sombra } = a.pelo;
  const { cx, cy, rx, ry, vista } = g;
  const luz = mezclar(color, '#FFFFFF', 0.3);
  const frontal = vista === 'frontal';
  const top = cy - ry;
  const dentroCabeza = (x: number, y: number) => ((x - cx) / (rx + 0.5)) ** 2 + ((y - cy) / (ry + 0.5)) ** 2 <= 1;
  switch (a.pelo.estilo) {
    case 'calvoCerco': {
      // Calva con brillo.
      p.elipse(cx - 4, top + 5, 3, 2, D.piel_1_luz);
      p.px(cx - 6, top + 4, D.blanco);
      p.px(cx - 5, top + 4, D.blanco);
      break;
    }
    case 'permanente': {
      // Flequillo de rizos sobre la frente.
      for (let k = 0; k < 5; k++) {
        const x = cx - rx + 4 + k * ((2 * rx - 8) / 4) + (frontal ? 0 : 2);
        elipseC(p, x, top + 5 + (k % 2), 3.5, 3, color);
        p.px(x - 1, top + 4 + (k % 2), luz);
        p.px(x + 1, top + 6 + (k % 2), sombra);
      }
      break;
    }
    case 'gorraCooperativa': {
      const gorra = P.bastos;
      const gorraO = D.bastos_osc;
      // Copa de la gorra
      p.elipse(cx, top + 6, rx + 2, 9, P.negro);
      p.elipse(cx, top + 6, rx + 1, 8, gorra, (_x, y) => y <= top + 9);
      p.rect(cx - rx - 1, top + 9, 2 * rx + 3, 1, P.negro);
      // Panel delantero blanco con logo de la cooperativa (una espiga).
      const px0 = frontal ? cx - 6 : cx - 2;
      p.rect(px0, top + 1, 12, 7, P.papel);
      p.rect(px0, top + 1, 12, 1, gorraO);
      p.linea(px0 + 6, top + 2, px0 + 6, top + 6, P.oros);
      p.px(px0 + 5, top + 3, P.oros);
      p.px(px0 + 7, top + 3, P.oros);
      p.px(px0 + 5, top + 5, P.oros);
      p.px(px0 + 7, top + 5, P.oros);
      p.px(cx, top - 2, P.negro);
      // Visera
      if (frontal) {
        p.elipse(cx, top + 10, rx + 3, 3, P.negro);
        p.elipse(cx, top + 10, rx + 2, 2, gorraO, (_x, y) => y >= top + 10);
        p.linea(cx - rx - 1, top + 10, cx + rx + 1, top + 10, gorra);
      } else {
        p.poligono(
          [
            [cx + 2, top + 8],
            [cx + rx + 9, top + 9],
            [cx + rx + 8, top + 12],
            [cx + 2, top + 11],
          ],
          P.negro,
        );
        p.poligono(
          [
            [cx + 3, top + 9],
            [cx + rx + 8, top + 10],
            [cx + rx + 7, top + 11],
            [cx + 3, top + 11],
          ],
          gorraO,
        );
      }
      // Patillas
      for (const lado of frontal ? [-1, 1] : [-1]) p.rect(cx + lado * (rx - 1) - 1, top + 11, 3, 6, color);
      break;
    }
    case 'mono': {
      // Pelo gris tirante con raya en medio.
      p.elipse(cx, top + 6, rx + 1, 8, P.negro, (x, y) => y <= top + 8 && dentroCabeza(x, y + 1));
      p.elipse(cx, top + 6, rx, 7, color, (_x, y) => y <= top + 8);
      const raya = frontal ? cx : cx + 2;
      p.linea(raya, top + 1, raya, top + 5, sombra);
      p.linea(raya - 2, top + 3, cx - rx + 2, top + 8, luz);
      p.linea(raya + 2, top + 3, cx + rx - 2, top + 8, sombra);
      break;
    }
    case 'flequillo': {
      // Flequillo «cortinilla»: raya en medio y dos cortinas hasta las cejas.
      const raya = frontal ? cx : cx + 3;
      p.elipse(cx, top + 5, rx + 1, 7, color, (_x, y) => y <= top + 8);
      p.poligono(
        [
          [raya, top + 2],
          [raya - 2, top + 3],
          [cx - rx - 1, top + 13],
          [cx - rx + 4, top + 12],
          [raya - 1, top + 7],
        ],
        color,
      );
      p.poligono(
        [
          [raya, top + 2],
          [raya + 2, top + 3],
          [cx + rx + 1, top + 13],
          [cx + rx - 4, top + 12],
          [raya + 1, top + 7],
        ],
        color,
      );
      p.linea(raya, top + 2, raya - 1, top + 8, P.negro);
      p.linea(raya - 3, top + 4, cx - rx + 2, top + 11, sombra);
      p.linea(raya + 3, top + 4, cx + rx - 2, top + 11, sombra);
      p.linea(raya - 2, top + 3, raya - 5, top + 6, luz);
      break;
    }
    case 'tupe': {
      // Tupé platino con laca: gran volumen sobre la frente.
      const x0 = frontal ? cx - 2 : cx + 1;
      elipseC(p, x0, top + 1, rx - 1, 8, color);
      elipseC(p, x0 + 5, top + 4, 7, 5, color);
      p.elipse(x0 - 4, top - 1, 5, 3, luz);
      p.linea(x0 - 8, top + 3, x0 + 6, top - 3, D.blanco);
      p.linea(x0 - 3, top + 6, x0 + 9, top + 1, sombra);
      // Mechones laterales enmarcando la cara.
      p.poligono(
        [
          [cx - rx - 1, top + 5],
          [cx - rx + 4, top + 6],
          [cx - rx + 2, cy + 6],
          [cx - rx - 2, cy + 4],
        ],
        color,
      );
      if (frontal) {
        p.poligono(
          [
            [cx + rx + 1, top + 5],
            [cx + rx - 4, top + 6],
            [cx + rx - 2, cy + 6],
            [cx + rx + 2, cy + 4],
          ],
          color,
        );
      }
      break;
    }
    case 'gorraPlato': {
      const azul = a.ropa.color;
      const azulO = a.ropa.sombra;
      // Plato (copa ancha) de la gorra
      p.poligono(
        [
          [cx - rx - 4, top + 1],
          [cx + rx + 4, top + 1],
          [cx + rx + 1, top + 9],
          [cx - rx - 1, top + 9],
        ],
        P.negro,
      );
      p.poligono(
        [
          [cx - rx - 3, top + 2],
          [cx + rx + 3, top + 2],
          [cx + rx, top + 8],
          [cx - rx, top + 8],
        ],
        azul,
      );
      p.linea(cx - rx - 2, top + 2, cx + rx + 2, top + 2, mezclar(azul, '#FFFFFF', 0.25));
      // Banda y escudo municipal inventado (torre sobre fondo dorado).
      p.rect(cx - rx, top + 8, 2 * rx + 1, 3, azulO);
      p.rect(cx - rx, top + 9, 2 * rx + 1, 1, P.oros);
      const ex = frontal ? cx : cx + 3;
      p.rect(ex - 3, top + 3, 7, 7, P.negro);
      p.rect(ex - 2, top + 4, 5, 5, P.oros);
      p.rect(ex - 1, top + 5, 3, 3, D.copas_osc);
      p.px(ex, top + 4, D.copas_osc);
      // Visera negra brillante
      if (frontal) {
        p.elipse(cx, top + 11, rx - 1, 2.5, P.negro, (_x, y) => y >= top + 10);
        p.linea(cx - 4, top + 12, cx + 2, top + 12, D.gris);
      } else {
        p.poligono(
          [
            [cx, top + 10],
            [cx + rx + 5, top + 11],
            [cx + rx + 3, top + 13],
            [cx, top + 12],
          ],
          P.negro,
        );
      }
      for (const lado of frontal ? [-1, 1] : [-1])
        p.rect(cx + lado * (rx - 1) - 1, top + 12, 2, 5, color === azul ? P.tinta : P.tinta);
      break;
    }
    case 'repeinado': {
      p.elipse(cx, top + 6, rx + 1, 8, color, (_x, y) => y <= top + 7);
      for (let k = -2; k <= 2; k++) p.linea(cx + k * 4, top + 1, cx + k * 5, top + 7, luz);
      break;
    }
  }
}

// ---------------------------------------------------------------------------
// Cara
// ---------------------------------------------------------------------------

function ojo(
  p: Pixeles,
  x: number,
  y: number,
  k: number,
  ex: Expresion,
  cual: 'A' | 'B',
  c: Colores,
  frontal: boolean,
): void {
  const w = Math.max(1.5, 2.6 * k);
  let estado = ex.ojos;
  if (estado === 'guino' && cual === (frontal ? 'B' : 'A')) estado = 'cerrados';
  else if (estado === 'guino') estado = 'normal';
  switch (estado) {
    case 'cerrados':
      p.linea(x - w, y, x + w, y, P.tinta);
      p.px(x - w, y - 1, c.linea);
      return;
    case 'mediocerrados':
      p.linea(x - w, y - 1, x + w, y - 1, P.tinta);
      p.rect(x - w + 1, y, w * 2 - 1, 1, D.blanco);
      p.px(x, y, P.tinta);
      return;
    case 'entornados':
      p.linea(x - w, y - 1, x + w, y, P.tinta);
      p.rect(x - w + 1, y, w * 2 - 1, 1, D.blanco);
      p.px(x + (cual === 'A' ? 1 : -1), y, P.tinta);
      return;
  }
  const alto = estado === 'muyAbiertos' ? 2.6 : 1.9;
  p.elipse(x, y, w + 0.8, alto + 0.8, P.tinta);
  p.elipse(x, y, w, alto, D.blanco);
  let px = x;
  let py = y;
  if (estado === 'lado') px += frontal ? 1 : 1;
  if (estado === 'abajo') py += 1;
  if (!frontal) px += 0.5;
  p.rect(Math.round(px - 0.5), Math.round(py - 0.5), estado === 'muyAbiertos' ? 1 : 2, 2, P.tinta);
  if (estado === 'muyAbiertos') p.px(px, py - 1, P.tinta);
}

function cejas(p: Pixeles, a: Aspecto, g: Geo, ex: Expresion): void {
  const colorCeja =
    a.cara.cejas === 'canosas'
      ? '#FFFFFF'
      : a.pelo.estilo === 'tupe'
        ? a.pelo.sombra
        : mezclar(a.pelo.color, P.tinta, 0.35);
  const grosor = a.cara.cejas === 'pobladas' || a.cara.cejas === 'canosas' ? 2 : 1;
  const y0 = g.yOjos - 4 - (ex.cejas === 'arriba' ? 2 : 0);
  for (const [o, cual] of [
    [g.ojoA, 'A'],
    [g.ojoB, 'B'],
  ] as const) {
    const w = Math.max(2, 3.2 * o.k);
    let yi = y0;
    let yd = y0;
    const interior = cual === 'A' ? 1 : -1; // hacia la nariz
    if (ex.cejas === 'fruncidas') {
      if (interior > 0) yd += 2;
      else yi += 2;
    } else if (ex.cejas === 'tristes') {
      if (interior > 0) yd -= 1;
      else yi -= 1;
    } else if (ex.cejas === 'unaArriba' && cual === 'A') {
      yi -= 2;
      yd -= 2;
    }
    if (a.cara.cejas === 'arqueadas' && ex.cejas === 'normal') {
      p.px(o.x - w, y0 + 1, colorCeja);
      p.linea(o.x - w + 1, y0, o.x + w - 1, y0, colorCeja);
      p.px(o.x + w, y0 + 1, colorCeja);
      continue;
    }
    for (let k = 0; k < grosor; k++) p.linea(o.x - w, yi + k, o.x + w, yd + k, colorCeja);
    if (a.cara.cejas === 'canosas') p.linea(o.x - w, yi - 1, o.x + w, yd - 1, P.negro);
  }
}

function nariz(p: Pixeles, a: Aspecto, g: Geo, c: Colores): void {
  const frontal = g.vista === 'frontal';
  const x = g.mx + (frontal ? 0 : 1);
  const y = g.yNariz;
  switch (a.cara.nariz) {
    case 'grande':
      if (frontal) {
        p.linea(x - 2, y - 2, x - 2, y + 3, c.pielSombra);
        p.linea(x + 2, y - 1, x + 2, y + 3, c.linea);
        p.elipse(x, y + 5, 4, 3, c.linea);
        p.elipse(x - 0.5, y + 4.6, 3, 2.2, c.piel);
        p.px(x - 1, y + 3, c.pielLuz);
        p.px(x - 2, y + 7, P.tinta);
        p.px(x + 2, y + 7, P.tinta);
      } else {
        p.poligono(
          [
            [x, y - 3],
            [x + 5, y + 5],
            [x + 3, y + 7],
            [x - 1, y + 6],
          ],
          c.linea,
        );
        p.poligono(
          [
            [x, y - 2],
            [x + 4, y + 5],
            [x + 2, y + 6],
            [x - 1, y + 5],
          ],
          c.piel,
        );
        p.px(x + 1, y + 6, P.tinta);
      }
      break;
    case 'patata':
      p.elipse(x + (frontal ? 0 : 1), y + 4, 3.8, 3, c.linea);
      p.elipse(x + (frontal ? 0 : 1), y + 4, 3, 2.3, mezclar(c.piel, D.copas_brillo, 0.25));
      p.px(x - 1 + (frontal ? 0 : 1), y + 3, c.pielLuz);
      p.px(x - 2 + (frontal ? 0 : 1), y + 5, P.tinta);
      p.px(x + 2 + (frontal ? 0 : 1), y + 5, P.tinta);
      break;
    case 'ganchuda':
      if (frontal) {
        p.linea(x + 1, y - 2, x + 2, y + 4, c.linea);
        p.linea(x + 2, y + 4, x, y + 6, c.linea);
        p.linea(x - 1, y + 1, x - 1, y + 4, c.pielSombra);
        p.px(x - 2, y + 5, c.linea);
        p.px(x - 1, y + 6, c.linea);
      } else {
        p.poligono(
          [
            [x, y - 2],
            [x + 4, y + 3],
            [x + 3, y + 6],
            [x, y + 5],
          ],
          c.linea,
        );
        p.poligono(
          [
            [x, y - 1],
            [x + 3, y + 3],
            [x + 2, y + 5],
            [x, y + 4],
          ],
          c.piel,
        );
      }
      break;
    case 'respingona':
      p.linea(x + 1, y, x + 1, y + 2, c.pielSombra);
      p.linea(x - 1, y + 4, x + 2, y + 4, c.linea);
      p.px(x - 2, y + 3, c.linea);
      p.px(x + 2, y + 3, c.linea);
      if (!frontal) p.linea(x + 2, y + 1, x + 3, y + 3, c.linea);
      break;
    case 'pequena':
      p.linea(x + 1, y - 1, x + 1, y + 3, c.pielSombra);
      p.linea(x - 1, y + 4, x + 2, y + 4, c.linea);
      p.px(x - 2, y + 3, c.linea);
      if (!frontal) p.linea(x + 2, y + 1, x + 3, y + 3, c.linea);
      break;
  }
}

function boca(p: Pixeles, a: Aspecto, g: Geo, ex: Expresion, c: Colores): void {
  const x = g.mx + (g.vista === 'frontal' ? 0 : 1);
  const y = g.yBoca;
  const w = g.anchoBoca / 2;
  const labio = a.cara.labios === 'pintados' ? D.rojo_labios : a.cara.labios === 'gruesos' ? c.linea : c.linea;
  const grueso = a.cara.labios !== 'finos';
  switch (ex.boca) {
    case 'cerrada':
      p.linea(x - w, y, x + w, y, P.tinta);
      if (grueso) p.linea(x - w + 1, y + 1, x + w - 1, y + 1, labio);
      if (a.cara.labios === 'pintados') p.linea(x - w + 1, y - 1, x + w - 1, y - 1, labio);
      break;
    case 'A':
      p.elipse(x, y + 1, w - 0.5, 2.8, P.tinta);
      p.elipse(x, y + 1, w - 1.5, 2, D.copas_osc);
      p.rect(x - w + 2, y - 1, 2 * w - 3, 1, D.blanco);
      p.rect(x - 1, y + 2, 3, 1, D.lengua);
      if (a.cara.labios === 'pintados') p.elipseBorde(x, y + 1, w + 0.5, 3.6, D.rojo_labios);
      break;
    case 'O':
      p.elipse(x, y + 1, 2.2, 2.4, P.tinta);
      p.elipse(x, y + 1, 1.2, 1.4, D.copas_osc);
      if (a.cara.labios === 'pintados') p.elipseBorde(x, y + 1, 3, 3.2, D.rojo_labios);
      break;
    case 'sonrisa':
      p.linea(x - w, y - 1, x - w + 1, y, P.tinta);
      p.linea(x - w + 1, y, x + w - 1, y, P.tinta);
      p.linea(x + w - 1, y, x + w, y - 1, P.tinta);
      if (grueso) p.linea(x - w + 2, y + 1, x + w - 2, y + 1, labio);
      break;
    case 'risa':
      p.elipse(x, y + 1, w + 0.5, 2.5, P.tinta, (_x, yy) => yy >= y);
      p.rect(x - w + 1, y, 2 * w - 1, 2, D.blanco);
      p.rect(x - w + 2, y + 2, 2 * w - 3, 1, D.copas_osc);
      p.px(x - w - 1, y - 1, P.tinta);
      p.px(x + w + 1, y - 1, P.tinta);
      break;
    case 'enfado':
      p.linea(x - w, y + 1, x - w + 1, y, P.tinta);
      p.linea(x - w + 1, y, x + w - 1, y, P.tinta);
      p.linea(x + w - 1, y, x + w, y + 1, P.tinta);
      p.rect(x - w + 2, y + 1, 2 * w - 3, 1, D.blanco);
      p.linea(x - w + 1, y + 2, x + w - 1, y + 2, P.tinta);
      break;
    case 'sorpresa':
      p.elipse(x, y + 2, 2.6, 3.4, P.tinta);
      p.elipse(x, y + 2, 1.6, 2.4, D.copas_osc);
      break;
    case 'labio':
      // Muerde el labio inferior: dientes de arriba sobre el labio de abajo.
      p.linea(x - w, y, x + w, y, P.tinta);
      p.rect(x - w + 1, y + 1, 2 * w - 1, 1, D.blanco);
      p.linea(x - w + 1, y + 2, x + w - 1, y + 2, a.cara.labios === 'pintados' ? D.rojo_labios : D.copas_brillo);
      p.linea(x - w + 2, y + 3, x + w - 2, y + 3, c.linea);
      break;
    case 'lengua':
      p.linea(x - w, y, x + w, y, P.tinta);
      p.rect(x - 1, y + 1, 3, 2, D.lengua);
      p.px(x, y + 2, D.copas_brillo);
      p.linea(x - 1, y + 3, x + 1, y + 3, D.copas_osc);
      break;
    case 'torcida':
      // Labios apretados y torcidos hacia un lado.
      p.linea(x - w + 1, y + 1, x + w, y - 1, P.tinta);
      p.linea(x - w + 2, y + 2, x + w, y, labio);
      p.px(x + w + 1, y - 2, c.linea);
      break;
    case 'globo': {
      const r = 1.5 + (ex.globo ?? 0) * 4.5;
      p.linea(x - w, y, x + w, y, P.tinta);
      elipseC(p, x + 1, y + 1, r, r, '#F29BC0', '#B0507A');
      p.px(x, y, '#FFFFFF');
      if (r > 3) p.px(x - 1, y - 1, '#FFFFFF');
      break;
    }
  }
}

function arrugas(p: Pixeles, a: Aspecto, g: Geo, c: Colores): void {
  if (a.cara.edad < 0.55) return;
  const { mx, yOjos } = g;
  // Patas de gallo y surcos nasogenianos.
  p.px(g.ojoA.x - 4, yOjos + 1, c.linea);
  p.px(g.ojoA.x - 4, yOjos - 1, c.linea);
  if (g.vista === 'frontal') {
    p.px(g.ojoB.x + 4, yOjos + 1, c.linea);
    p.px(g.ojoB.x + 4, yOjos - 1, c.linea);
  }
  p.linea(mx - 5, g.yNariz + 5, mx - 6, g.yBoca + 1, c.pielSombra);
  if (g.vista === 'frontal') p.linea(mx + 5, g.yNariz + 5, mx + 6, g.yBoca + 1, c.pielSombra);
  if (a.cara.edad > 0.75) {
    p.linea(mx - 4, g.cy - g.ry + 7, mx + 3, g.cy - g.ry + 7, c.pielSombra);
    p.linea(mx - 3, g.cy - g.ry + 9, mx + 2, g.cy - g.ry + 9, c.pielSombra);
  }
}

// ---------------------------------------------------------------------------
// Torso y ropa
// ---------------------------------------------------------------------------

function torso(p: Pixeles, a: Aspecto, g: Geo, c: Colores, dy: number): void {
  const { cx, h } = g;
  const ropa = rampa(a.ropa.color);
  const ytop = g.cy + g.ry + 3 + (g.vista === 'frontal' ? 0 : 0);
  const ancho = g.hombros;
  const bx = g.vista === 'frontal' ? cx : cx + 1;
  const cuerpo = (color: string, extra = 0) => {
    p.poligono(
      [
        [bx - ancho * 0.55 - extra, ytop + 2 - extra],
        [bx + ancho * 0.55 + extra, ytop + 2 - extra],
        [bx + ancho + extra, ytop + 12],
        [bx + ancho + 3 + extra, h + 2],
        [bx - ancho - 3 - extra, h + 2],
        [bx - ancho - extra, ytop + 12],
      ],
      color,
    );
    p.elipse(bx - ancho + 6, ytop + 10, 8 + extra, 8 + extra, color);
    p.elipse(bx + ancho - 6, ytop + 10, 8 + extra, 8 + extra, color);
  };
  const estilo = a.ropa.estilo;
  // Silueta
  cuerpo(P.negro, 1);
  if (estilo === 'tirantes' || estilo === 'lentejuelas') {
    // Hombros y brazos al aire.
    cuerpo(c.piel);
    p.elipse(bx - ancho + 6, ytop + 12, 6, 6, c.pielLuz);
    // Prenda
    const top = estilo === 'tirantes' ? ytop + 6 : ytop + 9;
    const ancho2 = ancho * (estilo === 'tirantes' ? 0.62 : 0.66);
    p.poligono(
      [
        [bx - ancho2, top],
        [bx + ancho2, top],
        [bx + ancho2 + 4, h + 2],
        [bx - ancho2 - 4, h + 2],
      ],
      P.negro,
    );
    p.poligono(
      [
        [bx - ancho2 + 1, top + 1],
        [bx + ancho2 - 1, top + 1],
        [bx + ancho2 + 3, h + 2],
        [bx - ancho2 - 3, h + 2],
      ],
      ropa.base,
    );
    if (estilo === 'tirantes') {
      // Escote redondo de la camiseta de tirantes y tirantes.
      p.elipse(bx, top + 1, 5, 4, c.piel, (_x, y) => y > top);
      p.rect(bx - ancho2 + 2, ytop - 1, 3, top - ytop + 3, ropa.base);
      p.rect(bx + ancho2 - 5, ytop - 1, 3, top - ytop + 3, ropa.base);
      p.linea(bx - 3, top + 6, bx + 3, top + 6, ropa.sombra);
      // Tatuaje del ancla en el brazo (lado izquierdo de la imagen).
      if (a.accesorios.includes('tatuajeAncla')) {
        const tx = bx - ancho + 5;
        const ty = ytop + 13 + dy;
        p.linea(tx, ty - 3, tx, ty + 3, a.ropa.detalle);
        p.linea(tx - 2, ty - 1, tx + 2, ty - 1, a.ropa.detalle);
        p.linea(tx - 3, ty + 2, tx - 1, ty + 4, a.ropa.detalle);
        p.linea(tx + 3, ty + 2, tx + 1, ty + 4, a.ropa.detalle);
        p.px(tx, ty - 4, a.ropa.detalle);
      }
      // Vello en el escote
      p.px(bx - 1, top + 2, c.linea);
      p.px(bx + 1, top + 3, c.linea);
    } else {
      // Lentejuelas: puntos brillantes en trama.
      for (let y = top + 2; y < h; y++)
        for (let x = Math.round(bx - ancho2 - 3); x < bx + ancho2 + 3; x++) {
          if (!p.opaco(x, y)) continue;
          const k = (x * 7 + y * 13) % 9;
          if (k === 0) p.px(x, y, a.ropa.detalle);
          else if (k === 4) p.px(x, y, ropa.sombra);
          else if (k === 7) p.px(x, y, ropa.luz);
        }
      // Tirantes finos
      p.linea(bx - ancho2 + 3, top, bx - ancho2 + 1, ytop + 1, ropa.sombra);
      p.linea(bx + ancho2 - 3, top, bx + ancho2 - 1, ytop + 1, ropa.sombra);
      // Collar de bisutería
      p.elipseBorde(bx, ytop + 1, 6, 4, D.oros_brillo);
    }
    return;
  }

  cuerpo(ropa.base);
  // Sombreado de la ropa a la derecha.
  for (let y = ytop; y < h; y++)
    for (let x = Math.round(bx + ancho * 0.45); x < bx + ancho + 5; x++) {
      if (p.get(x, y) !== 0 && p.opaco(x, y) && (x + y) % 2 === 0) p.px(x, y, ropa.sombra);
    }
  p.linea(bx - ancho + 2, ytop + 9, bx - ancho * 0.5, ytop + 3, ropa.luz);

  switch (estilo) {
    case 'chaleco': {
      // Camisa blanca en V, corbata y chaleco de punto granate.
      p.poligono(
        [
          [bx - 7, ytop + 1],
          [bx + 7, ytop + 1],
          [bx, ytop + 17],
        ],
        P.negro,
      );
      p.poligono(
        [
          [bx - 6, ytop + 1],
          [bx + 6, ytop + 1],
          [bx, ytop + 15],
        ],
        P.papel,
      );
      p.poligono(
        [
          [bx - 1, ytop + 3],
          [bx + 1, ytop + 3],
          [bx + 2, ytop + 12],
          [bx, ytop + 14],
          [bx - 2, ytop + 12],
        ],
        P.espadas,
      );
      // Punto del chaleco
      for (let y = ytop + 4; y < h; y += 2)
        for (let x = Math.round(bx - ancho); x < bx + ancho; x += 3) {
          const px = x + (y % 4 === 0 ? 1 : 0);
          if (p.get(px, y) === p.get(Math.round(bx - ancho * 0.6), ytop + 20)) p.px(px, y, ropa.sombra);
        }
      // Bolsillo con bolígrafo
      if (a.accesorios.includes('boligrafo')) {
        const bxp = bx + 9;
        p.rect(bxp, ytop + 12, 6, 1, ropa.sombra);
        p.rect(bxp + 2, ytop + 7, 1, 6, P.espadas);
        p.px(bxp + 2, ytop + 6, D.gris_claro);
      }
      break;
    }
    case 'bata': {
      // Bata rosa con cuello blanco y botones.
      p.poligono(
        [
          [bx - 8, ytop],
          [bx, ytop + 7],
          [bx - 3, ytop + 9],
          [bx - 11, ytop + 3],
        ],
        a.ropa.detalle,
      );
      p.poligono(
        [
          [bx + 8, ytop],
          [bx, ytop + 7],
          [bx + 3, ytop + 9],
          [bx + 11, ytop + 3],
        ],
        a.ropa.detalle,
      );
      p.linea(bx, ytop + 7, bx, h, ropa.sombra);
      for (let y = ytop + 12; y < h; y += 6) p.px(bx + 2, y, a.ropa.detalle);
      p.rect(bx - 14, ytop + 18, 7, 1, ropa.sombra);
      // Peine en el bolsillo
      p.rect(bx - 13, ytop + 14, 5, 4, P.tinta);
      p.linea(bx - 13, ytop + 17, bx - 9, ytop + 17, ropa.base);
      break;
    }
    case 'rebeca': {
      // Blusa blanca, rebeca negra abierta y broche dorado.
      p.poligono(
        [
          [bx - 6, ytop],
          [bx + 6, ytop],
          [bx + 5, h + 2],
          [bx - 5, h + 2],
        ],
        P.papel,
      );
      p.linea(bx - 6, ytop, bx - 5, h, P.tinta);
      p.linea(bx + 6, ytop, bx + 5, h, P.tinta);
      p.rect(bx - 3, ytop, 7, 2, P.papel);
      p.linea(bx - 3, ytop + 2, bx + 3, ytop + 2, D.papel_sombra);
      if (a.accesorios.includes('broche')) {
        elipseC(p, bx - 11, ytop + 9, 2, 2, P.oros);
        p.px(bx - 11, ytop + 9, D.copas_brillo);
      }
      break;
    }
    case 'sudadera': {
      // Sudadera universitaria con capucha, cordones y letras.
      p.elipse(bx, ytop + 1, 11, 4, ropa.sombra, (_x, y) => y >= ytop);
      p.linea(bx - 3, ytop + 3, bx - 3, ytop + 9, a.ropa.detalle);
      p.linea(bx + 3, ytop + 3, bx + 3, ytop + 9, a.ropa.detalle);
      // «UV» (Universidad de Villaenvite, inventada)
      const lx = bx - 6;
      const ly = ytop + 12;
      const U = ['#...#', '#...#', '#...#', '.###.'];
      const V = ['#...#', '#...#', '.#.#.', '..#..'];
      U.forEach((f, j) => [...f].forEach((ch, i) => ch === '#' && p.px(lx + i, ly + j, a.ropa.detalle)));
      V.forEach((f, j) => [...f].forEach((ch, i) => ch === '#' && p.px(lx + 7 + i, ly + j, a.ropa.detalle)));
      break;
    }
    case 'uniforme': {
      // Guerrera azul marino con botones dorados y cuello.
      p.poligono(
        [
          [bx - 6, ytop],
          [bx + 6, ytop],
          [bx, ytop + 8],
        ],
        P.papel,
      );
      p.rect(bx - 1, ytop + 1, 3, 6, P.tinta);
      p.linea(bx - 6, ytop, bx, ytop + 8, P.negro);
      p.linea(bx + 6, ytop, bx, ytop + 8, P.negro);
      for (let y = ytop + 11; y < h; y += 5) {
        p.px(bx - 1, y, P.oros);
        p.px(bx, y, D.oros_brillo);
      }
      p.linea(bx, ytop + 8, bx, h, ropa.sombra);
      // Hombreras
      p.rect(bx - ancho + 4, ytop + 3, 9, 2, P.oros);
      p.rect(bx + ancho - 13, ytop + 3, 9, 2, P.oros);
      break;
    }
    case 'delantal': {
      p.rect(bx - 12, ytop + 8, 24, h - ytop, P.papel);
      p.rectBorde(bx - 12, ytop + 8, 24, h - ytop, P.negro);
      p.linea(bx - 12, ytop + 8, bx - 6, ytop, D.papel_sombra);
      p.linea(bx + 12, ytop + 8, bx + 6, ytop, D.papel_sombra);
      break;
    }
  }
}

function accesorios(p: Pixeles, a: Aspecto, g: Geo, ex: Expresion, c: Colores): void {
  const frontal = g.vista === 'frontal';
  const acc = new Set(a.accesorios);
  const ojos = [g.ojoA, g.ojoB];
  if (acc.has('gafasRedondas')) {
    for (const o of ojos) {
      const r = 4.2 * (o.k < 1 ? 0.75 : 1);
      p.elipseBorde(o.x, g.yOjos, r + 0.8, 4 + 0.6, P.negro);
      p.elipseBorde(o.x, g.yOjos, r, 3.9, P.tinta);
      p.px(o.x - 2, g.yOjos - 2, D.blanco);
    }
    p.linea(g.ojoA.x + 4, g.yOjos - 1, g.ojoB.x - 4, g.yOjos - 1, P.negro);
    if (frontal) {
      p.linea(g.cx - g.rx, g.yOjos - 1, g.ojoA.x - 5, g.yOjos - 1, P.negro);
      p.linea(g.cx + g.rx, g.yOjos - 1, g.ojoB.x + 5, g.yOjos - 1, P.negro);
    } else p.linea(g.cx - g.rx + 2, g.yOjos - 1, g.ojoA.x - 5, g.yOjos - 1, P.negro);
  }
  if (acc.has('gafasAlambre')) {
    for (const o of ojos) {
      const w = o.k < 1 ? 3 : 4;
      p.rectBorde(o.x - w, g.yOjos - 3, w * 2 + 1, 6, D.gris_claro);
    }
    p.linea(g.ojoA.x + 4, g.yOjos - 2, g.ojoB.x - 3, g.yOjos - 2, D.gris_claro);
    if (frontal) {
      p.linea(g.cx - g.rx, g.yOjos - 2, g.ojoA.x - 4, g.yOjos - 2, D.gris_claro);
      p.linea(g.cx + g.rx, g.yOjos - 2, g.ojoB.x + 4, g.yOjos - 2, D.gris_claro);
    }
  }
  if (acc.has('gafasCadenita')) {
    // Gafas de media luna, bajas, con cadenita dorada.
    for (const o of ojos) {
      const w = o.k < 1 ? 3 : 4;
      p.linea(o.x - w, g.yOjos + 2, o.x + w, g.yOjos + 2, P.tinta);
      p.linea(o.x - w, g.yOjos, o.x - w, g.yOjos + 2, P.tinta);
      p.linea(o.x + w, g.yOjos, o.x + w, g.yOjos + 2, P.tinta);
    }
    p.linea(g.ojoA.x + 4, g.yOjos + 1, g.ojoB.x - 3, g.yOjos + 1, P.tinta);
    const lados = frontal ? [-1, 1] : [-1];
    for (const lado of lados) {
      const x0 = g.cx + lado * (g.rx - 1);
      for (let k = 0; k < 16; k += 2) p.px(x0 + lado * Math.sin(k / 5) * 2, g.yOjos + 3 + k, P.oros);
    }
  }
  if (acc.has('aros')) {
    const lados = frontal ? [-1, 1] : [-1];
    for (const lado of lados) {
      const x = g.cx + lado * (g.rx + (frontal ? 0 : -2));
      p.elipseBorde(x, g.yOjos + 11, 3, 3.5, P.oros);
      p.px(x - 1, g.yOjos + 8, D.oros_brillo);
    }
  }
  if (acc.has('bigotePoblado')) {
    const x = g.mx + (frontal ? 0 : 1);
    const y = g.yBoca - 2;
    const w = frontal ? 7 : 6;
    p.poligono(
      [
        [x - w, y + 3],
        [x - 2, y - 1],
        [x + 2, y - 1],
        [x + w, y + 3],
        [x + w - 2, y + 2],
        [x, y + 1],
        [x - w + 2, y + 2],
      ],
      P.tinta,
    );
    p.linea(x - 3, y, x + 3, y, a.pelo.color);
  }
  if (acc.has('bigotito')) {
    const x = g.mx + (frontal ? 0 : 1);
    const y = g.yBoca - 2;
    p.linea(x - 4, y, x - 1, y, P.tinta);
    p.linea(x + 1, y, x + 4, y, P.tinta);
  }
  if (acc.has('palillo') && ex.boca !== 'A' && ex.boca !== 'sorpresa') {
    const x = g.mx + g.anchoBoca / 2;
    p.linea(x, g.yBoca, x + 5, g.yBoca + 2, P.barniz);
  }
  if (acc.has('walkman')) {
    // Cascos colgados del cuello y el aparato con el cable.
    const y = g.cy + g.ry + 2;
    p.elipseBorde(g.cx, y, 9, 4, D.gris);
    p.elipse(g.cx - 9, y + 1, 2.5, 2.5, P.oros);
    p.elipse(g.cx + 9, y + 1, 2.5, 2.5, P.oros);
    p.rect(g.cx + 6, g.h - 12, 9, 7, P.negro);
    p.rect(g.cx + 7, g.h - 11, 7, 5, D.gris_claro);
    p.rect(g.cx + 8, g.h - 10, 3, 2, P.tinta);
    p.linea(g.cx + 9, y + 3, g.cx + 10, g.h - 12, P.tinta);
  }
  if (acc.has('corneta')) {
    // Corneta de pregonero colgada al costado.
    const x = g.cx - g.hombros + 3;
    const y = g.h - 14;
    p.elipse(x, y, 3.5, 4.5, P.negro);
    p.elipse(x, y, 2.5, 3.5, P.oros);
    p.linea(x + 2, y - 2, x + 11, y - 6, D.oros_osc);
    p.linea(x + 2, y - 1, x + 11, y - 5, P.oros);
    p.px(x - 1, y - 1, D.oros_brillo);
  }
  if (acc.has('trapo')) {
    const x = g.cx + g.hombros - 10;
    const y = g.cy + g.ry + 4;
    p.rect(x, y, 8, 12, P.negro);
    p.rect(x + 1, y + 1, 6, 10, P.papel);
    for (let k = 0; k < 10; k += 3) p.linea(x + 1, y + 1 + k, x + 6, y + 1 + k, P.copas);
  }
  if (ex.mano) {
    // Mano en la barbilla (pensar).
    const x = g.mx + (frontal ? 3 : 4);
    const y = g.cy + g.ry - 1;
    p.poligono(
      [
        [x - 4, y + 2],
        [x + 5, y + 2],
        [x + 8, g.h],
        [x - 2, g.h],
      ],
      P.negro,
    );
    p.poligono(
      [
        [x - 3, y + 3],
        [x + 4, y + 3],
        [x + 7, g.h],
        [x - 1, g.h],
      ],
      a.ropa.estilo === 'tirantes' || a.ropa.estilo === 'lentejuelas' ? c.piel : a.ropa.color,
    );
    elipseC(p, x, y + 1, 4.5, 3.5, c.piel);
    p.linea(x - 3, y, x + 3, y, c.linea);
    p.linea(x - 3, y + 2, x + 2, y + 2, c.linea);
    if (acc.has('unasRojas')) {
      p.px(x - 3, y - 1, D.rojo_labios);
      p.px(x - 1, y - 2, D.rojo_labios);
      p.px(x + 1, y - 2, D.rojo_labios);
    }
  }
}

// ---------------------------------------------------------------------------
// Composición de un fotograma
// ---------------------------------------------------------------------------

export function dibujarBusto(a: Aspecto, vista: Vista, ex: Expresion): Pixeles {
  const g = geometria(a, vista, ex);
  const c = PIELES[a.piel];
  const p = new Pixeles(g.w, g.h);
  const dy = ex.dy ?? 0;

  peloDetras(p, a, g);
  torso(p, a, g, c, dy);

  // Cuello
  const nx = vista === 'frontal' ? g.cx : g.cx + 1;
  const cuelloW = 5 + (a.corpulencia > 1.1 ? 2 : 0);
  p.rect(nx - cuelloW - 1, g.cy + g.ry - 8, cuelloW * 2 + 2, 14, P.negro);
  p.rect(nx - cuelloW, g.cy + g.ry - 8, cuelloW * 2, 14, c.pielSombra);
  p.linea(nx - cuelloW, g.cy + g.ry + 1, nx + cuelloW - 1, g.cy + g.ry + 1, c.linea);

  // Orejas
  const orejas = vista === 'frontal' ? [-1, 1] : [-1];
  for (const lado of orejas) {
    const ox = g.cx + lado * (g.rx - (vista === 'frontal' ? 0 : 3));
    elipseC(p, ox, g.yOjos + 3, 2.5, 4, c.piel);
    p.linea(ox, g.yOjos + 1, ox, g.yOjos + 5, c.pielSombra);
  }

  // Cabeza con sombreado (luz desde arriba a la izquierda).
  const cabeza = (x: number, y: number) => ((x + 0.5 - g.cx) / g.rx) ** 2 + ((y + 0.5 - g.cy) / g.ry) ** 2 <= 1;
  elipseC(p, g.cx, g.cy, g.rx, g.ry, c.piel);
  if (a.cara.forma === 'cuadrada') {
    // Mandíbula cuadrada
    p.rect(g.cx - g.rx + 1, g.cy + 4, 2 * g.rx - 1, g.ry - 5, c.piel);
    p.linea(g.cx - g.rx, g.cy + 4, g.cx - g.rx, g.cy + g.ry - 2, P.negro);
    p.linea(g.cx + g.rx, g.cy + 4, g.cx + g.rx, g.cy + g.ry - 2, P.negro);
    p.linea(g.cx - g.rx + 1, g.cy + g.ry - 1, g.cx + g.rx - 1, g.cy + g.ry - 1, P.negro);
    p.px(g.cx - g.rx, g.cy + g.ry - 1, P.negro);
    p.px(g.cx + g.rx, g.cy + g.ry - 1, P.negro);
  }
  for (let y = Math.floor(g.cy - g.ry); y <= g.cy + g.ry; y++)
    for (let x = Math.floor(g.cx - g.rx); x <= g.cx + g.rx; x++) {
      if (!cabeza(x, y)) continue;
      const u = (x - g.cx) / g.rx;
      const v = (y - g.cy) / g.ry;
      const k = u + v * 0.35;
      const umbral = vista === 'frontal' ? 0.66 : 0.6;
      if (k > umbral && p.get(x, y) !== 0) {
        // Tramado sólo en la franja de transición; más allá, sombra sólida.
        if (k > umbral + 0.1 || (x + y) % 2 === 0) p.px(x, y, c.pielSombra);
      } else if (u < -0.45 && v < -0.2 && u * u + v * v < 0.75 && (x + y) % 2 === 0) {
        p.px(x, y, c.pielLuz);
      }
    }
  // Mejillas sonrosadas (Rufi, Marisa…)
  if (a.cara.labios === 'pintados' || a.pelo.estilo === 'permanente') {
    for (const o of vista === 'frontal' ? [g.ojoA, g.ojoB] : [g.ojoA]) {
      p.px(o.x - 1, g.yOjos + 5, D.copas_brillo);
      p.px(o.x + 1, g.yOjos + 5, D.copas_brillo);
      p.px(o.x, g.yOjos + 6, D.copas_brillo);
    }
  }
  // Barba de tres días (Canijo)
  if (a.accesorios.includes('bigotePoblado')) {
    for (let y = g.yBoca - 1; y < g.cy + g.ry; y++)
      for (let x = Math.floor(g.cx - g.rx); x < g.cx + g.rx; x++) {
        if (cabeza(x, y) && (x * 3 + y * 5) % 4 === 0 && p.get(x, y) !== 0) p.px(x, y, c.linea);
      }
  }

  arrugas(p, a, g, c);
  cejas(p, a, g, ex);
  ojo(p, g.ojoA.x, g.yOjos, g.ojoA.k, ex, 'A', c, vista === 'frontal');
  ojo(p, g.ojoB.x, g.yOjos, g.ojoB.k, ex, 'B', c, vista === 'frontal');
  nariz(p, a, g, c);
  boca(p, a, g, ex, c);
  peloDelante(p, a, g);
  accesorios(p, a, g, ex, c);
  return p;
}

/** Hoja de sprites de un personaje: todos los fotogramas en fila + etiquetas. */
export interface HojaGenerada {
  vista: Vista;
  w: number;
  h: number;
  frames: Record<string, Pixeles>;
}

export function generarHoja(a: Aspecto, vista: Vista): HojaGenerada {
  const { w, h } = TAMANO_VISTA[vista];
  const frames: Record<string, Pixeles> = {};
  for (const [nombre, ex] of Object.entries(EXPRESIONES)) frames[nombre] = dibujarBusto(a, vista, ex);
  return { vista, w, h, frames };
}
