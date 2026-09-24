// Fin de partida: viñeta con las reacciones de los cuatro, el bar aplaude o calla,
// y estadísticas (manos, órdagos lanzados y aceptados, señas hechas y cazadas).

import { hojaPersonaje } from '../core/assets';
import { envolver, texto } from '../core/bitmapFont';
import type { EventoEntrada } from '../core/input';
import type { Juego } from '../core/juego';
import type { Escena } from '../core/sceneManager';
import { PERSONAJES, type IdPersonaje } from '../data/characters';
import { LINEAS, LINEAS_NICANOR_EVENTO } from '../data/lines.es';
import { DERIVADOS as D, PALETA as P } from '../data/palette';
import type { EstadoTorneo } from '../data/tournament';
import { fondoBar, Camarero } from '../render/barScene';
import { BustoAnimado } from '../render/characterRenderer';
import { caja } from '../render/pixel';
import { dibujarPiedra } from '../render/stones';
import { GrupoBotones, type Boton } from '../render/ui';
import type { ContextoPartida, Flujo } from './flujo';
import type { ResultadoPartida } from './Table';

export interface DatosFin {
  resultado: ResultadoPartida;
  contexto: ContextoPartida;
  bustos: { ids: Record<1 | 2 | 3, IdPersonaje> };
  torneo: EstadoTorneo | null;
}

interface Confeti {
  x: number;
  y: number;
  vy: number;
  c: string;
}

export class MatchEnd implements Escena {
  readonly nombre = 'FinPartida';
  private t = 0;
  private readonly grupo = new GrupoBotones();
  private readonly bustos: Record<1 | 2 | 3, BustoAnimado>;
  private readonly frases: { s: 1 | 2 | 3; texto: string }[] = [];
  private readonly camarero = new Camarero();
  private readonly ganamos: boolean;
  private confeti: Confeti[] = [];
  private fraseNicanor: string | null = null;

  constructor(
    private readonly juego: Juego,
    flujo: Flujo,
    private readonly datos: DatosFin,
  ) {
    const ids = datos.bustos.ids;
    this.ganamos = datos.resultado.ganador === 0;
    this.bustos = {
      3: new BustoAnimado(hojaPersonaje(ids[3], 'frontal')),
      2: new BustoAnimado(hojaPersonaje(ids[2], 'frontal')),
      1: new BustoAnimado(hojaPersonaje(ids[1], 'frontal')),
    };
    for (const s of [1, 2, 3] as const) {
      const nuestro = s === 2;
      const contento = nuestro === this.ganamos;
      this.bustos[s].mostrar(contento ? 'contento' : 'cabreado', 999999);
    }
    // Una frase del compañero y otra de un rival.
    const pick = (l: string[]) => l[Math.floor(Math.random() * l.length)];
    this.frases.push({ s: 2, texto: pick(LINEAS[ids[2]][this.ganamos ? 'victoria' : 'derrota']) });
    const rival = Math.random() < 0.5 ? 1 : 3;
    this.frases.push({ s: rival, texto: pick(LINEAS[ids[rival]][this.ganamos ? 'derrota' : 'victoria']) });
    if (this.ganamos) {
      // Huevo de pascua: el bar aplaude y Nicanor invita a una ronda.
      this.camarero.forzar('aplaudir', 4000);
      this.fraseNicanor = pick(LINEAS_NICANOR_EVENTO.victoria);
      for (let k = 0; k < 60; k++) {
        this.confeti.push({
          x: Math.random() * 320,
          y: -Math.random() * 200,
          vy: 0.02 + Math.random() * 0.04,
          c: [P.copas, P.oros, P.bastos, P.espadas, P.neon][k % 5],
        });
      }
    }

    const b: Boton[] = [];
    const base = { y: 182, h: 12, activo: true };
    const t = datos.torneo;
    if (datos.contexto.modo === 'torneo' && t) {
      if (t.campeon) {
        b.push({
          ...base,
          id: 'trofeo',
          texto: '¡AL TROFEO!',
          x: 100,
          w: 120,
          estilo: 'verde',
          teclas: ['enter', ' '],
          alPulsar: () => flujo.campeon(),
        });
      } else {
        b.push({
          ...base,
          id: 'cuadro',
          texto: 'VER EL CUADRO',
          x: 100,
          w: 120,
          estilo: 'verde',
          teclas: ['enter', ' '],
          alPulsar: () => flujo.cuadro(),
        });
      }
    } else {
      b.push({
        ...base,
        id: 'otra',
        texto: 'OTRA PARTIDA',
        x: 70,
        w: 90,
        estilo: 'verde',
        teclas: ['enter', ' '],
        alPulsar: () => flujo.repetirPartida(),
      });
      b.push({ ...base, id: 'menu', texto: 'MENÚ', x: 166, w: 80, teclas: ['escape'], alPulsar: () => flujo.menu() });
    }
    this.grupo.poner(b);
  }

  entrar(): void {
    this.juego.audio.ambiente(false);
    this.juego.audio.musica(this.ganamos ? 'victoria' : 'derrota');
    this.juego.audio.sfx(this.ganamos ? 'aplauso' : 'grillos');
    for (const f of this.frases)
      this.juego.audio.voz(this.datos.bustos.ids[f.s], this.ganamos === (f.s === 2) ? 'victoria' : 'derrota', f.texto);
  }

  actualizar(dt: number): void {
    this.t += dt;
    this.camarero.actualizar(dt);
    for (const s of [1, 2, 3] as const) this.bustos[s].actualizar(dt);
    for (const c of this.confeti) {
      c.y += c.vy * dt;
      c.x += Math.sin((this.t + c.y * 20) / 300) * 0.3;
      if (c.y > 200) c.y -= 210;
    }
  }

  entrada(e: EventoEntrada): void {
    this.grupo.entrada(e);
  }

  dibujar(ctx: CanvasRenderingContext2D): void {
    ctx.drawImage(fondoBar(), 0, 0);
    this.camarero.dibujar(ctx);
    // Viñeta de cómic con los tres de la mesa
    caja(ctx, 6, 6, 308, 104, P.negro);
    caja(ctx, 8, 8, 304, 100, this.ganamos ? D.oros_brillo : D.gris_claro);
    const xs: Record<1 | 2 | 3, number> = { 3: 20, 2: 128, 1: 236 };
    for (const s of [3, 2, 1] as const) this.bustos[s].dibujar(ctx, xs[s], 34);
    // Título
    const titulo = this.ganamos ? '¡PARTIDA GANADA!' : 'PARTIDA PERDIDA';
    caja(ctx, 80, 10, 160, 18, P.negro);
    caja(ctx, 81, 11, 158, 16, this.ganamos ? P.copas : D.tele_osc);
    texto(ctx, titulo, 160, 15, this.ganamos ? P.oros : P.tiza, { alinear: 'centro', negrita: true });
    // Frases (bocadillos de cómic)
    this.frases.forEach((f, i) => {
      const lineas = envolver(f.texto, 24).slice(0, 2);
      const by = 112;
      const w = 150;
      const h = (lineas.length + 1) * 10 + 6;
      const x = i === 0 ? 6 : 164;
      caja(ctx, x, by, w, h, P.negro);
      caja(ctx, x + 1, by + 1, w - 2, h - 2, P.papel);
      texto(ctx, `${PERSONAJES[this.datos.bustos.ids[f.s]].corto}:`, x + 4, by + 3, P.copas);
      lineas.forEach((l, j) => texto(ctx, l, x + 4, by + 3 + (j + 1) * 10, P.tinta));
    });
    // Estadísticas
    const e = this.datos.resultado.estadisticas;
    const st = [
      `Manos: ${e.manos}`,
      `Órdagos: ${e.ordagosLanzados} (aceptados ${e.ordagosAceptados})`,
      `Señas hechas: ${e.senasHechas} · cazadas: ${e.senasCazadas}`,
    ];
    caja(ctx, 6, 150, 308, 30, P.pizarra);
    st.forEach((l, i) => texto(ctx, l, 12, 152 + i * 9, P.tiza, { variante: 'tiza' }));
    // Piedras del montón ganador, de adorno
    for (let k = 0; k < 8; k++) dibujarPiedra(ctx, 280 + (k % 4) * 5, 160 + Math.floor(k / 4) * 4, k);
    if (this.fraseNicanor && this.t < 5000) {
      caja(ctx, 180, 90, 132, 20, P.negro);
      caja(ctx, 181, 91, 130, 18, P.papel);
      envolver(`Nicanor: ${this.fraseNicanor}`, 21)
        .slice(0, 2)
        .forEach((l, i) => texto(ctx, l, 184, 93 + i * 8, P.tinta));
    }
    for (const c of this.confeti) {
      ctx.fillStyle = c.c;
      ctx.fillRect(Math.round(c.x), Math.round(c.y), 2, 1);
    }
    this.grupo.focoVisible = this.juego.entrada.modoTeclado;
    this.grupo.dibujar(ctx, this.juego.entrada.raton);
  }
}
