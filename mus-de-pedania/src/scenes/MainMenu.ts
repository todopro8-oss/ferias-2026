// Menú principal: la pizarra del «Menú del día», escrita a tiza.

import { medir, texto } from '../core/bitmapFont';
import type { EventoEntrada } from '../core/input';
import { dentro } from '../core/input';
import type { Juego } from '../core/juego';
import type { Escena } from '../core/sceneManager';
import { DERIVADOS as D, PALETA as P, mezclar } from '../data/palette';
import { fondoBar, dibujarFluorescente, dibujarNeon, Camarero } from '../render/barScene';
import { caja } from '../render/pixel';
import type { Flujo } from './flujo';
import { dibujarLogo } from './logo';

interface Plato {
  curso: string;
  texto: string;
  accion: () => void;
}

const PIZARRA = { x: 56, y: 44, w: 208, h: 128 };

export class MainMenu implements Escena {
  readonly nombre = 'MainMenu';
  private seleccion = 0;
  private t = 0;
  private readonly platos: Plato[];
  private readonly camarero = new Camarero();
  private despedida = false;

  constructor(
    private readonly juego: Juego,
    private readonly flujo: Flujo,
  ) {
    this.platos = [
      { curso: 'Primero', texto: 'Partida', accion: () => this.flujo.partida() },
      { curso: 'Segundo', texto: 'Torneo comarcal', accion: () => this.flujo.torneoComarcal() },
      { curso: 'Postre', texto: 'Opciones', accion: () => this.flujo.opciones() },
      { curso: '', texto: 'Cómo se juega', accion: () => this.flujo.comoSeJuega() },
      { curso: 'Café', texto: 'Salir', accion: () => (this.despedida = true) },
    ];
  }

  entrar(): void {
    this.juego.audio.musica('menu');
  }

  reanudar(): void {
    this.juego.audio.musica('menu');
  }

  private rectPlato(i: number) {
    return { x: PIZARRA.x + 8, y: PIZARRA.y + 26 + i * 16, w: PIZARRA.w - 16, h: 13 };
  }

  actualizar(dt: number): void {
    this.t += dt;
    this.camarero.actualizar(dt);
  }

  entrada(e: EventoEntrada): void {
    if (this.despedida) {
      if (e.tipo === 'clic' || e.tipo === 'tecla') this.despedida = false;
      return;
    }
    if (e.tipo === 'mover') {
      this.platos.forEach((_, i) => {
        if (dentro(e.x, e.y, this.rectPlato(i))) this.seleccion = i;
      });
    } else if (e.tipo === 'clic') {
      this.platos.forEach((p, i) => {
        if (dentro(e.x, e.y, this.rectPlato(i))) {
          this.juego.audio.sfx('clic');
          p.accion();
        }
      });
    } else if (e.tipo === 'tecla') {
      const k = e.tecla.toLowerCase();
      if (k === 'arrowdown' || k === 'tab') this.seleccion = (this.seleccion + 1) % this.platos.length;
      else if (k === 'arrowup') this.seleccion = (this.seleccion + this.platos.length - 1) % this.platos.length;
      else if (k === 'enter' || k === ' ') {
        this.juego.audio.sfx('clic');
        this.platos[this.seleccion].accion();
      } else if (k >= '1' && k <= '5') this.platos[Number(k) - 1].accion();
      else if (k === 'escape') this.despedida = true;
      else return;
      this.juego.audio.sfx('hover', { volumen: 0.3 });
    }
  }

  dibujar(ctx: CanvasRenderingContext2D): void {
    ctx.drawImage(fondoBar(), 0, 0);
    dibujarFluorescente(ctx, this.juego.tiempo);
    dibujarNeon(ctx, this.juego.tiempo);
    this.camarero.dibujar(ctx);
    dibujarLogo(ctx, 160, 10, this.t);
    // Pizarra del menú del día, colgada de un clavo
    const { x, y, w, h } = PIZARRA;
    ctx.fillStyle = P.tinta;
    ctx.fillRect(x + w / 2 - 1, y - 12, 2, 2);
    ctx.fillRect(x + 30, y - 10, w / 2 - 30, 1);
    ctx.fillRect(x + w / 2, y - 10, w / 2 - 30, 1);
    caja(ctx, x - 4, y - 4, w + 8, h + 8, P.negro);
    caja(ctx, x - 3, y - 3, w + 6, h + 6, P.madera);
    caja(ctx, x - 3, y - 3, w + 6, 1, P.madera_clara);
    caja(ctx, x, y, w, h, P.pizarra);
    // Restos de tiza
    for (let k = 0; k < 60; k++) {
      ctx.fillStyle = D.pizarra_clara;
      ctx.fillRect(x + ((k * 37) % w), y + ((k * 53) % h), 2, 1);
    }
    texto(ctx, 'MENÚ DEL DÍA', x + w / 2, y + 7, P.tiza, { alinear: 'centro', negrita: true, variante: 'tiza' });
    caja(ctx, x + 40, y + 18, w - 80, 1, P.tiza_sombra);
    this.platos.forEach((p, i) => {
      const r = this.rectPlato(i);
      const sel = i === this.seleccion && !this.despedida;
      if (p.curso) texto(ctx, `${p.curso}:`, r.x, r.y + 2, sel ? P.oros : P.tiza_sombra, { variante: 'tiza' });
      texto(ctx, p.texto, r.x + 58, r.y + 2, sel ? P.oros : P.tiza, { variante: 'tiza' });
      if (sel) {
        // Subrayado a tiza, que se va dibujando
        const largo = Math.min(medir(p.texto), ((this.t % 100000) / 3) % (medir(p.texto) + 60));
        ctx.fillStyle = P.tiza;
        for (let k = 0; k < largo; k++) ctx.fillRect(r.x + 58 + k, r.y + 11 + (k % 7 === 0 ? 1 : 0), 1, 1);
        texto(ctx, '▸', r.x - 7, r.y + 2, P.oros);
      }
    });
    texto(ctx, 'Pan, vino y postre · 1.200 pts', x + w / 2, y + h - 12, P.tiza_sombra, {
      alinear: 'centro',
      variante: 'tiza',
    });
    // Taza de café en la repisa
    caja(ctx, x + w - 26, y + h + 4, 10, 7, D.blanco);
    caja(ctx, x + w - 16, y + h + 6, 3, 3, D.blanco);
    caja(ctx, x + w - 25, y + h + 5, 8, 1, P.madera_osc);
    if (Math.floor(this.t / 400) % 2 === 0) {
      ctx.fillStyle = mezclar(P.pared, D.blanco, 0.5);
      ctx.fillRect(x + w - 23, y + h - 2, 1, 4);
      ctx.fillRect(x + w - 20, y + h - 4, 1, 4);
    }
    texto(ctx, 'F: pantalla completa', 4, 190, P.tinta);
    if (this.despedida) {
      caja(ctx, 40, 80, 240, 40, P.negro);
      caja(ctx, 41, 81, 238, 38, P.papel);
      texto(ctx, '¡Hasta la próxima partida!', 160, 88, P.tinta, { alinear: 'centro' });
      texto(ctx, 'Cierra la pestaña cuando quieras.', 160, 102, D.gris, { alinear: 'centro' });
    }
  }
}
