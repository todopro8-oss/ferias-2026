// «¿Cómo te llamas?»: para la placa del campeón.

import { texto } from '../core/bitmapFont';
import type { EventoEntrada } from '../core/input';
import type { Juego } from '../core/juego';
import type { Escena } from '../core/sceneManager';
import { DERIVADOS as D, PALETA as P } from '../data/palette';
import { fondoBar } from '../render/barScene';
import { GrupoBotones, hojaLibreta } from '../render/ui';

const MAX = 10;

export class NameEntry implements Escena {
  readonly nombre = 'Nombre';
  private valor: string;
  private t = 0;
  private readonly grupo = new GrupoBotones();

  constructor(
    private readonly juego: Juego,
    private readonly op: { inicial: string; alAceptar: (nombre: string) => void; alVolver: () => void },
  ) {
    this.valor = op.inicial;
    this.grupo.poner([
      { id: 'ok', texto: 'APUNTARSE', x: 112, y: 128, w: 96, h: 13, activo: true, alPulsar: () => this.aceptar() },
      { id: 'volver', texto: 'VOLVER', x: 112, y: 146, w: 96, h: 13, activo: true, alPulsar: () => this.op.alVolver() },
    ]);
  }

  private aceptar(): void {
    const n = this.valor.trim() || 'Forastero';
    this.op.alAceptar(n);
  }

  actualizar(dt: number): void {
    this.t += dt;
  }

  entrada(e: EventoEntrada): void {
    if (e.tipo === 'clic') {
      this.grupo.entrada(e);
      return;
    }
    if (e.tipo !== 'tecla') return;
    if (e.tecla === 'Enter') return this.aceptar();
    if (e.tecla === 'Escape') return this.op.alVolver();
    if (e.tecla === 'Backspace') {
      this.valor = [...this.valor].slice(0, -1).join('');
      return;
    }
    if ([...e.tecla].length === 1 && /[\p{L}\d .'-]/u.test(e.tecla) && [...this.valor].length < MAX) {
      this.valor += e.tecla;
      this.juego.audio.sfx('clic', { volumen: 0.3 });
    }
  }

  dibujar(ctx: CanvasRenderingContext2D): void {
    ctx.drawImage(fondoBar(), 0, 0);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(0, 0, 320, 200);
    hojaLibreta(ctx, 70, 40, 180, 130);
    texto(ctx, 'HOJA DE INSCRIPCIÓN', 160, 46, P.copas, { alinear: 'centro' });
    texto(ctx, 'I Campeonato Comarcal', 160, 60, P.tinta, { alinear: 'centro' });
    texto(ctx, '¿Cómo te llamas?', 84, 82, P.tinta);
    const cursor = Math.floor(this.t / 400) % 2 === 0 ? '_' : ' ';
    texto(ctx, `${this.valor}${cursor}`, 90, 100, P.espadas, { negrita: true });
    ctx.fillStyle = D.gris;
    ctx.fillRect(88, 110, 120, 1);
    this.grupo.focoVisible = this.juego.entrada.modoTeclado;
    this.grupo.dibujar(ctx, this.juego.entrada.raton);
  }
}
