// El Bar El Envite: fondo estático (pared, zócalo, pizarra, puerta, barra, estantes,
// tele, mesa) y las partes vivas (tele, neón con ciclo de paleta, tubo fluorescente,
// reloj y Nicanor trajinando detrás de la barra).

import { texto } from '../core/bitmapFont';
import { DERIVADOS as D, PALETA as P, mezclar } from '../data/palette';
import { Pixeles } from './pixel';
import { LAYOUT, MESA_Y } from './tableLayout';

function hash2(x: number, y: number): number {
  let h = (x * 374761393 + y * 668265263) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const ZOCALO_Y = 62;

// ---------------------------------------------------------------------------
// Fondo estático
// ---------------------------------------------------------------------------

function pared(p: Pixeles): void {
  const veta = mezclar(P.pared, P.pared_sombra, 0.25);
  p.rect(0, 0, 320, MESA_Y, P.pared);
  for (let y = 0; y < ZOCALO_Y; y++)
    for (let x = 0; x < 320; x++) {
      const h = hash2(x, y);
      if (h < 0.035) p.px(x, y, veta);
    }
  // Techo y moldura
  p.rect(0, 0, 320, 1, P.pared_sombra);
  // Sombra del techo (la luz viene del tubo, en el centro)
  for (let x = 0; x < 320; x++) {
    const d = Math.abs(x - 160) / 160;
    for (let y = 1; y < 1 + Math.round(d * 5); y++) if ((x + y) % 2 === 0) p.px(x, y, veta);
  }
}

function zocalo(p: Pixeles): void {
  // Azulejos de 8×8 con junta, a dos tonos, y una cenefa arriba.
  for (let y = ZOCALO_Y + 3; y < MESA_Y; y++)
    for (let x = 0; x < 320; x++) {
      const tx = Math.floor(x / 8);
      const ty = Math.floor((y - ZOCALO_Y - 3) / 8);
      const lx = x % 8;
      const ly = (y - ZOCALO_Y - 3) % 8;
      let c: string = (tx + ty) % 2 === 0 ? P.azulejo : P.azulejo_osc;
      if (lx === 7 || ly === 7) c = P.pared_sombra;
      else if ((lx === 1 && ly >= 1 && ly <= 2) || (ly === 1 && lx >= 1 && lx <= 2)) c = P.azulejo_brillo;
      p.px(x, y, c);
    }
  p.rect(0, ZOCALO_Y, 320, 1, P.azulejo_osc);
  p.rect(0, ZOCALO_Y + 1, 320, 1, P.azulejo_brillo);
  p.rect(0, ZOCALO_Y + 2, 320, 1, P.azulejo_osc);
}

function pizarraMarco(p: Pixeles): void {
  const { x, y, w, h } = LAYOUT.pizarra;
  p.rect(x - 2, y - 2, w + 4, h + 5, P.negro);
  p.rect(x - 1, y - 1, w + 2, h + 3, P.madera);
  p.rect(x - 1, y - 1, w + 2, 1, P.madera_clara);
  p.rect(x, y, w, h, P.pizarra);
  // Repisa para la tiza
  p.rect(x - 1, y + h, w + 2, 2, P.madera_osc);
  p.rect(x + 50, y + h - 1, 6, 1, P.tiza);
  // Restos de tiza borrada
  for (let k = 0; k < 90; k++) {
    const px = x + 2 + Math.floor(hash2(k, 3) * (w - 4));
    const py = y + 2 + Math.floor(hash2(k, 7) * (h - 4));
    p.px(px, py, D.pizarra_clara);
  }
}

function puerta(p: Pixeles): void {
  const { x, y, w, h } = LAYOUT.puerta;
  // Marco
  p.rect(x - 3, y - 3, w + 6, h + 3, P.negro);
  p.rect(x - 2, y - 2, w + 4, h + 2, P.madera_osc);
  // Hoja de la puerta
  p.rect(x, y, w, h, P.madera);
  p.rect(x + w - 2, y, 2, h, D.madera_muy_osc);
  // Cristal superior (se ve la calle)
  p.rect(x + 3, y + 3, w - 7, 26, P.negro);
  p.rect(x + 4, y + 4, w - 9, 24, D.cielo);
  p.rect(x + 4, y + 18, w - 9, 10, P.pared_sombra);
  p.rect(x + 4, y + 24, w - 9, 4, D.gris);
  p.linea(x + 4, y + 5, x + 10, y + 5, D.blanco);
  p.linea(x + 5, y + 7, x + 8, y + 7, D.blanco);
  // Travesaño y cuarterones
  p.rect(x + 3, y + 33, w - 7, 16, P.madera_osc);
  p.rect(x + 4, y + 34, w - 9, 14, P.madera_clara);
  p.rect(x + 3, y + 53, w - 7, 16, P.madera_osc);
  p.rect(x + 4, y + 54, w - 9, 14, P.madera_clara);
  // Pomo
  p.rect(x + w - 6, y + 42, 2, 3, P.oros);
  // Rótulo «ABIERTO» colgado del cristal
  p.rect(x + 6, y + 11, 13, 5, P.papel);
  p.rect(x + 7, y + 13, 11, 1, P.copas);
}

function reloj(p: Pixeles): void {
  // Reloj de pared sobre la puerta (las agujas se dibujan en vivo).
  const cx = 99;
  const cy = 6;
  p.elipse(cx, cy, 6, 6, P.negro);
  p.elipse(cx, cy, 5, 5, P.papel);
  for (let k = 0; k < 12; k += 3) {
    const a = (k / 12) * Math.PI * 2;
    p.px(cx + Math.sin(a) * 4, cy - Math.cos(a) * 4, P.tinta);
  }
}

function cartel(p: Pixeles): void {
  // Cartel del campeonato clavado en la pared.
  const x = 113;
  const y = 18;
  p.rect(x, y, 24, 32, P.negro);
  p.rect(x + 1, y + 1, 22, 30, P.papel);
  p.rect(x + 1, y + 1, 22, 7, P.copas);
  p.rect(x + 1, y + 29, 22, 2, P.oros);
  // Rayitas de texto
  for (let k = 0; k < 4; k++) p.rect(x + 4, y + 18 + k * 3, 16 - (k % 2) * 5, 1, D.gris);
  // Dos cartas en miniatura
  p.rect(x + 5, y + 10, 5, 7, P.tinta);
  p.rect(x + 6, y + 11, 3, 5, D.blanco);
  p.px(x + 7, y + 13, P.copas);
  p.rect(x + 12, y + 9, 5, 7, P.tinta);
  p.rect(x + 13, y + 10, 3, 5, D.blanco);
  p.px(x + 14, y + 12, P.oros);
  // Chincheta
  p.px(x + 11, y, P.copas);
}

function barra(p: Pixeles): void {
  const x0 = 196;
  // Estantes con botellas detrás de la barra
  p.rect(x0, 24, 320 - x0, 26, P.madera_osc);
  p.rect(x0, 24, 320 - x0, 1, P.negro);
  for (const ey of [34, 46]) {
    p.rect(x0, ey, 72, 2, P.madera_clara);
    p.rect(x0, ey + 2, 72, 1, D.madera_muy_osc);
  }
  const botellas = [P.bastos, D.copas_osc, P.oros, D.espadas_osc, P.papel, P.bastos, D.gris, P.copas, D.oros_osc];
  for (let k = 0; k < 11; k++) {
    const bx = x0 + 3 + k * 6;
    const c = botellas[k % botellas.length];
    const alto = 6 + (k % 3);
    p.rect(bx, 34 - alto, 3, alto, c);
    p.rect(bx + 1, 34 - alto - 2, 1, 2, c);
    p.px(bx, 34 - alto + 1, D.blanco);
  }
  for (let k = 0; k < 9; k++) {
    const bx = x0 + 4 + k * 7;
    p.rect(bx, 41, 4, 5, k % 2 ? P.papel : D.gris_claro);
    p.rect(bx, 41, 4, 1, D.blanco);
  }
  // Mostrador
  p.rect(x0 - 2, 50, 320 - x0 + 2, 4, P.negro);
  p.rect(x0 - 1, 50, 320 - x0 + 1, 3, P.barniz);
  p.rect(x0 - 1, 50, 320 - x0 + 1, 1, D.oros_brillo);
  p.rect(x0 - 1, 54, 320 - x0 + 1, MESA_Y - 54, P.madera);
  for (let bx = x0 + 6; bx < 320; bx += 14) {
    p.rect(bx, 57, 10, MESA_Y - 60, P.madera_clara);
    p.rect(bx, 57, 10, 1, P.madera_osc);
  }
  p.rect(x0 - 1, 54, 1, MESA_Y - 54, P.negro);
  // Cafetera sobre la barra
  p.rect(246, 38, 18, 12, P.negro);
  p.rect(247, 39, 16, 10, D.gris_claro);
  p.rect(247, 39, 16, 2, P.copas);
  p.rect(250, 45, 3, 3, P.tinta);
  p.rect(257, 45, 3, 3, P.tinta);
  p.px(252, 42, P.bastos);
  // Grifo de cerveza
  p.rect(200, 42, 2, 8, D.gris);
  p.rect(199, 40, 4, 2, P.oros);
  p.rect(199, 38, 4, 2, P.negro);
  // Servilletero y tapa de tortilla
  p.rect(236, 46, 6, 4, D.gris_claro);
  p.rect(237, 45, 4, 1, D.blanco);
}

function tele(p: Pixeles): void {
  const { x, y, w, h } = LAYOUT.tele;
  // Soporte de pared
  p.rect(x + w / 2 - 2, y + h, 4, 6, D.gris);
  p.rect(x + w / 2 - 6, y + h + 5, 12, 2, D.gris);
  // Carcasa
  p.rect(x - 1, y - 1, w + 2, h + 2, P.negro);
  p.rect(x, y, w, h, D.gris);
  p.rect(x, y, w, 1, D.gris_claro);
  p.rect(x + w - 8, y + 4, 6, h - 8, D.tele_osc);
  p.px(x + w - 5, y + 7, P.copas);
  p.px(x + w - 5, y + 12, D.gris_claro);
  p.px(x + w - 5, y + 16, D.gris_claro);
  // Antena
  p.linea(x + 10, y - 1, x + 4, y - 4, D.gris);
  p.linea(x + 12, y - 1, x + 18, y - 4, D.gris);
}

function mesa(p: Pixeles): void {
  // Tablero de madera en perspectiva: trapecio con tablas que convergen.
  const top = MESA_Y;
  const xiTop = 26;
  const xdTop = 294;
  const ancho = (y: number) => {
    const t = (y - top) / (200 - top);
    return { a: xiTop - t * 90, b: xdTop + t * 90 };
  };
  for (let y = top; y < 200; y++) {
    const { a, b } = ancho(y);
    for (let x = Math.max(0, Math.floor(a)); x < Math.min(320, Math.ceil(b)); x++) p.px(x, y, P.madera);
  }
  // Tablas: líneas desde el borde de abajo hacia el punto de fuga.
  for (let k = -6; k <= 6; k++) {
    const xb = 160 + k * 34;
    const xt = 160 + k * 34 * 0.52;
    p.linea(xt, top + 2, xb, 199, P.madera_osc);
  }
  // Vetas y nudos
  for (let k = 0; k < 160; k++) {
    const y = top + 4 + Math.floor(hash2(k, 11) * (200 - top - 6));
    const { a, b } = ancho(y);
    const x = Math.floor(a + hash2(k, 13) * (b - a));
    const l = 3 + Math.floor(hash2(k, 17) * 6);
    for (let i = 0; i < l; i++) if (p.opaco(x + i, y)) p.px(x + i, y, k % 3 ? P.madera_clara : P.madera_osc);
  }
  // Brillo del barniz bajo el tubo
  p.elipse(160, top + 22, 70, 9, P.madera_clara, (x, y) => (x + y) % 2 === 0 && p.opaco(x, y));
  p.elipse(160, top + 20, 36, 4, P.barniz, (x, y) => (x + y) % 2 === 0 && p.opaco(x, y));
  // Canto del fondo
  p.linea(xiTop, top, xdTop, top, P.negro);
  p.linea(xiTop, top + 1, xdTop, top + 1, P.barniz);
  p.linea(xiTop + 1, top + 2, xdTop - 1, top + 2, P.madera_osc);
  // Cantos laterales
  for (let y = top; y < 200; y++) {
    const { a, b } = ancho(y);
    p.px(a, y, P.negro);
    p.px(a + 1, y, P.barniz);
    p.px(b - 1, y, P.negro);
    p.px(b - 2, y, P.madera_osc);
  }
  // Suelo a los lados de la mesa
  for (let y = top; y < 200; y++) {
    const { a, b } = ancho(y);
    for (let x = 0; x < a; x++) p.px(x, y, (x + y) % 4 === 0 ? P.madera_osc : D.madera_muy_osc);
    for (let x = Math.ceil(b); x < 320; x++) p.px(x, y, (x + y) % 4 === 0 ? P.madera_osc : D.madera_muy_osc);
  }
}

function lampara(p: Pixeles): void {
  // Soporte del tubo fluorescente (el tubo se dibuja en vivo).
  p.rect(130, 0, 60, 3, D.gris);
  p.rect(130, 3, 60, 1, P.negro);
  p.rect(129, 0, 1, 5, P.negro);
  p.rect(190, 0, 1, 5, P.negro);
}

let fondoCache: HTMLCanvasElement | null = null;

export function fondoBar(): HTMLCanvasElement {
  if (fondoCache) return fondoCache;
  const p = new Pixeles(320, 200);
  pared(p);
  zocalo(p);
  pizarraMarco(p);
  reloj(p);
  cartel(p);
  lampara(p);
  barra(p);
  tele(p);
  puerta(p);
  mesa(p);
  fondoCache = p.aCanvas();
  return fondoCache;
}

// ---------------------------------------------------------------------------
// Partes vivas
// ---------------------------------------------------------------------------

/** Rótulo de neón «EL ENVITE» con ciclo de paleta: las letras se encienden en ola. */
export function dibujarNeon(ctx: CanvasRenderingContext2D, t: number): void {
  const letras = 'EL ENVITE';
  const x0 = 202;
  const y0 = 8;
  const fase = Math.floor(t / 140);
  const ciclo = fase % 26;
  [...letras].forEach((ch, i) => {
    if (ch === ' ') return;
    let encendida = true;
    if (ciclo < 9) encendida = i <= ciclo;
    else if (ciclo >= 18 && ciclo < 22) encendida = ciclo % 2 === 0;
    const col = encendida ? P.neon : mezclar(P.neon, P.pared_sombra, 0.75);
    if (encendida) texto(ctx, ch, x0 + i * 6 + 1, y0 + 1, mezclar(P.neon, P.pared, 0.55));
    texto(ctx, ch, x0 + i * 6, y0, col);
  });
}

/** Tubo fluorescente: parpadea muy de vez en cuando. */
export function dibujarFluorescente(ctx: CanvasRenderingContext2D, t: number): void {
  const periodo = t % 17000;
  const parpadeo = periodo > 16400 && Math.floor(periodo / 60) % 3 === 0;
  ctx.fillStyle = parpadeo ? D.gris_claro : P.fluorescente;
  ctx.fillRect(132, 4, 56, 2);
  if (!parpadeo) {
    ctx.fillStyle = D.blanco;
    ctx.fillRect(140, 4, 30, 1);
  }
}

/** Agujas del reloj: hora real del jugador (a las siete, como en el bando, si no hay). */
export function dibujarReloj(ctx: CanvasRenderingContext2D, fecha = new Date()): void {
  const cx = 99;
  const cy = 6;
  const h = ((fecha.getHours() % 12) + fecha.getMinutes() / 60) / 12;
  const m = fecha.getMinutes() / 60;
  const linea = (ang: number, largo: number, color: string) => {
    ctx.fillStyle = color;
    for (let k = 0; k <= largo; k++) {
      ctx.fillRect(Math.round(cx + Math.sin(ang) * k), Math.round(cy - Math.cos(ang) * k), 1, 1);
    }
  };
  linea(h * Math.PI * 2, 2.5, P.tinta);
  linea(m * Math.PI * 2, 4, P.copas);
}

/** Pantalla de la tele: nieve, carta de ajuste o un partido borroso, en bucle. */
export function dibujarTele(ctx: CanvasRenderingContext2D, t: number): void {
  const { x, y, w, h } = LAYOUT.tele;
  const sx = x + 3;
  const sy = y + 3;
  const sw = w - 13;
  const sh = h - 6;
  const modo = Math.floor(t / 9000) % 3;
  if (modo === 0) {
    // Partido borroso: césped a rayas, jugadores que corretean y el balón.
    for (let k = 0; k < sh; k++) {
      ctx.fillStyle = Math.floor((k + t / 400) / 3) % 2 ? P.bastos : D.bastos_osc;
      ctx.fillRect(sx, sy + k, sw, 1);
    }
    for (let j = 0; j < 6; j++) {
      const jx = sx + ((j * 7 + t / (180 + j * 40)) % sw);
      const jy = sy + 4 + ((j * 5 + Math.sin(t / 700 + j) * 4 + 20) % (sh - 6));
      ctx.fillStyle = j % 2 ? P.copas : D.blanco;
      ctx.fillRect(Math.floor(jx), Math.floor(jy), 1, 2);
    }
    ctx.fillStyle = D.blanco;
    ctx.fillRect(
      Math.floor(sx + sw / 2 + Math.sin(t / 500) * 10),
      Math.floor(sy + sh / 2 + Math.cos(t / 330) * 5),
      1,
      1,
    );
    ctx.fillStyle = P.tinta;
    ctx.fillRect(sx + 1, sy + 1, 9, 3);
    ctx.fillStyle = P.oros;
    ctx.fillRect(sx + 2, sy + 2, 2, 1);
    ctx.fillRect(sx + 6, sy + 2, 2, 1);
  } else if (modo === 1) {
    // Carta de ajuste inventada: barras de color y un círculo.
    const barras = [D.blanco, P.oros, P.neon, P.bastos, D.copas_brillo, P.copas, P.espadas, P.tinta];
    barras.forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.fillRect(sx + Math.floor((i * sw) / barras.length), sy, Math.ceil(sw / barras.length), sh);
    });
    ctx.fillStyle = P.tinta;
    ctx.fillRect(sx + sw / 2 - 5, sy + sh / 2 - 5, 10, 10);
    ctx.fillStyle = D.gris_claro;
    ctx.fillRect(sx + sw / 2 - 4, sy + sh / 2 - 4, 8, 8);
    ctx.fillStyle = P.tinta;
    ctx.fillRect(sx + sw / 2 - 4, sy + sh / 2, 8, 1);
    ctx.fillRect(sx + sw / 2, sy + sh / 2 - 4, 1, 8);
  } else {
    // Nieve
    const semilla = Math.floor(t / 50);
    for (let j = 0; j < sh; j++)
      for (let i = 0; i < sw; i++) {
        const v = hash2(i + semilla * 31, j + semilla * 17);
        ctx.fillStyle = v < 0.33 ? P.tinta : v < 0.66 ? D.gris : D.gris_claro;
        ctx.fillRect(sx + i, sy + j, 1, 1);
      }
  }
  // Brillo del cristal
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillRect(sx + 1, sy + 1, 4, 1);
}

// ---------------------------------------------------------------------------
// Nicanor, el camarero
// ---------------------------------------------------------------------------

export type AccionNicanor = 'secar' | 'cana' | 'tortilla' | 'fregar' | 'tele' | 'aplaudir' | 'quieto';

const NW = 30;
const NH = 30;

function dibujarNicanor(accion: AccionNicanor, f: number): Pixeles {
  const p = new Pixeles(NW, NH);
  const piel = P.piel_2;
  const pielS = D.piel_2_sombra;
  const cx = 15;
  // Cuerpo: camisa blanca, delantal y trapo al hombro.
  p.elipse(cx, 29, 12, 11, P.negro);
  p.elipse(cx, 29, 11, 10, P.papel);
  p.rect(cx - 6, 22, 12, 8, D.papel_sombra);
  p.rect(cx - 5, 23, 10, 7, P.papel);
  p.linea(cx - 6, 22, cx - 3, 18, D.gris);
  p.linea(cx + 6, 22, cx + 3, 18, D.gris);
  p.rect(cx + 5, 18, 4, 7, P.copas);
  p.linea(cx + 5, 20, cx + 8, 20, P.papel);
  // Cabeza
  p.rect(cx - 2, 15, 5, 4, pielS);
  p.elipse(cx, 10, 6.5, 7.5, P.negro);
  p.elipse(cx, 10, 5.5, 6.5, piel);
  p.elipse(cx, 5, 6, 3.5, P.tinta, (_x, y) => y <= 6);
  p.px(cx - 6, 10, piel);
  p.px(cx + 6, 10, piel);
  // Ojos, bigote y palillo
  const parpadea = accion === 'quieto' && f === 1;
  p.px(cx - 2, 9, parpadea ? pielS : P.tinta);
  p.px(cx + 2, 9, parpadea ? pielS : P.tinta);
  p.rect(cx - 2, 12, 5, 1, P.tinta);
  p.px(cx, 11, pielS);
  p.linea(cx + 2, 14, cx + 5, 15, P.barniz);
  if (accion === 'aplaudir') p.rect(cx - 1, 13, 3, 1, D.copas_osc);
  // Brazos según la acción
  const brazo = (x0: number, y0: number, x1: number, y1: number) => {
    p.linea(x0, y0, x1, y1, P.negro);
    p.linea(x0 + 1, y0, x1 + 1, y1, P.papel);
    p.elipse(x1 + 1, y1, 1.8, 1.8, piel);
  };
  switch (accion) {
    case 'secar':
      brazo(cx - 9, 22, cx - 3, 20 - f);
      brazo(cx + 9, 22, cx + 3, 21 + f);
      p.rect(cx - 2, 17 + f, 4, 5, D.cielo);
      p.rect(cx - 2, 17 + f, 4, 1, D.blanco);
      p.rect(cx + 1, 19 - f, 3, 4, P.copas);
      break;
    case 'cana':
      brazo(cx - 9, 22, cx - 12, 26 - f);
      brazo(cx + 9, 22, cx + 5, 24);
      p.rect(cx + 5, 20, 4, 6, P.oros);
      p.rect(cx + 5, 19 + (f ? 0 : 1), 4, 2, D.blanco);
      break;
    case 'tortilla':
      brazo(cx - 9, 22, cx - 5, 21);
      brazo(cx + 9, 22, cx + 7, 21);
      p.elipse(cx + 1, 20, 7, 2, D.blanco);
      p.elipse(cx + 1, 19, 5, 2, P.oros);
      p.px(cx - 1, 18, D.oros_osc);
      p.px(cx + 3, 19, D.oros_osc);
      break;
    case 'fregar':
      brazo(cx - 9, 22, cx - 6 + f * 5, 27);
      brazo(cx + 9, 22, cx + 8, 26);
      p.rect(cx - 7 + f * 5, 26, 5, 3, P.copas);
      break;
    case 'tele':
      brazo(cx + 9, 22, cx + 14, 12 - f);
      brazo(cx - 9, 22, cx - 8, 27);
      break;
    case 'aplaudir':
      brazo(cx - 9, 22, cx - 1 - (f ? 2 : 0), 17);
      brazo(cx + 9, 22, cx + 1 + (f ? 2 : 0), 17);
      break;
    case 'quieto':
      brazo(cx - 9, 22, cx - 8, 27);
      brazo(cx + 9, 22, cx + 8, 27);
      break;
  }
  return p;
}

const cacheNicanor = new Map<string, HTMLCanvasElement>();

function imagenNicanor(accion: AccionNicanor, f: number): HTMLCanvasElement {
  const k = `${accion}${f}`;
  let c = cacheNicanor.get(k);
  if (!c) {
    c = dibujarNicanor(accion, f).aCanvas();
    cacheNicanor.set(k, c);
  }
  return c;
}

/** Nicanor trajina detrás de la barra: va cambiando de tarea cada pocos segundos. */
export class Camarero {
  accion: AccionNicanor = 'secar';
  private t = 0;
  private tAccion = 0;
  private duracion = 5000;
  private forzada: { accion: AccionNicanor; hasta: number } | null = null;
  /** Posición (cambia al ir a la cafetera o a la tele). */
  x = 206;
  private xObjetivo = 206;

  constructor(private readonly rng: () => number = Math.random) {}

  forzar(accion: AccionNicanor, ms: number): void {
    this.forzada = { accion, hasta: this.t + ms };
  }

  actualizar(dt: number): void {
    this.t += dt;
    this.tAccion += dt;
    if (this.forzada && this.t > this.forzada.hasta) this.forzada = null;
    if (!this.forzada && this.tAccion > this.duracion) {
      const opciones: AccionNicanor[] = ['secar', 'secar', 'cana', 'tortilla', 'fregar', 'tele', 'quieto'];
      this.accion = opciones[Math.floor(this.rng() * opciones.length)];
      this.tAccion = 0;
      this.duracion = 3500 + this.rng() * 5000;
      this.xObjetivo = this.accion === 'tele' ? 234 : this.accion === 'cana' ? 204 : 208 + Math.floor(this.rng() * 16);
    }
    if (Math.abs(this.x - this.xObjetivo) > 0.5) this.x += Math.sign(this.xObjetivo - this.x) * dt * 0.02;
  }

  get andando(): boolean {
    return Math.abs(this.x - this.xObjetivo) > 0.5;
  }

  dibujar(ctx: CanvasRenderingContext2D): void {
    const accion = this.forzada?.accion ?? (this.andando ? 'quieto' : this.accion);
    const f = Math.floor(this.t / (accion === 'aplaudir' ? 150 : 400)) % 2;
    const img = imagenNicanor(accion, f);
    // Detrás del mostrador: se recorta por debajo de la barra (y = 50).
    const y = 22 + (this.andando ? Math.floor(this.t / 150) % 2 : 0);
    ctx.drawImage(img, 0, 0, NW, 50 - y, Math.round(this.x - NW / 2 + 15), y, NW, 50 - y);
  }
}
