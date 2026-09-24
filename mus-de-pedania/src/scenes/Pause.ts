// Pausa (Esc): Continuar, Opciones, Historial de la mano, Abandonar.

import { texto } from '../core/bitmapFont';
import type { EventoEntrada } from '../core/input';
import type { Juego } from '../core/juego';
import type { Escena } from '../core/sceneManager';
import { PALETA as P } from '../data/palette';
import { GrupoBotones, panelPizarra } from '../render/ui';
import type { Mesa } from './Table';

export class Pause implements Escena {
  readonly nombre = 'Pausa';
  readonly transparente = true;
  private readonly grupo = new GrupoBotones();
  private confirmar = false;

  constructor(
    private readonly juego: Juego,
    private readonly op: { mesa: Mesa; alOpciones: () => void; alAbandonar: () => void },
  ) {
    this.construir();
  }

  private construir(): void {
    const x = 110;
    const w = 100;
    const b = (id: string, t: string, fila: number, accion: () => void, teclas: string[] = []) => ({
      id,
      texto: t,
      x,
      y: 70 + fila * 15,
      w,
      h: 12,
      activo: true,
      teclas,
      alPulsar: accion,
      estilo: 'tiza' as const,
    });
    if (this.confirmar) {
      this.grupo.poner([
        b('si', 'Sí, me voy', 1, () => this.op.alAbandonar(), ['s']),
        b(
          'no',
          'No, sigo',
          2,
          () => {
            this.confirmar = false;
            this.construir();
          },
          ['n', 'escape'],
        ),
      ]);
      return;
    }
    this.grupo.poner([
      b('continuar', 'Continuar', 0, () => this.juego.escenas.quitar(this), ['escape', 'c']),
      b('opciones', 'Opciones', 1, () => this.op.alOpciones(), ['o']),
      b(
        'historial',
        'Historial',
        2,
        () => {
          this.op.mesa.verHistorial = true;
          this.juego.escenas.quitar(this);
        },
        ['l'],
      ),
      b(
        'abandonar',
        'Abandonar',
        3,
        () => {
          this.confirmar = true;
          this.construir();
        },
        ['a'],
      ),
    ]);
  }

  actualizar(): void {}

  entrada(e: EventoEntrada): void {
    this.grupo.entrada(e);
  }

  dibujar(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, 320, 200);
    panelPizarra(ctx, 100, 48, 120, 90);
    texto(ctx, this.confirmar ? '¿ABANDONAR?' : 'PAUSA', 160, 54, P.oros, {
      alinear: 'centro',
      negrita: true,
      variante: 'tiza',
    });
    if (this.confirmar) texto(ctx, 'Se perderá la partida', 160, 70, P.tiza, { alinear: 'centro' });
    this.grupo.focoVisible = this.juego.entrada.modoTeclado;
    this.grupo.dibujar(ctx, this.juego.entrada.raton);
  }
}
