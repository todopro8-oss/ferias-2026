// Intro (unos 25 s, se salta con clic, Espacio o Esc):
//  1. Campo al atardecer, carretera y campanario: «Villaenvite, pedanía de 212 habitantes».
//  2. Una furgoneta destartalada con la pancarta del campeonato entra en la plaza (parallax).
//  3. Julián pega el bando, las vecinas se asoman, ladra el perro y dan las siete.
//  4. En el bar, Nicanor limpia la mesa y pone la baraja y el cuenco; la cámara se sienta
//     en tu silla y aparece el logo con ciclo de paleta.

import { envolver, texto } from '../core/bitmapFont';
import type { EventoEntrada } from '../core/input';
import type { Juego } from '../core/juego';
import type { Escena } from '../core/sceneManager';
import { DERIVADOS as D, PALETA as P, mezclar } from '../data/palette';
import { UI } from '../data/ui.es';
import { fondoBar, dibujarFluorescente, dibujarNeon, dibujarTele, Camarero } from '../render/barScene';
import { imagenDorso } from '../render/cardRenderer';
import { Pixeles, caja } from '../render/pixel';
import { dibujarCuenco } from '../render/stones';
import { LAYOUT } from '../render/tableLayout';
import { dibujarLogo } from './logo';

const DURACION = [6000, 6000, 6500, 7500];
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const TOTAL = DURACION.reduce((a, b) => a + b, 0);

function hash(x: number, y: number): number {
  let h = (x * 374761393 + y * 668265263) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// ---------------------------------------------------------------------------
// Decorados (se generan una vez)
// ---------------------------------------------------------------------------

function cielo(p: Pixeles, alto: number): void {
  const bandas = [
    P.violeta,
    mezclar(P.violeta, P.atardecer, 0.35),
    mezclar(P.violeta, P.atardecer, 0.7),
    P.atardecer,
    mezclar(P.atardecer, D.oros_brillo, 0.5),
  ];
  for (let y = 0; y < alto; y++) {
    const f = (y / alto) * (bandas.length - 1);
    const i = Math.floor(f);
    const r = f - i;
    for (let x = 0; x < p.ancho; x++) {
      // Tramado ordenado (Bayer 4×4) en la transición entre bandas: sin degradados suaves.
      const umbral = (BAYER[(y % 4) * 4 + (x % 4)] + 0.5) / 16;
      p.px(x, y, r > umbral && i + 1 < bandas.length ? bandas[i + 1] : bandas[i]);
    }
  }
}

function casa(p: Pixeles, x: number, y: number, w: number, h: number, tejado: string, ventanas: boolean): void {
  p.rect(x, y, w, h, P.negro);
  p.rect(x + 1, y + 1, w - 2, h - 1, P.papel);
  p.poligono(
    [
      [x - 2, y + 1],
      [x + w / 2, y - h * 0.45],
      [x + w + 2, y + 1],
    ],
    P.negro,
  );
  p.poligono(
    [
      [x - 1, y],
      [x + w / 2, y - h * 0.45 + 1],
      [x + w + 1, y],
    ],
    tejado,
  );
  if (ventanas) {
    for (let k = 0; k < Math.floor(w / 10); k++) {
      p.rect(x + 3 + k * 10, y + 4, 4, 5, D.madera_muy_osc);
      p.rect(x + 3 + k * 10, y + 4, 4, 1, P.madera);
    }
    p.rect(x + w / 2 - 2, y + h - 8, 5, 8, P.madera);
  }
}

function escenaCampo(): HTMLCanvasElement {
  const p = new Pixeles(320, 200);
  cielo(p, 120);
  // Colinas lejanas
  for (let x = 0; x < 320; x++) {
    const h1 = 100 + Math.sin(x / 40) * 6 + Math.sin(x / 13) * 2;
    for (let y = Math.floor(h1); y < 200; y++) p.px(x, y, mezclar(P.violeta, P.bastos, 0.35));
    const h2 = 118 + Math.sin(x / 55 + 1) * 5;
    for (let y = Math.floor(h2); y < 200; y++) p.px(x, y, D.bastos_osc);
  }
  // Campos con surcos
  for (let y = 128; y < 200; y++)
    for (let x = 0; x < 320; x++) {
      const surco = Math.floor((x + (y - 128) * ((x - 160) / 80)) / 6) % 2 === 0;
      p.px(x, y, surco ? P.bastos : D.bastos_osc);
      if (y > 170 && (x + y) % 7 === 0) p.px(x, y, D.oros_osc);
    }
  // Carretera serpenteando hacia el pueblo
  for (let y = 112; y < 200; y++) {
    const t = (y - 112) / 88;
    const cx = 160 + Math.sin(t * 3) * 30 * t;
    const w = 3 + t * 34;
    for (let x = Math.floor(cx - w); x < cx + w; x++) p.px(x, y, D.gris);
    if (y % 8 < 4) p.px(cx, y, P.papel);
  }
  // Pueblo en la loma, con el campanario
  const bx = 128;
  const by = 108;
  casa(p, bx, by, 16, 8, P.copas, false);
  casa(p, bx + 20, by - 2, 14, 10, D.copas_osc, false);
  casa(p, bx + 50, by, 18, 8, P.copas, false);
  // Iglesia
  p.rect(bx + 34, by - 20, 10, 28, P.negro);
  p.rect(bx + 35, by - 19, 8, 27, P.papel);
  p.poligono(
    [
      [bx + 33, by - 20],
      [bx + 39, by - 30],
      [bx + 45, by - 20],
    ],
    D.copas_osc,
  );
  p.rect(bx + 37, by - 16, 4, 5, D.madera_muy_osc);
  p.rect(bx + 38, by - 34, 1, 5, P.negro);
  p.rect(bx + 36, by - 32, 5, 1, P.negro);
  // Ventanitas encendidas
  for (const [x, y] of [
    [bx + 4, by + 3],
    [bx + 24, by + 2],
    [bx + 56, by + 3],
  ])
    p.rect(x, y, 2, 2, D.oros_brillo);
  // Letrero de la entrada del pueblo
  const lx = 206;
  const ly = 140;
  p.rect(lx + 36, ly + 22, 2, 22, D.gris);
  p.rect(lx - 2, ly - 2, 78, 26, P.negro);
  p.rect(lx - 1, ly - 1, 76, 24, P.copas);
  p.rect(lx + 1, ly + 1, 72, 20, P.papel);
  return p.aCanvas();
}

function escenaPlaza(capa: 'fondo' | 'medio'): HTMLCanvasElement {
  const ancho = capa === 'fondo' ? 480 : 640;
  const p = new Pixeles(ancho, 200);
  if (capa === 'fondo') {
    cielo(p, 110);
    // Iglesia y campanario al fondo
    const ix = 250;
    p.rect(ix, 50, 60, 70, P.negro);
    p.rect(ix + 1, 51, 58, 69, P.pared);
    p.rect(ix + 20, 20, 20, 35, P.negro);
    p.rect(ix + 21, 21, 18, 34, P.pared);
    p.poligono(
      [
        [ix + 18, 21],
        [ix + 30, 6],
        [ix + 42, 21],
      ],
      D.copas_osc,
    );
    p.rect(ix + 26, 26, 8, 10, D.madera_muy_osc);
    p.elipse(ix + 30, 32, 3, 3, P.oros);
    p.rect(ix + 25, 80, 10, 40, P.madera);
    for (let k = 0; k < 6; k++) casa(p, k * 80 + (k > 2 ? 70 : 0), 70, 60, 50, k % 2 ? P.copas : D.copas_osc, true);
    return p.aCanvas();
  }
  // Capa del medio: fachadas encaladas de la plaza y el suelo
  for (let y = 120; y < 200; y++)
    for (let x = 0; x < ancho; x++) p.px(x, y, (Math.floor(x / 12) + Math.floor(y / 6)) % 2 ? P.pared_sombra : P.pared);
  for (let k = 0; k < 8; k++) {
    const x = k * 82;
    casa(p, x, 60, 84, 62, k % 2 ? P.copas : D.copas_osc, true);
    // Macetas en los balcones
    p.rect(x + 10, 70, 12, 2, P.madera_osc);
    p.px(x + 12, 69, P.copas);
    p.px(x + 16, 69, D.copas_brillo);
    p.px(x + 19, 69, P.copas);
  }
  // Tablón de anuncios del ayuntamiento
  p.rect(260, 92, 40, 26, P.negro);
  p.rect(261, 93, 38, 24, P.madera_clara);
  p.rect(263, 95, 12, 14, P.papel);
  p.rect(277, 97, 10, 10, D.papel_sombra);
  p.rect(270, 118, 2, 10, P.madera_osc);
  p.rect(288, 118, 2, 10, P.madera_osc);
  return p.aCanvas();
}

function furgoneta(): HTMLCanvasElement {
  const p = new Pixeles(96, 44);
  // Carrocería destartalada con abolladuras
  p.rect(2, 12, 90, 24, P.negro);
  p.rect(3, 13, 88, 22, P.papel);
  p.rect(66, 4, 26, 10, P.negro);
  p.rect(67, 5, 24, 9, P.papel);
  p.rect(72, 6, 16, 6, D.cielo);
  p.rect(3, 28, 88, 3, P.espadas);
  p.px(20, 20, D.papel_sombra);
  p.px(21, 21, D.papel_sombra);
  p.rect(40, 14, 1, 20, D.papel_sombra);
  // Óxido
  for (let k = 0; k < 14; k++) p.px(4 + ((k * 13) % 80), 30 + (k % 4), P.madera_clara);
  // Ruedas
  for (const x of [18, 74]) {
    p.elipse(x, 36, 7, 7, P.negro);
    p.elipse(x, 36, 4, 4, D.gris);
    p.elipse(x, 36, 1.5, 1.5, P.negro);
  }
  // Baca con altavoz
  p.rect(30, 8, 20, 4, D.gris);
  p.poligono(
    [
      [50, 6],
      [58, 2],
      [58, 12],
      [50, 10],
    ],
    D.gris_claro,
  );
  return p.aCanvas();
}

function figuraJulian(frame: number): HTMLCanvasElement {
  const p = new Pixeles(16, 30);
  // Alguacil en miniatura: gorra de plato, uniforme azul, corneta
  p.rect(4, 12, 8, 12, P.negro);
  p.rect(5, 13, 6, 10, '#1C2A4A');
  p.px(8, 15, P.oros);
  p.px(8, 18, P.oros);
  p.elipse(8, 8, 3.5, 4, P.negro);
  p.elipse(8, 8, 2.6, 3, P.piel_2);
  p.rect(4, 3, 9, 3, '#1C2A4A');
  p.rect(5, 5, 7, 1, P.negro);
  p.px(8, 4, P.oros);
  p.rect(6, 10, 4, 1, P.tinta);
  // Piernas (andando)
  p.rect(5, 24, 2, 5 - (frame % 2), P.tinta);
  p.rect(9, 24, 2, 4 + (frame % 2), P.tinta);
  // Brazo con el bando
  if (frame >= 2) {
    p.rect(11, 12, 5, 2, '#1C2A4A');
    p.rect(12, 8, 4, 6, P.papel);
  }
  return p.aCanvas();
}

function perro(frame: number): HTMLCanvasElement {
  const p = new Pixeles(18, 12);
  p.elipse(8, 6, 6, 3, P.negro);
  p.elipse(8, 6, 5, 2.2, P.madera_clara);
  p.elipse(14, 4, 3, 2.5, P.negro);
  p.elipse(14, 4, 2.2, 1.8, P.madera_clara);
  p.px(15, 3, P.negro);
  p.px(12, 2, P.madera);
  p.linea(2, 5, 0, 2 + frame, P.madera);
  for (const x of [4, 7, 10, 12]) p.rect(x, 8, 1, 3 - ((x + frame) % 2), P.madera_osc);
  return p.aCanvas();
}

// ---------------------------------------------------------------------------

export class Intro implements Escena {
  readonly nombre = 'Intro';
  private t = 0;
  private hecho = false;
  private readonly campo = escenaCampo();
  private readonly plazaFondo = escenaPlaza('fondo');
  private readonly plazaMedio = escenaPlaza('medio');
  private readonly furgo = furgoneta();
  private readonly juliana = [0, 1, 2, 3].map((f) => figuraJulian(f));
  private readonly perros = [0, 1].map((f) => perro(f));
  private readonly camarero = new Camarero();
  private campanadas = 0;
  private ladrado = false;

  constructor(
    private readonly juego: Juego,
    private readonly alTerminar: () => void,
  ) {}

  entrar(): void {
    this.juego.audio.musica('popurri');
  }

  private terminar(): void {
    if (this.hecho) return;
    this.hecho = true;
    this.alTerminar();
  }

  entrada(e: EventoEntrada): void {
    if (e.tipo === 'clic') this.terminar();
    if (e.tipo === 'tecla' && [' ', 'escape', 'enter'].includes(e.tecla.toLowerCase())) this.terminar();
  }

  actualizar(dt: number): void {
    this.t += dt;
    this.camarero.actualizar(dt);
    const [ini, t] = this.tramo();
    // Sonidos puntuales de la escena 3
    if (ini === 2) {
      const n = Math.floor((t - 2600) / 480);
      if (t > 2600 && n < 7 && n + 1 > this.campanadas) {
        this.campanadas = n + 1;
        this.juego.audio.sfx('campana');
      }
      if (t > 1600 && !this.ladrado) {
        this.ladrado = true;
        this.juego.audio.sfx('ladrido');
      }
    }
    if (this.t > TOTAL + 1500) this.terminar();
  }

  /** [escena, tiempo dentro de la escena]. */
  private tramo(): [number, number] {
    let t = this.t;
    for (let i = 0; i < DURACION.length; i++) {
      if (t < DURACION[i]) return [i, t];
      t -= DURACION[i];
    }
    return [DURACION.length - 1, DURACION[DURACION.length - 1] + t];
  }

  dibujar(ctx: CanvasRenderingContext2D): void {
    const [e, t] = this.tramo();
    switch (e) {
      case 0:
        this.escena1(ctx, t);
        break;
      case 1:
        this.escena2(ctx, t);
        break;
      case 2:
        this.escena3(ctx, t);
        break;
      default:
        this.escena4(ctx, t);
    }
    // Transición a persiana (bandas horizontales, sin fundidos suaves)
    const d = DURACION[Math.min(e, DURACION.length - 1)];
    const borde = Math.min(t, e < 3 ? d - t : Infinity);
    if (borde < 350) {
      const k = 1 - borde / 350;
      ctx.fillStyle = P.negro;
      for (let y = 0; y < 200; y += 8) ctx.fillRect(0, y, 320, Math.ceil(8 * k));
    }
    if (e < 3 || t < 5000) {
      texto(ctx, 'Clic o Espacio para saltar', 316, 192, D.gris_claro, { alinear: 'derecha' });
    }
  }

  private subtitulo(ctx: CanvasRenderingContext2D, s: string, t: number): void {
    const visibles = Math.floor(t / 35);
    const lineas = envolver(s, 48);
    let quedan = visibles;
    caja(ctx, 8, 160, 304, 26, 'rgba(0,0,0,0.65)');
    lineas.forEach((l, i) => {
      const parte = [...l].slice(0, Math.max(0, quedan)).join('');
      quedan -= [...l].length;
      texto(ctx, parte, 14, 164 + i * 10, P.tiza);
    });
  }

  private escena1(ctx: CanvasRenderingContext2D, t: number): void {
    ctx.drawImage(this.campo, 0, 0);
    // Sol que se pone
    const sy = 104 + t / 400;
    ctx.fillStyle = D.oros_brillo;
    for (let r = 12; r >= 0; r--) {
      const w = Math.round(Math.sqrt(144 - r * r));
      ctx.fillRect(250 - w, Math.round(sy - r), w * 2, 1);
    }
    ctx.drawImage(this.campo, 0, 100, 320, 100, 0, 100, 320, 100);
    // Pájaros
    for (let k = 0; k < 4; k++) {
      const bx = ((t / 30 + k * 30) % 360) - 20;
      const by = 40 + k * 7 + Math.sin(t / 300 + k) * 3;
      const ala = Math.floor(t / 150 + k) % 2;
      ctx.fillStyle = P.tinta;
      ctx.fillRect(Math.round(bx), Math.round(by), 1, 1);
      ctx.fillRect(Math.round(bx - 2), Math.round(by - ala), 2, 1);
      ctx.fillRect(Math.round(bx + 1), Math.round(by - ala), 2, 1);
    }
    texto(ctx, 'VILLAENVITE', 243, 144, P.tinta, { alinear: 'centro' });
    texto(ctx, '212 hab.', 243, 153, D.gris, { alinear: 'centro' });
    this.subtitulo(ctx, 'Villaenvite, pedanía de 212 habitantes. Última semana de agosto.', t - 500);
  }

  private escena2(ctx: CanvasRenderingContext2D, t: number): void {
    // Parallax: el fondo se mueve más despacio que las fachadas.
    const avance = Math.min(1, t / 5000);
    const xf = -avance * 120;
    const xm = -avance * 240;
    ctx.drawImage(this.plazaFondo, Math.round(xf), 0);
    ctx.drawImage(this.plazaMedio, Math.round(xm), 0);
    // La furgoneta entra traqueteando
    const fx = -100 + Math.min(1, t / 4200) * 200;
    const bote = Math.floor(t / 120) % 2;
    ctx.drawImage(this.furgo, Math.round(fx), 130 + bote);
    // Pancarta
    caja(ctx, Math.round(fx) - 4, 118 + bote, 70, 12, P.negro);
    caja(ctx, Math.round(fx) - 3, 119 + bote, 68, 10, P.papel);
    texto(ctx, 'CAMPEONATO', Math.round(fx) + 31, 121 + bote, P.copas, { alinear: 'centro' });
    // Humo del tubo de escape
    for (let k = 0; k < 4; k++) {
      const hx = fx - 6 - k * 6 - ((t / 40) % 6);
      caja(ctx, Math.round(hx), 160 - k * 2, 3 + k, 3 + k, D.gris_claro);
    }
    if (t > 2000) {
      // El altavoz anuncia el campeonato
      caja(ctx, Math.round(fx) + 60, 104, 120, 12, P.negro);
      caja(ctx, Math.round(fx) + 61, 105, 118, 10, P.papel);
      texto(ctx, '¡Este sábado, mus!', Math.round(fx) + 64, 107, P.tinta);
    }
    this.subtitulo(ctx, `Llegan las fiestas… y con ellas, el ${UI.campeonato}.`, t - 300);
  }

  private escena3(ctx: CanvasRenderingContext2D, t: number): void {
    ctx.drawImage(this.plazaFondo, -120, 0);
    ctx.drawImage(this.plazaMedio, -240, 0);
    // Campanario: la campana se balancea al dar las siete
    const golpes = t > 2600 ? Math.min(7, Math.floor((t - 2600) / 480) + 1) : 0;
    if (golpes > 0 && golpes <= 7 && (t - 2600) % 480 < 250) {
      texto(ctx, '¡DONG!', 160, 10, P.oros, { alinear: 'centro', negrita: true });
    }
    // Julián llega y pega el bando en el tablón (el tablón queda en x 20..60 de la pantalla)
    const jx = Math.max(30, 140 - t / 22);
    const frame = jx > 30 ? Math.floor(t / 200) % 2 : 2 + (Math.floor(t / 300) % 2);
    if (t > 3200) {
      // El bando ya está pegado
      caja(ctx, 23, 95, 12, 14, P.negro);
      caja(ctx, 24, 96, 10, 12, D.oros_brillo);
      caja(ctx, 25, 98, 8, 1, P.tinta);
      caja(ctx, 25, 101, 6, 1, P.tinta);
    }
    ctx.drawImage(this.juliana[frame], Math.round(jx), 100);
    // Vecinas asomadas a las ventanas
    const asomadas = [
      [20, 64, 1200],
      [104, 64, 2000],
      [188, 64, 2800],
    ];
    for (const [vx, vy, desde] of asomadas) {
      if (t < desde) continue;
      const sube = Math.min(4, (t - desde) / 60);
      caja(ctx, vx, vy + 4 - sube, 6, 6, P.piel_1);
      caja(ctx, vx - 1, vy + 3 - sube, 8, 3, vx === 104 ? D.gris_claro : P.madera_osc);
      ctx.fillStyle = P.tinta;
      ctx.fillRect(vx + 1, vy + 6 - sube, 1, 1);
      ctx.fillRect(vx + 4, vy + 6 - sube, 1, 1);
    }
    // El perro ladra
    if (t > 1400) {
      const f = Math.floor(t / 150) % 2;
      ctx.drawImage(this.perros[f], 90, 146);
      if (t > 1600 && t < 3000) {
        caja(ctx, 94, 132, 32, 12, P.negro);
        caja(ctx, 95, 133, 30, 10, P.papel);
        texto(ctx, '¡Guau!', 98, 135, P.tinta);
      }
    }
    if (t > 3300) {
      caja(ctx, 196, 60, 110, 22, P.negro);
      caja(ctx, 197, 61, 108, 20, P.papel);
      texto(ctx, 'Se hace saber…', 200, 63, P.tinta);
      texto(ctx, '¡que empieza el mus!', 200, 72, P.copas);
    }
    this.subtitulo(ctx, 'Julián, el alguacil, cuelga el bando. Las vecinas se asoman. Dan las siete.', t - 300);
  }

  private escena4(ctx: CanvasRenderingContext2D, t: number): void {
    // La cámara «se sienta»: la escena sube a su sitio.
    const bajada = Math.max(0, 1 - t / 2500);
    const dy = Math.round(bajada * bajada * 40);
    ctx.fillStyle = P.pared_sombra;
    ctx.fillRect(0, 0, 320, 200);
    ctx.save();
    ctx.translate(0, dy);
    ctx.drawImage(fondoBar(), 0, 0);
    dibujarFluorescente(ctx, this.juego.tiempo);
    dibujarNeon(ctx, t);
    dibujarTele(ctx, this.juego.tiempo);
    this.camarero.dibujar(ctx);
    // El trapo de Nicanor limpia la mesa…
    if (t < 3000) {
      const tx = 90 + Math.sin(t / 180) * 50;
      const ty = 108 + Math.cos(t / 260) * 8;
      caja(ctx, Math.round(tx), Math.round(ty), 18, 10, P.negro);
      caja(ctx, Math.round(tx) + 1, Math.round(ty) + 1, 16, 8, P.papel);
      for (let k = 0; k < 3; k++) caja(ctx, Math.round(tx) + 1, Math.round(ty) + 2 + k * 3, 16, 1, P.copas);
      caja(ctx, Math.round(tx) + 16, Math.round(ty) - 8, 10, 12, P.piel_2);
    }
    // …y deja la baraja y el cuenco de piedras.
    if (t > 3000) {
      const dorso = imagenDorso();
      for (let k = 0; k < 5; k++) ctx.drawImage(dorso, LAYOUT.mazo.x, LAYOUT.mazo.y - k);
    }
    if (t > 3600) dibujarCuenco(ctx);
    ctx.restore();
    if (t > 4200) {
      caja(ctx, 40, 30, 240, 40, 'rgba(0,0,0,0.55)');
      dibujarLogo(ctx, 160, 38, t);
      if (Math.floor(t / 500) % 2 === 0) texto(ctx, 'Pulsa una tecla', 160, 60, P.tiza, { alinear: 'centro' });
    }
    this.subtitulo(ctx, 'En el Bar El Envite, Nicanor prepara la mesa. Siéntate.', t - 300);
    void hash;
  }
}
