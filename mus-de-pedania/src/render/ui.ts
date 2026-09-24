// Botones y paneles de la interfaz, con ratón y teclado (foco visible).

import { medir, texto } from '../core/bitmapFont';
import type { EventoEntrada } from '../core/input';
import { dentro } from '../core/input';
import { DERIVADOS as D, PALETA as P } from '../data/palette';
import { caja, marco } from './pixel';

export type EstiloBoton = 'papel' | 'tiza' | 'ordago' | 'verde';

export interface Boton {
  id: string;
  texto: string;
  x: number;
  y: number;
  w: number;
  h: number;
  activo: boolean;
  /** Teclas que lo pulsan (e.key, en minúsculas). */
  teclas?: string[];
  estilo?: EstiloBoton;
  alPulsar: () => void;
  /** Texto de ayuda contextual. */
  ayuda?: string;
}

export function dibujarBoton(ctx: CanvasRenderingContext2D, b: Boton, hover: boolean, foco: boolean): void {
  const estilo = b.estilo ?? 'papel';
  let fondo: string;
  let tinta: string;
  let borde: string = P.negro;
  if (estilo === 'tiza') {
    fondo = hover && b.activo ? D.pizarra_clara : P.pizarra;
    tinta = b.activo ? P.tiza : P.tiza_sombra;
    borde = b.activo ? P.tiza_sombra : D.pizarra_clara;
  } else if (estilo === 'ordago') {
    fondo = !b.activo ? D.copas_osc : hover ? D.copas_brillo : P.copas;
    tinta = b.activo ? P.papel : D.copas_brillo;
  } else if (estilo === 'verde') {
    fondo = !b.activo ? D.bastos_osc : hover ? D.bastos_brillo : P.bastos;
    tinta = b.activo ? P.papel : P.bastos;
  } else {
    fondo = !b.activo ? D.papel_sombra : hover ? P.barniz : D.crema_boton;
    tinta = b.activo ? P.tinta : D.gris;
  }
  caja(ctx, b.x + 1, b.y, b.w - 2, b.h, borde);
  caja(ctx, b.x, b.y + 1, b.w, b.h - 2, borde);
  caja(ctx, b.x + 1, b.y + 1, b.w - 2, b.h - 2, fondo);
  if (b.activo && estilo !== 'tiza') {
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(b.x + 1, b.y + 1, b.w - 2, 1);
  }
  const ty = b.y + Math.floor((b.h - 7) / 2);
  texto(ctx, b.texto, b.x + b.w / 2, ty, tinta, { alinear: 'centro' });
  if (foco) {
    marco(ctx, b.x - 1, b.y - 1, b.w + 2, b.h + 2, P.oros);
  }
}

/** Grupo de botones con foco de teclado (Tab / flechas / Intro) y atajos. */
export class GrupoBotones {
  botones: Boton[] = [];
  foco = 0;
  /** Mostrar el foco (se enciende al usar el teclado). */
  focoVisible = false;

  poner(botones: Boton[]): void {
    const idAnterior = this.botones[this.foco]?.id;
    this.botones = botones;
    const i = botones.findIndex((b) => b.id === idAnterior && b.activo);
    this.foco =
      i >= 0
        ? i
        : Math.max(
            0,
            botones.findIndex((b) => b.activo),
          );
  }

  vaciar(): void {
    this.botones = [];
  }

  private moverFoco(dir: number): void {
    const n = this.botones.length;
    if (n === 0) return;
    for (let k = 1; k <= n; k++) {
      const i = (this.foco + dir * k + n * 4) % n;
      if (this.botones[i].activo) {
        this.foco = i;
        return;
      }
    }
  }

  /** Devuelve true si el evento lo ha consumido el grupo. */
  entrada(e: EventoEntrada, flechasVerticales = true): boolean {
    if (e.tipo === 'clic') {
      for (const b of this.botones) {
        if (b.activo && dentro(e.x, e.y, b)) {
          this.focoVisible = false;
          b.alPulsar();
          return true;
        }
      }
      return false;
    }
    if (e.tipo !== 'tecla') return false;
    const k = e.tecla.toLowerCase();
    for (const b of this.botones) {
      if (b.activo && b.teclas?.includes(k)) {
        b.alPulsar();
        return true;
      }
    }
    if (k === 'tab') {
      this.focoVisible = true;
      this.moverFoco(e.mayus ? -1 : 1);
      return true;
    }
    if (flechasVerticales && (k === 'arrowdown' || k === 'arrowup')) {
      this.focoVisible = true;
      this.moverFoco(k === 'arrowdown' ? 1 : -1);
      return true;
    }
    if (k === 'enter') {
      const b = this.botones[this.foco];
      if (b?.activo) {
        b.alPulsar();
        return true;
      }
    }
    return false;
  }

  dibujar(ctx: CanvasRenderingContext2D, raton: { x: number; y: number; dentro: boolean }): void {
    this.botones.forEach((b, i) => {
      const hover = raton.dentro && dentro(raton.x, raton.y, b);
      dibujarBoton(ctx, b, hover, this.focoVisible && i === this.foco);
    });
  }

  bajoRaton(raton: { x: number; y: number }): Boton | undefined {
    return this.botones.find((b) => dentro(raton.x, raton.y, b));
  }
}

/** Panel con marco de madera y fondo de pizarra. */
export function panelPizarra(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  caja(ctx, x - 2, y - 2, w + 4, h + 4, P.negro);
  caja(ctx, x - 1, y - 1, w + 2, h + 2, P.madera);
  caja(ctx, x, y, w, h, P.pizarra);
}

/** Hoja de libreta (opciones, historial, recuento). */
export function hojaLibreta(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  caja(ctx, x + 2, y + 2, w, h, 'rgba(0,0,0,0.45)');
  caja(ctx, x, y, w, h, P.negro);
  caja(ctx, x + 1, y + 1, w - 2, h - 2, P.papel);
  ctx.fillStyle = D.espadas_brillo;
  for (let ly = y + 12; ly < y + h - 2; ly += 10) ctx.fillRect(x + 1, ly, w - 2, 1);
  ctx.fillStyle = D.copas_brillo;
  ctx.fillRect(x + 10, y + 1, 1, h - 2);
  // Agujeros de la espiral
  ctx.fillStyle = P.negro;
  for (let ay = y + 6; ay < y + h - 4; ay += 12) ctx.fillRect(x + 3, ay, 3, 3);
}

export function textoCentrado(ctx: CanvasRenderingContext2D, s: string, y: number, color: string): void {
  texto(ctx, s, 160 - medir(s) / 2, y, color);
}
