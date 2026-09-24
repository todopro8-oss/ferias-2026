// Cuadro del torneo: cartel de fiestas clavado en un corcho (sección 9, punto 7).

import { texto } from '../core/bitmapFont';
import type { EventoEntrada } from '../core/input';
import type { Juego } from '../core/juego';
import type { Escena } from '../core/sceneManager';
import { PERSONAJES } from '../data/characters';
import { DERIVADOS as D, PALETA as P } from '../data/palette';
import { nombreCorto, nombreRonda, type EstadoTorneo } from '../data/tournament';
import { caja } from '../render/pixel';
import { GrupoBotones, type Boton } from '../render/ui';
import type { Flujo } from './flujo';

function hash(x: number, y: number): number {
  let h = (x * 374761393 + y * 668265263) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

let corcho: HTMLCanvasElement | null = null;
function fondoCorcho(): HTMLCanvasElement {
  if (corcho) return corcho;
  const c = document.createElement('canvas');
  c.width = 320;
  c.height = 200;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = P.barniz;
  ctx.fillRect(0, 0, 320, 200);
  const tonos = [P.madera_clara, D.oros_osc, P.madera, D.oros_brillo];
  for (let y = 0; y < 200; y++)
    for (let x = 0; x < 320; x++) {
      const h = hash(x, y);
      if (h < 0.22) {
        ctx.fillStyle = tonos[Math.floor(h * 18) % tonos.length];
        ctx.fillRect(x, y, 1, 1);
      }
    }
  // Marco del corcho
  ctx.fillStyle = P.madera_osc;
  ctx.fillRect(0, 0, 320, 3);
  ctx.fillRect(0, 197, 320, 3);
  ctx.fillRect(0, 0, 3, 200);
  ctx.fillRect(317, 0, 3, 200);
  corcho = c;
  return c;
}

const COL_X = [16, 118, 212];
const FILA_Y0 = 62;
const FILA_H = 12;

export class TournamentBoard implements Escena {
  readonly nombre = 'Cuadro';
  private t = 0;
  private readonly grupo = new GrupoBotones();

  constructor(
    private readonly juego: Juego,
    flujo: Flujo,
    private readonly torneo: EstadoTorneo,
  ) {
    const b: Boton[] = [];
    const base = { y: 181, h: 12, activo: true };
    if (torneo.campeon) {
      b.push({
        ...base,
        id: 'trofeo',
        texto: 'VER EL TROFEO',
        x: 90,
        w: 100,
        estilo: 'verde',
        teclas: ['enter'],
        alPulsar: () => flujo.campeon(),
      });
    } else if (torneo.eliminado) {
      b.push({
        ...base,
        id: 'repetir',
        texto: 'REPETIR TORNEO',
        x: 90,
        w: 100,
        estilo: 'verde',
        teclas: ['enter'],
        alPulsar: () => flujo.nuevoTorneo(),
      });
    } else {
      b.push({
        ...base,
        id: 'jugar',
        texto: `JUGAR ${nombreRonda(torneo.rondaActual).toUpperCase()}`,
        x: 90,
        w: 100,
        estilo: 'verde',
        teclas: ['enter', ' '],
        alPulsar: () => flujo.jugarRondaTorneo(),
      });
    }
    b.push({ ...base, id: 'menu', texto: 'MENÚ', x: 196, w: 50, teclas: ['escape'], alPulsar: () => flujo.menu() });
    this.grupo.poner(b);
  }

  entrar(): void {
    this.juego.audio.musica('menu');
  }

  actualizar(dt: number): void {
    this.t += dt;
  }

  entrada(e: EventoEntrada): void {
    this.grupo.entrada(e);
  }

  private nombrePareja(i: number): string {
    const p = this.torneo.parejas[i];
    if (!p) return '¿?';
    if (p.humano) return `Tú y ${PERSONAJES[this.torneo.companero].corto}`;
    return nombreCorto(p.nombre);
  }

  dibujar(ctx: CanvasRenderingContext2D): void {
    ctx.drawImage(fondoCorcho(), 0, 0);
    // Cartel de fiestas
    const x = 8;
    const y = 6;
    const w = 304;
    const h = 170;
    caja(ctx, x + 3, y + 3, w, h, 'rgba(0,0,0,0.35)');
    caja(ctx, x, y, w, h, P.papel);
    // Banderitas de feria
    for (let k = 0; k < 19; k++) {
      ctx.fillStyle = [P.copas, P.oros, P.bastos, P.espadas][k % 4];
      for (let j = 0; j < 5; j++) ctx.fillRect(x + 4 + k * 16 + j, y + 2 + j, 9 - j * 2, 1);
    }
    texto(ctx, 'FIESTAS DE VILLAENVITE · AGOSTO 1996', x + w / 2, y + 10, P.copas, { alinear: 'centro' });
    texto(ctx, 'I CAMPEONATO COMARCAL DE MUS', x + w / 2, y + 22, P.tinta, { alinear: 'centro', negrita: true });
    texto(ctx, 'Organiza: Bar El Envite · Premio: jamón y placa', x + w / 2, y + 33, D.gris, { alinear: 'centro' });
    // Chinchetas
    for (const [cx, cy] of [
      [x + 3, y + 3],
      [x + w - 5, y + 3],
      [x + 3, y + h - 5],
      [x + w - 5, y + h - 5],
    ])
      caja(ctx, cx, cy, 3, 3, P.copas);

    texto(ctx, 'Cuartos', COL_X[0], FILA_Y0 - 9, P.espadas);
    texto(ctx, 'Semifinal', COL_X[1], FILA_Y0 - 9, P.espadas);
    texto(ctx, 'Final', COL_X[2], FILA_Y0 - 9, P.espadas);

    const rondaVisible = this.torneo.campeon ? 3 : this.torneo.rondaActual;
    this.torneo.rondas.forEach((ronda, r) => {
      const paso = FILA_H * Math.pow(2, r);
      ronda.forEach((partido, i) => {
        const yA = FILA_Y0 + (i * 2 + 0.5) * paso - FILA_H / 2;
        const yB = FILA_Y0 + (i * 2 + 1.5) * paso - FILA_H / 2;
        [partido.a, partido.b].forEach((idx, k) => {
          const yy = k === 0 ? yA : yB;
          if (idx < 0) {
            texto(ctx, '. . . . . .', COL_X[r], yy, D.gris_claro);
            return;
          }
          const humano = this.torneo.parejas[idx]?.humano;
          const perdio = partido.ganador !== null && partido.ganador !== idx;
          const color = humano ? P.espadas : perdio ? D.gris : P.tinta;
          texto(ctx, this.nombrePareja(idx), COL_X[r], yy, color, {
            negrita: humano && !perdio && r >= rondaVisible - 1,
          });
          if (perdio) {
            ctx.fillStyle = D.gris;
            ctx.fillRect(COL_X[r], yy + 3, Math.min(96, [...this.nombrePareja(idx)].length * 6), 1);
          }
          if (partido.marcador) {
            texto(ctx, String(partido.marcador[k]), COL_X[r] + 100, yy, perdio ? D.gris : P.copas, {
              alinear: 'derecha',
            });
          }
        });
        // Llave del cuadro
        ctx.fillStyle = D.papel_sombra;
        const xl = COL_X[r] + 101;
        ctx.fillRect(xl, yA + 4, 1, yB - yA);
        ctx.fillRect(xl, yA + 4 + (yB - yA) / 2, 4, 1);
      });
    });
    // Campeón
    const final = this.torneo.rondas[2][0];
    if (final.ganador !== null) {
      const yC = FILA_Y0 + 8 * FILA_H - 30;
      texto(ctx, '★ CAMPEONES ★', COL_X[2] + 50, yC, P.oros, { alinear: 'centro' });
      texto(ctx, this.nombrePareja(final.ganador), COL_X[2] + 50, yC + 10, P.copas, {
        alinear: 'centro',
        negrita: true,
      });
    }
    // Estado del jugador
    let estado: string;
    if (this.torneo.campeon) estado = '¡Sois los campeones de la comarca!';
    else if (this.torneo.eliminado) estado = 'Eliminados. El año que viene, más.';
    else estado = `Os toca: ${nombreRonda(this.torneo.rondaActual)}`;
    const parpadea = this.torneo.campeon && Math.floor(this.t / 400) % 2 === 0;
    texto(ctx, estado, x + w / 2, y + h - 12, parpadea ? P.oros : P.copas, { alinear: 'centro' });
    this.grupo.focoVisible = this.juego.entrada.modoTeclado;
    this.grupo.dibujar(ctx, this.juego.entrada.raton);
  }
}
