// Campeón del torneo: charanga, confeti de píxeles y «un jamón y una placa» con tu nombre.

import { envolver, texto } from '../core/bitmapFont';
import type { EventoEntrada } from '../core/input';
import type { Juego } from '../core/juego';
import type { Escena } from '../core/sceneManager';
import { PERSONAJES } from '../data/characters';
import { LINEAS_NICANOR_EVENTO } from '../data/lines.es';
import { DERIVADOS as D, PALETA as P } from '../data/palette';
import type { EstadoTorneo } from '../data/tournament';
import { Pixeles } from '../render/pixel';
import { caja } from '../render/pixel';
import { fondoBar, Camarero } from '../render/barScene';
import { GrupoBotones } from '../render/ui';
import type { Flujo } from './flujo';
import { dibujarLogo } from './logo';

function dibujarJamon(): HTMLCanvasElement {
  const p = new Pixeles(70, 34);
  // Jamón con su pata, visto de lado
  p.poligono(
    [
      [4, 16],
      [14, 5],
      [40, 3],
      [56, 10],
      [62, 16],
      [56, 24],
      [36, 30],
      [12, 28],
    ],
    P.negro,
  );
  p.poligono(
    [
      [6, 16],
      [15, 7],
      [40, 5],
      [55, 11],
      [60, 16],
      [55, 22],
      [36, 28],
      [13, 26],
    ],
    P.madera_clara,
  );
  p.elipse(22, 16, 13, 8, P.copas);
  p.elipse(22, 16, 11, 6, D.copas_brillo);
  for (let k = 0; k < 6; k++) p.px(14 + k * 3, 13 + (k % 3), P.papel);
  p.rect(60, 13, 9, 5, P.negro);
  p.rect(61, 14, 8, 3, P.madera_osc);
  p.linea(8, 12, 30, 7, P.barniz);
  return p.aCanvas();
}

interface Confeti {
  x: number;
  y: number;
  vy: number;
  vx: number;
  c: string;
}

export class Champion implements Escena {
  readonly nombre = 'Campeon';
  private t = 0;
  private readonly jamon = dibujarJamon();
  private readonly camarero = new Camarero();
  private readonly grupo = new GrupoBotones();
  private confeti: Confeti[] = [];

  constructor(
    private readonly juego: Juego,
    private readonly flujo: Flujo,
    private readonly torneo: EstadoTorneo,
  ) {
    for (let k = 0; k < 140; k++) {
      this.confeti.push({
        x: Math.random() * 320,
        y: -Math.random() * 220,
        vy: 0.02 + Math.random() * 0.05,
        vx: (Math.random() - 0.5) * 0.02,
        c: [P.copas, P.oros, P.bastos, P.espadas, P.neon, D.blanco][k % 6],
      });
    }
    this.camarero.forzar('aplaudir', 999999);
    this.grupo.poner([
      {
        id: 'menu',
        texto: 'VOLVER AL BAR',
        x: 110,
        y: 184,
        w: 100,
        h: 12,
        activo: true,
        estilo: 'verde',
        teclas: ['enter', ' ', 'escape'],
        alPulsar: () => {
          this.flujo.olvidarTorneo();
          this.flujo.menu();
        },
      },
    ]);
  }

  entrar(): void {
    this.juego.audio.ambiente(false);
    this.juego.audio.musica('charanga');
    this.juego.audio.sfx('aplauso');
  }

  actualizar(dt: number): void {
    this.t += dt;
    this.camarero.actualizar(dt);
    for (const c of this.confeti) {
      c.y += c.vy * dt;
      c.x += c.vx * dt + Math.sin((this.t + c.y * 13) / 250) * 0.25;
      if (c.y > 200) {
        c.y -= 215;
        c.x = Math.random() * 320;
      }
    }
  }

  entrada(e: EventoEntrada): void {
    this.grupo.entrada(e);
  }

  dibujar(ctx: CanvasRenderingContext2D): void {
    ctx.drawImage(fondoBar(), 0, 0);
    this.camarero.dibujar(ctx);
    dibujarLogo(ctx, 160, 6, this.t);
    // Mesa con el premio
    const jx = 40;
    const jy = 70 + Math.round(Math.sin(this.t / 300) * 1);
    ctx.drawImage(this.jamon, jx, jy);
    texto(ctx, 'Un jamón…', jx + 8, jy + 38, P.tinta, { negrita: true });
    // Placa
    const px = 150;
    const py = 60;
    caja(ctx, px, py, 140, 70, P.negro);
    caja(ctx, px + 2, py + 2, 136, 66, P.madera);
    caja(ctx, px + 8, py + 8, 124, 54, P.oros);
    caja(ctx, px + 10, py + 10, 120, 50, D.oros_brillo);
    texto(ctx, '…y una placa', px + 70, py + 74, P.tinta, { alinear: 'centro', negrita: true });
    texto(ctx, 'I CAMPEONATO', px + 70, py + 12, D.oros_osc, { alinear: 'centro' });
    texto(ctx, 'COMARCAL DE MUS', px + 70, py + 22, D.oros_osc, { alinear: 'centro' });
    const nombres = `${this.torneo.nombreJugador} y ${PERSONAJES[this.torneo.companero].corto}`;
    envolver(nombres, 19)
      .slice(0, 2)
      .forEach((l, i) => texto(ctx, l, px + 70, py + 36 + i * 10, P.tinta, { alinear: 'centro', negrita: true }));
    // Nicanor lo anuncia
    const frase = LINEAS_NICANOR_EVENTO.torneo[0];
    caja(ctx, 190, 22, 126, 22, P.negro);
    caja(ctx, 191, 23, 124, 20, P.papel);
    envolver(frase, 20).forEach((l, i) => texto(ctx, l, 194, 25 + i * 9, P.tinta));
    // La charanga (músicos en fila, tocando)
    for (let k = 0; k < 5; k++) {
      const mx = 30 + k * 56 + Math.round(Math.sin(this.t / 200 + k) * 2);
      const my = 150;
      caja(ctx, mx, my, 12, 22, P.negro);
      caja(ctx, mx + 1, my + 8, 10, 13, [P.copas, P.espadas, P.bastos, P.copas, P.oros][k]);
      caja(ctx, mx + 2, my + 1, 8, 7, P.piel_1);
      caja(ctx, mx + 1, my, 10, 2, P.papel);
      // Instrumento
      const inst = [P.oros, P.oros, D.gris_claro, P.oros, P.madera_clara][k];
      caja(ctx, mx + 10, my + 8 + (Math.floor(this.t / 150 + k) % 2), 8, 3, inst);
    }
    for (const c of this.confeti) {
      ctx.fillStyle = c.c;
      ctx.fillRect(Math.round(c.x), Math.round(c.y), 2, 2);
    }
    this.grupo.focoVisible = this.juego.entrada.modoTeclado;
    this.grupo.dibujar(ctx, this.juego.entrada.raton);
  }
}
