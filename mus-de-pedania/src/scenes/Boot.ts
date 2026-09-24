// Arranque retro (desactivable): consola de MS-DOS inventada, 2-3 s, se salta con cualquier tecla.

import { texto } from '../core/bitmapFont';
import type { EventoEntrada } from '../core/input';
import type { Juego } from '../core/juego';
import type { Escena } from '../core/sceneManager';
import { DERIVADOS as D } from '../data/palette';

const LINEAS: [number, string][] = [
  [0, 'C:\\>CD MUS'],
  [250, 'C:\\MUS>MUSPED.EXE'],
  [600, ''],
  [650, 'MUS DE PEDANIA  v1.0  (c) Villaenvite Soft 1996'],
  [900, 'Comprobando memoria... 640K OK'],
  [1300, 'Memoria extendida... 4096K OK'],
  [1650, 'Sintetizador FM detectado en 388h'],
  [2000, 'Cargando baraja española... 40 cartas'],
  [2350, 'Barriendo el bar... hecho'],
];

export class Boot implements Escena {
  readonly nombre = 'Boot';
  private t = 0;
  private hecho = false;

  constructor(
    private readonly juego: Juego,
    private readonly alTerminar: () => void,
  ) {}

  actualizar(dt: number): void {
    this.t += dt;
    if (this.t > 3000) this.terminar();
  }

  private terminar(): void {
    if (this.hecho) return;
    this.hecho = true;
    this.alTerminar();
  }

  entrada(e: EventoEntrada): void {
    if (e.tipo === 'tecla' || e.tipo === 'clic') this.terminar();
  }

  dibujar(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 320, 200);
    const gris = D.gris_claro;
    let y = 6;
    for (const [en, linea] of LINEAS) {
      if (this.t < en) break;
      // Efecto de tecleo en las líneas de comando
      const visible = linea.startsWith('C:') ? linea.slice(0, Math.floor((this.t - en) / 25)) : linea;
      texto(ctx, visible, 4, y, gris);
      y += 10;
    }
    if (Math.floor(this.t / 300) % 2 === 0) {
      ctx.fillStyle = gris;
      ctx.fillRect(4, y + 5, 5, 2);
    }
    void this.juego;
  }
}
