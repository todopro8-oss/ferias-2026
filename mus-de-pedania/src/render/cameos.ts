// Cameos (sección 8): cada pocas manos entra alguien por la puerta del fondo, dice su
// línea y se va. Cartero, vecina, turista, chaval y el perro del bar.

import type { Cameo } from '../data/lines.es';
import { DERIVADOS as D, PALETA as P } from '../data/palette';
import { Pixeles } from './pixel';
import { LAYOUT } from './tableLayout';

type IdCameo = Cameo['id'];

function persona(opts: {
  alto: number;
  piel: string;
  ropa: string;
  ropaO: string;
  pelo: string;
  gorro?: string;
  extra?: (p: Pixeles, cx: number, top: number) => void;
  paso: number;
}): Pixeles {
  const w = 20;
  const h = 44;
  const p = new Pixeles(w, h);
  const cx = 10;
  const top = h - opts.alto;
  // Piernas
  const zancada = opts.paso % 2 === 0 ? 1 : -1;
  p.rect(cx - 3 + zancada, h - 9, 2, 9, P.tinta);
  p.rect(cx + 1 - zancada, h - 9, 2, 9, P.tinta);
  // Cuerpo
  p.rect(cx - 5, top + 9, 10, opts.alto - 17, P.negro);
  p.rect(cx - 4, top + 10, 8, opts.alto - 19, opts.ropa);
  p.rect(cx + 1, top + 10, 3, opts.alto - 19, opts.ropaO);
  // Brazos
  p.rect(cx - 6, top + 11, 2, 10, opts.ropaO);
  p.rect(cx + 4, top + 11, 2, 10, opts.ropaO);
  // Cabeza
  p.elipse(cx, top + 5, 4.5, 5, P.negro);
  p.elipse(cx, top + 5, 3.6, 4.2, opts.piel);
  p.elipse(cx, top + 2, 4, 2.5, opts.pelo, (_x, y) => y <= top + 3);
  p.px(cx - 1, top + 5, P.tinta);
  p.px(cx + 2, top + 5, P.tinta);
  p.px(cx, top + 8, D.copas_osc);
  if (opts.gorro) {
    p.rect(cx - 4, top, 9, 3, opts.gorro);
    p.rect(cx - 1, top + 2, 7, 1, P.negro);
  }
  opts.extra?.(p, cx, top);
  return p;
}

function perro(paso: number): Pixeles {
  const p = new Pixeles(20, 44);
  const y = 34;
  p.elipse(9, y + 3, 6, 3, P.negro);
  p.elipse(9, y + 3, 5, 2.2, P.madera_clara);
  p.elipse(15, y + 1, 3, 2.5, P.negro);
  p.elipse(15, y + 1, 2.2, 1.8, P.madera_clara);
  p.px(16, y, P.negro);
  p.px(13, y - 1, P.madera);
  p.linea(3, y + 2, 1, y - 1 + (paso % 2), P.madera);
  for (const x of [5, 8, 11, 13]) p.rect(x, y + 5, 1, 4 - ((x + paso) % 2), P.madera_osc);
  return p;
}

function sprite(id: IdCameo, paso: number): Pixeles {
  switch (id) {
    case 'cartero':
      return persona({
        alto: 40,
        piel: P.piel_1,
        ropa: '#4A5A78',
        ropaO: '#2E3A52',
        pelo: P.tinta,
        gorro: '#4A5A78',
        paso,
        extra: (p, cx, top) => {
          // La saca de cartas
          p.rect(cx + 3, top + 18, 7, 9, P.negro);
          p.rect(cx + 4, top + 19, 5, 7, P.madera_clara);
          p.linea(cx - 3, top + 10, cx + 6, top + 19, P.madera);
          p.rect(cx + 5, top + 20, 3, 2, P.papel);
        },
      });
    case 'vecina':
      return persona({
        alto: 36,
        piel: P.piel_1,
        ropa: '#8F6FB0',
        ropaO: '#6A4E88',
        pelo: D.gris_claro,
        paso,
        extra: (p, cx, top) => {
          // Bata de flores y rulos
          for (let k = 0; k < 6; k++) p.px(cx - 3 + ((k * 3) % 7), top + 13 + k * 2, D.copas_brillo);
          for (let k = 0; k < 3; k++) p.rect(cx - 3 + k * 3, top, 2, 2, P.copas);
        },
      });
    case 'turista':
      return persona({
        alto: 40,
        piel: '#F4C8B0',
        ropa: '#E08A3C',
        ropaO: '#B06A2C',
        pelo: '#D8B070',
        gorro: P.papel,
        paso,
        extra: (p, cx, top) => {
          // Mapa desplegado y cámara al cuello
          p.rect(cx - 7, top + 14, 9, 7, P.negro);
          p.rect(cx - 6, top + 15, 7, 5, D.papel_sombra);
          p.linea(cx - 5, top + 16, cx, top + 19, P.espadas);
          p.rect(cx + 1, top + 12, 3, 2, P.tinta);
          // Pantalón corto
          p.rect(cx - 4, top + 29, 8, 3, P.bastos);
        },
      });
    case 'chaval':
      return persona({
        alto: 30,
        piel: P.piel_2,
        ropa: P.copas,
        ropaO: D.copas_osc,
        pelo: P.tinta,
        gorro: P.espadas,
        paso,
        extra: (p, cx, top) => {
          // El polo de limón
          p.rect(cx + 5, top + 8, 2, 4, D.oros_brillo);
          p.rect(cx + 5, top + 12, 1, 2, P.madera_clara);
        },
      });
    case 'perro':
      return perro(paso);
  }
}

const cache = new Map<string, HTMLCanvasElement>();
function imagen(id: IdCameo, paso: number): HTMLCanvasElement {
  const k = `${id}${paso % 2}`;
  let c = cache.get(k);
  if (!c) {
    c = sprite(id, paso).aCanvas();
    cache.set(k, c);
  }
  return c;
}

export type FaseCameo = 'abre' | 'entra' | 'habla' | 'sale' | 'cierra' | 'fin';

/** Un cameo en curso: puerta que se abre, alguien que entra, habla y se va. */
export class CameoEnCurso {
  fase: FaseCameo = 'abre';
  t = 0;
  x = 0;
  /** Para el perro: cruza el bar hacia la barra. */
  readonly cruza: boolean;

  constructor(readonly id: IdCameo) {
    this.cruza = id === 'perro';
  }

  get terminado(): boolean {
    return this.fase === 'fin';
  }

  /** Avanza y devuelve true cuando toca que diga su línea. */
  actualizar(dt: number, tiempoHablando: number): boolean {
    this.t += dt;
    let empiezaAHablar = false;
    switch (this.fase) {
      case 'abre':
        if (this.t > 350) this.cambiar('entra');
        break;
      case 'entra':
        this.x = Math.min(1, this.t / 700);
        if (this.cruza) this.x = this.t / 2800;
        if (this.t > (this.cruza ? 900 : 700)) {
          this.cambiar('habla');
          empiezaAHablar = true;
        }
        break;
      case 'habla':
        if (this.cruza) this.x = (this.t + 900) / 2800;
        if (this.t > tiempoHablando) this.cambiar('sale');
        break;
      case 'sale':
        if (this.cruza) {
          this.x = (this.t + 900 + tiempoHablando) / 2800;
          if (this.x > 1.1) this.cambiar('cierra');
        } else {
          this.x = 1 - Math.min(1, this.t / 600);
          if (this.t > 600) this.cambiar('cierra');
        }
        break;
      case 'cierra':
        if (this.t > 350) this.cambiar('fin');
        break;
    }
    return empiezaAHablar;
  }

  private cambiar(f: FaseCameo): void {
    this.fase = f;
    this.t = 0;
  }

  /** Punto al que apunta su bocadillo. */
  get ancla(): { x: number; y: number } {
    const d = LAYOUT.puerta;
    if (this.cruza) return { x: d.x + 10 + this.x * 110, y: 78 };
    return { x: d.x + d.w / 2 + 4, y: d.y + 18 };
  }

  dibujar(ctx: CanvasRenderingContext2D): void {
    const d = LAYOUT.puerta;
    const abierta =
      this.fase === 'abre' ? this.t / 350 : this.fase === 'cierra' ? 1 - this.t / 350 : this.fase === 'fin' ? 0 : 1;
    if (abierta > 0) {
      // Hueco de la puerta: la calle, al fondo
      ctx.fillStyle = D.cielo;
      ctx.fillRect(d.x, d.y, d.w, 40);
      ctx.fillStyle = P.pared;
      ctx.fillRect(d.x, d.y + 20, d.w, 30);
      ctx.fillStyle = D.gris;
      ctx.fillRect(d.x, d.y + 50, d.w, d.h - 50);
      // Hoja de la puerta, girada hacia dentro (se estrecha)
      const ancho = Math.max(3, Math.round(d.w * (1 - abierta * 0.85)));
      ctx.fillStyle = P.negro;
      ctx.fillRect(d.x, d.y, ancho + 1, d.h);
      ctx.fillStyle = P.madera;
      ctx.fillRect(d.x, d.y, ancho, d.h);
      ctx.fillStyle = P.madera_clara;
      ctx.fillRect(d.x + 1, d.y + 3, Math.max(1, ancho - 2), 24);
    }
    if (this.fase === 'abre' || this.fase === 'cierra' || this.fase === 'fin') return;
    const paso = Math.floor(this.t / 160);
    const img = imagen(this.id, this.fase === 'habla' && !this.cruza ? 0 : paso);
    if (this.cruza) {
      const x = d.x + 4 + this.x * 110;
      ctx.drawImage(img, Math.round(x), 44);
      return;
    }
    // Entra desde el fondo de la calle: baja un poco al cruzar el umbral.
    const x = d.x + d.w / 2 - img.width / 2 + Math.round(this.x * 4);
    const y = d.y + d.h - img.height - 2 - Math.round((1 - this.x) * 6);
    ctx.drawImage(img, Math.round(x), Math.round(y));
  }
}
