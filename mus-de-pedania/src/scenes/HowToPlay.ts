// «Cómo se juega»: reglas por páginas con manos de ejemplo, y la mano guiada.

import { texto } from '../core/bitmapFont';
import type { EventoEntrada } from '../core/input';
import type { Juego } from '../core/juego';
import type { Escena } from '../core/sceneManager';
import { DERIVADOS as D, PALETA as P } from '../data/palette';
import { PAGINAS_REGLAS } from '../data/reglas.es';
import { deCorta } from '../mus/cards';
import { fondoBar } from '../render/barScene';
import { imagenMini } from '../render/cardRenderer';
import { GrupoBotones, hojaLibreta, type Boton } from '../render/ui';
import type { Flujo } from './flujo';

export class HowToPlay implements Escena {
  readonly nombre = 'ComoSeJuega';
  private pagina = 0;
  private readonly grupo = new GrupoBotones();

  constructor(
    private readonly juego: Juego,
    private readonly flujo: Flujo,
  ) {
    this.botones();
  }

  private botones(): void {
    const n = PAGINAS_REGLAS.length;
    const b: Boton[] = [
      {
        id: 'ant',
        texto: '◂ ANTERIOR',
        x: 20,
        y: 184,
        w: 70,
        h: 12,
        activo: this.pagina > 0,
        teclas: ['arrowleft'],
        alPulsar: () => this.ir(-1),
      },
      {
        id: 'sig',
        texto: 'SIGUIENTE ▸',
        x: 94,
        y: 184,
        w: 70,
        h: 12,
        activo: this.pagina < n - 1,
        teclas: ['arrowright', ' '],
        alPulsar: () => this.ir(1),
      },
      {
        id: 'guiada',
        texto: 'MANO GUIADA',
        x: 168,
        y: 184,
        w: 76,
        h: 12,
        activo: true,
        estilo: 'verde',
        teclas: ['g'],
        alPulsar: () => this.flujo.tutorial(),
      },
      {
        id: 'menu',
        texto: 'MENÚ',
        x: 248,
        y: 184,
        w: 52,
        h: 12,
        activo: true,
        teclas: ['escape'],
        alPulsar: () => this.flujo.menu(),
      },
    ];
    this.grupo.poner(b);
  }

  private ir(d: number): void {
    this.pagina = Math.max(0, Math.min(PAGINAS_REGLAS.length - 1, this.pagina + d));
    this.juego.audio.sfx('carta', { volumen: 0.4 });
    this.botones();
  }

  actualizar(): void {}

  entrada(e: EventoEntrada): void {
    this.grupo.entrada(e);
  }

  dibujar(ctx: CanvasRenderingContext2D): void {
    ctx.drawImage(fondoBar(), 0, 0);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 0, 320, 200);
    const x = 16;
    const y = 6;
    const w = 288;
    const h = 172;
    hojaLibreta(ctx, x, y, w, h);
    const p = PAGINAS_REGLAS[this.pagina];
    texto(ctx, p.titulo.toUpperCase(), x + w / 2, y + 3, P.copas, { alinear: 'centro', negrita: true });
    p.lineas.forEach((l, i) => texto(ctx, l, x + 16, y + 16 + i * 10, P.tinta));
    if (p.ejemplos) {
      let ex = x + 18;
      const ey = y + 20 + p.lineas.length * 10 + 4;
      for (const e of p.ejemplos) {
        const cartas = e.cartas.split(' ').map(deCorta);
        cartas.forEach((c, i) => ctx.drawImage(imagenMini(c), ex + i * 14, ey));
        texto(ctx, e.rotulo, ex, ey + 40, P.espadas);
        ex += cartas.length * 14 + 10 + 24;
      }
    }
    texto(ctx, `${this.pagina + 1}/${PAGINAS_REGLAS.length}`, x + w - 6, y + h - 12, D.gris, { alinear: 'derecha' });
    this.grupo.focoVisible = this.juego.entrada.modoTeclado;
    this.grupo.dibujar(ctx, this.juego.entrada.raton);
  }
}
