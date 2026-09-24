// Selección de personajes (sección 9, punto 6): pared del bar con 7 fotos enmarcadas.
// Paso 1: elige compañero. Paso 2 (Partida): elige dos rivales o «que decida la suerte».

import { hojaPersonaje } from '../core/assets';
import { envolver, texto } from '../core/bitmapFont';
import type { EventoEntrada } from '../core/input';
import { dentro } from '../core/input';
import type { Juego } from '../core/juego';
import type { Escena } from '../core/sceneManager';
import { IDS_PERSONAJES, PERSONAJES, type IdPersonaje } from '../data/characters';
import { LINEAS } from '../data/lines.es';
import { DERIVADOS as D, PALETA as P } from '../data/palette';
import { fondoBar } from '../render/barScene';
import { BustoAnimado } from '../render/characterRenderer';
import { caja, marco } from '../render/pixel';
import { GrupoBotones, panelPizarra } from '../render/ui';

export interface OpcionesSeleccion {
  modo: 'partida' | 'torneo';
  alElegir: (companero: IdPersonaje, rivales?: [IdPersonaje, IdPersonaje]) => void;
  alVolver: () => void;
}

const FOTO_W = 40;
const FOTO_H = 46;
const FOTO_Y = 20;

export class CharacterSelect implements Escena {
  readonly nombre = 'Seleccion';
  private paso: 1 | 2 = 1;
  private foco = 0;
  private companero: IdPersonaje | null = null;
  private rivales: IdPersonaje[] = [];
  private readonly bustos = new Map<IdPersonaje, BustoAnimado>();
  private readonly fotos = new Map<IdPersonaje, HTMLCanvasElement>();
  private presentacion = new Map<IdPersonaje, string>();
  private tFoco = 0;
  private presentado: IdPersonaje | null = null;
  private readonly grupo = new GrupoBotones();

  constructor(
    private readonly juego: Juego,
    private readonly op: OpcionesSeleccion,
  ) {
    for (const id of IDS_PERSONAJES) {
      const hoja = hojaPersonaje(id, 'frontal');
      this.bustos.set(id, new BustoAnimado(hoja));
      this.fotos.set(id, hoja.frames.get('idle0')!);
      const lineas = LINEAS[id].presentacion;
      this.presentacion.set(id, lineas[Math.floor(Math.random() * lineas.length)]);
    }
    this.botones();
  }

  entrar(): void {
    this.juego.audio.musica('menu');
  }

  private botones(): void {
    const b = [
      {
        id: 'volver',
        texto: 'VOLVER',
        x: 246,
        y: 184,
        w: 66,
        h: 12,
        activo: true,
        teclas: ['escape'],
        alPulsar: () => this.volver(),
      },
    ];
    if (this.paso === 2) {
      b.push({
        id: 'suerte',
        texto: 'SUERTE',
        x: 176,
        y: 184,
        w: 66,
        h: 12,
        activo: true,
        teclas: ['s'],
        alPulsar: () => this.suerte(),
      });
    }
    this.grupo.poner(b);
  }

  private volver(): void {
    if (this.paso === 2) {
      this.paso = 1;
      this.companero = null;
      this.rivales = [];
      this.botones();
    } else this.op.alVolver();
  }

  private suerte(): void {
    const libres = IDS_PERSONAJES.filter((id) => id !== this.companero);
    const a = libres.splice(Math.floor(Math.random() * libres.length), 1)[0];
    const b = libres[Math.floor(Math.random() * libres.length)];
    this.op.alElegir(this.companero!, [a, b]);
  }

  private rectFoto(i: number) {
    return { x: 6 + i * 44 + 2, y: FOTO_Y, w: FOTO_W, h: FOTO_H };
  }

  private elegir(i: number): void {
    const id = IDS_PERSONAJES[i];
    this.juego.audio.sfx('clic');
    if (this.paso === 1) {
      this.companero = id;
      if (this.op.modo === 'torneo') {
        this.op.alElegir(id);
        return;
      }
      this.paso = 2;
      this.botones();
      return;
    }
    if (id === this.companero) return;
    if (this.rivales.includes(id)) this.rivales = this.rivales.filter((r) => r !== id);
    else this.rivales.push(id);
    if (this.rivales.length === 2) this.op.alElegir(this.companero!, [this.rivales[0], this.rivales[1]]);
  }

  actualizar(dt: number): void {
    this.tFoco += dt;
    const id = IDS_PERSONAJES[this.foco];
    // Tras un momento con la foto señalada, el personaje se presenta.
    if (this.tFoco > 350 && this.presentado !== id) {
      this.presentado = id;
      const dur = this.juego.audio.voz(id, 'presentacion', this.presentacion.get(id)!);
      this.bustos.get(id)!.hablar(dur);
    }
    this.bustos.get(id)!.actualizar(dt);
  }

  entrada(e: EventoEntrada): void {
    if (this.grupo.entrada(e, false)) return;
    if (e.tipo === 'mover') {
      IDS_PERSONAJES.forEach((_, i) => {
        if (dentro(e.x, e.y, this.rectFoto(i)) && this.foco !== i) {
          this.foco = i;
          this.tFoco = 0;
          this.juego.audio.sfx('hover', { volumen: 0.3 });
        }
      });
    } else if (e.tipo === 'clic') {
      IDS_PERSONAJES.forEach((_, i) => {
        if (dentro(e.x, e.y, this.rectFoto(i))) this.elegir(i);
      });
    } else if (e.tipo === 'tecla') {
      const k = e.tecla.toLowerCase();
      if (k === 'arrowright') this.foco = (this.foco + 1) % IDS_PERSONAJES.length;
      else if (k === 'arrowleft') this.foco = (this.foco + IDS_PERSONAJES.length - 1) % IDS_PERSONAJES.length;
      else if (k === 'enter' || k === ' ') this.elegir(this.foco);
      else if (k >= '1' && k <= '7') {
        this.foco = Number(k) - 1;
        this.elegir(this.foco);
      }
      this.tFoco = 0;
    }
  }

  dibujar(ctx: CanvasRenderingContext2D): void {
    ctx.drawImage(fondoBar(), 0, 0);
    // Título a tiza en una pizarrita
    const titulo = this.paso === 1 ? 'ELIGE COMPAÑERO' : `ELIGE RIVALES (${this.rivales.length}/2) O «SUERTE»`;
    const w = [...titulo].length * 6 + 10;
    panelPizarra(ctx, 160 - w / 2, 3, w, 12);
    texto(ctx, titulo, 160, 5, P.tiza, { alinear: 'centro', variante: 'tiza' });

    IDS_PERSONAJES.forEach((id, i) => {
      const r = this.rectFoto(i);
      const foco = i === this.foco;
      const esCompanero = id === this.companero;
      const esRival = this.rivales.includes(id);
      // Marco de madera y foto (se ilumina al pasar por encima)
      caja(ctx, r.x - 3, r.y - 3, r.w + 6, r.h + 6, P.negro);
      caja(ctx, r.x - 2, r.y - 2, r.w + 4, r.h + 4, foco ? P.oros : P.madera);
      caja(ctx, r.x, r.y, r.w, r.h, foco ? D.crema_boton : P.pared_sombra);
      ctx.drawImage(this.fotos.get(id)!, 12, 2, r.w, r.h, r.x, r.y, r.w, r.h);
      if (!foco) {
        ctx.fillStyle = 'rgba(60,40,20,0.35)';
        ctx.fillRect(r.x, r.y, r.w, r.h);
      }
      // Clavo
      caja(ctx, r.x + r.w / 2 - 1, r.y - 7, 2, 2, P.tinta);
      if (esCompanero || esRival) {
        const cinta = esCompanero ? 'PAREJA' : 'RIVAL';
        caja(ctx, r.x - 2, r.y + r.h - 9, r.w + 4, 9, esCompanero ? P.bastos : P.copas);
        texto(ctx, cinta, r.x + r.w / 2, r.y + r.h - 8, P.papel, { alinear: 'centro' });
      }
      if (this.paso === 2 && esCompanero) {
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(r.x, r.y, r.w, r.h);
      }
    });
    this.dibujarFicha(ctx, IDS_PERSONAJES[this.foco]);
    this.grupo.focoVisible = this.juego.entrada.modoTeclado;
    this.grupo.dibujar(ctx, this.juego.entrada.raton);
  }

  /** Ficha tipo carné con barras de tiza. */
  private dibujarFicha(ctx: CanvasRenderingContext2D, id: IdPersonaje): void {
    const p = PERSONAJES[id];
    const x = 6;
    const y = 74;
    const w = 308;
    const h = 106;
    caja(ctx, x + 2, y + 2, w, h, 'rgba(0,0,0,0.4)');
    caja(ctx, x, y, w, h, P.negro);
    caja(ctx, x + 1, y + 1, w - 2, h - 2, P.papel);
    caja(ctx, x + 1, y + 1, w - 2, 9, P.copas);
    texto(ctx, 'CARNÉ DE SOCIO · BAR EL ENVITE', x + w / 2, y + 2, P.papel, { alinear: 'centro' });
    // Foto
    caja(ctx, x + 5, y + 14, 66, 74, P.negro);
    caja(ctx, x + 6, y + 15, 64, 72, D.cielo);
    this.bustos.get(id)!.dibujar(ctx, x + 6, y + 15);
    marco(ctx, x + 5, y + 14, 66, 74, P.negro);
    // Datos
    const tx = x + 78;
    texto(ctx, p.nombre.toUpperCase(), tx, y + 14, P.tinta, { negrita: true });
    texto(ctx, p.oficio, tx, y + 25, P.copas);
    envolver(p.estiloJuego, 38)
      .slice(0, 2)
      .forEach((l, i) => texto(ctx, l, tx, y + 36 + i * 9, D.gris));
    // Presentación
    const frase = `«${this.presentacion.get(id)}»`;
    envolver(frase, 38)
      .slice(0, 3)
      .forEach((l, i) => texto(ctx, l, tx, y + 56 + i * 9, P.espadas));
    // Barras a tiza
    const barras: [string, number][] = [
      ['Agresivo', p.stats.agr],
      ['Farolero', p.stats.far],
      ['Órdagos', p.stats.ord],
      ['Vista', p.stats.vis],
      ['Disimulo', p.stats.dis],
    ];
    const by = y + 84;
    caja(ctx, tx - 3, by - 2, w - (tx - x) - 2, 22, P.pizarra);
    barras.forEach(([nombre, v], i) => {
      const bx = tx + (i % 3) * 76;
      const fy = by + Math.floor(i / 3) * 10;
      texto(ctx, nombre, bx, fy, P.tiza, { variante: 'tiza' });
      const largo = Math.round(Math.min(1, v) * 24);
      ctx.fillStyle = P.oros;
      for (let k = 0; k < largo; k += 2) ctx.fillRect(bx + 50 + k, fy + 1, 1, 6);
    });
    texto(ctx, 'Voz: ' + p.vozDescripcion.toLowerCase(), x + 6, y + h + 5, P.tinta);
  }
}
