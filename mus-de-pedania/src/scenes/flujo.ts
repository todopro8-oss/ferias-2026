// Flujo de pantallas (sección 9): arranque → intro → menú → selección → mesa → fin…
// Las escenas no se conocen entre sí: piden a este controlador que las lleve a otra.

import { CLAVES, escribir, leer, borrar } from '../core/save';
import { OPCIONES_POR_DEFECTO, type Juego, type Opciones } from '../core/juego';
import type { IdPersonaje } from '../data/characters';
import {
  nombreRonda,
  nuevoTorneo,
  registrarResultado,
  rivalesActuales,
  VERSION_TORNEO,
  type EstadoTorneo,
} from '../data/tournament';
import { Boot } from './Boot';
import { Champion } from './Champion';
import { CharacterSelect } from './CharacterSelect';
import { HowToPlay } from './HowToPlay';
import { Intro } from './Intro';
import { MainMenu } from './MainMenu';
import { MatchEnd } from './MatchEnd';
import { NameEntry } from './NameEntry';
import { OptionsScene } from './Options';
import { Pause } from './Pause';
import { Mesa, type ResultadoPartida } from './Table';
import { TournamentBoard } from './TournamentBoard';
import type { Escena } from '../core/sceneManager';
import { crearMesaTutorial } from './tutorial';

export const VERSION_OPCIONES = 1;
export const VERSION_ESTADISTICAS = 1;

export interface EstadisticasGuardadas {
  partidas: number;
  ganadas: number;
  torneos: number;
  torneosGanados: number;
  manos: number;
  ordagosLanzados: number;
  ordagosAceptados: number;
  senasHechas: number;
  senasCazadas: number;
}

const ESTADISTICAS_VACIAS: EstadisticasGuardadas = {
  partidas: 0,
  ganadas: 0,
  torneos: 0,
  torneosGanados: 0,
  manos: 0,
  ordagosLanzados: 0,
  ordagosAceptados: 0,
  senasHechas: 0,
  senasCazadas: 0,
};

export type ModoMesa = 'partida' | 'torneo';

export interface ContextoPartida {
  modo: ModoMesa;
  companero: IdPersonaje;
  rivales: [IdPersonaje, IdPersonaje];
  titulo?: string;
}

export class Flujo {
  estadisticas: EstadisticasGuardadas;
  torneo: EstadoTorneo | null;
  private ultimaPartida: ContextoPartida | null = null;
  /** Sólo para pruebas automáticas: fuerza el ganador de cada partida. */
  forzarGanador: 0 | 1 | null = null;
  /** Modo demostración: la IA juega también por ti (?demo). */
  demo = false;

  constructor(private readonly juego: Juego) {
    this.estadisticas = leer(CLAVES.estadisticas, VERSION_ESTADISTICAS, { ...ESTADISTICAS_VACIAS });
    this.torneo = leer<EstadoTorneo | null>(CLAVES.torneo, VERSION_TORNEO, null);
  }

  /** Carga las opciones guardadas (completando con las de por defecto si faltan claves nuevas). */
  static cargarOpciones(): Opciones {
    const g = leer<Partial<Opciones>>(CLAVES.opciones, VERSION_OPCIONES, {}, (_v, d) => d as Partial<Opciones>);
    return {
      ...structuredClone(OPCIONES_POR_DEFECTO),
      ...g,
      reglas: { ...OPCIONES_POR_DEFECTO.reglas, ...(g.reglas ?? {}) },
    };
  }

  guardarOpciones(): void {
    escribir(CLAVES.opciones, VERSION_OPCIONES, this.juego.opciones);
    this.juego.pantalla.configurar(this.juego.opciones.escalado, this.juego.opciones.correccion43);
  }

  private guardarEstadisticas(): void {
    escribir(CLAVES.estadisticas, VERSION_ESTADISTICAS, this.estadisticas);
  }

  private guardarTorneo(): void {
    if (this.torneo) escribir(CLAVES.torneo, VERSION_TORNEO, this.torneo);
    else borrar(CLAVES.torneo);
  }

  // ---------------------------------------------------------------------------

  arrancar(): void {
    if (this.juego.opciones.arranqueRetro) this.juego.escenas.cambiar(new Boot(this.juego, () => this.intro()));
    else this.intro();
  }

  intro(): void {
    this.juego.escenas.cambiar(new Intro(this.juego, () => this.menu()));
  }

  menu(): void {
    this.juego.escenas.cambiar(new MainMenu(this.juego, this));
  }

  opciones(): void {
    this.juego.escenas.apilar(new OptionsScene(this.juego, () => this.guardarOpciones()));
  }

  comoSeJuega(): void {
    this.juego.escenas.cambiar(new HowToPlay(this.juego, this));
  }

  tutorial(): void {
    this.juego.escenas.cambiar(crearMesaTutorial(this.juego, this));
  }

  partida(): void {
    this.juego.escenas.cambiar(
      new CharacterSelect(this.juego, {
        modo: 'partida',
        alElegir: (companero, rivales) => this.jugar({ modo: 'partida', companero, rivales: rivales! }),
        alVolver: () => this.menu(),
      }),
    );
  }

  /** Menú «Torneo»: continuar el guardado o empezar uno nuevo. */
  torneoComarcal(): void {
    if (this.torneo && !this.torneo.campeon && !this.torneo.eliminado) {
      this.cuadro();
      return;
    }
    this.nuevoTorneo();
  }

  nuevoTorneo(): void {
    this.juego.escenas.cambiar(
      new NameEntry(this.juego, {
        inicial: this.torneo?.nombreJugador ?? '',
        alAceptar: (nombre) =>
          this.juego.escenas.cambiar(
            new CharacterSelect(this.juego, {
              modo: 'torneo',
              alElegir: (companero) => {
                this.torneo = nuevoTorneo(companero, nombre, Math.floor(Math.random() * 1e9));
                this.estadisticas.torneos++;
                this.guardarEstadisticas();
                this.guardarTorneo();
                this.cuadro();
              },
              alVolver: () => this.menu(),
            }),
          ),
        alVolver: () => this.menu(),
      }),
    );
  }

  cuadro(): void {
    if (!this.torneo) return this.menu();
    this.juego.escenas.cambiar(new TournamentBoard(this.juego, this, this.torneo));
  }

  jugarRondaTorneo(): void {
    const t = this.torneo;
    const rivales = t ? rivalesActuales(t) : null;
    if (!t || !rivales) return this.cuadro();
    this.jugar({ modo: 'torneo', companero: t.companero, rivales, titulo: nombreRonda(t.rondaActual) });
  }

  jugar(ctx: ContextoPartida): void {
    this.ultimaPartida = ctx;
    const mesa: Mesa = new Mesa(this.juego, {
      companero: ctx.companero,
      rivales: ctx.rivales,
      titulo: ctx.titulo,
      autoJugar: this.demo,
      alTerminar: (r) => this.finPartida(ctx, r, mesa),
      alPausar: () => this.pausa(mesa),
    });
    this.juego.escenas.cambiar(mesa);
  }

  repetirPartida(): void {
    if (this.ultimaPartida) this.jugar(this.ultimaPartida);
    else this.menu();
  }

  pausa(mesa: Mesa): void {
    this.juego.escenas.apilar(
      new Pause(this.juego, {
        mesa,
        alOpciones: () => this.opciones(),
        alAbandonar: () => this.menu(),
      }),
    );
  }

  private finPartida(ctx: ContextoPartida, r: ResultadoPartida, mesa: Mesa): void {
    if (this.forzarGanador !== null) r = { ...r, ganador: this.forzarGanador };
    const e = this.estadisticas;
    e.partidas++;
    if (r.ganador === 0) e.ganadas++;
    e.manos += r.estadisticas.manos;
    e.ordagosLanzados += r.estadisticas.ordagosLanzados;
    e.ordagosAceptados += r.estadisticas.ordagosAceptados;
    e.senasHechas += r.estadisticas.senasHechas;
    e.senasCazadas += r.estadisticas.senasCazadas;
    if (ctx.modo === 'torneo' && this.torneo) {
      const m = r.estadisticas.piedras;
      this.torneo = registrarResultado(this.torneo, r.ganador === 0, [
        r.ganador === 0 ? Math.max(m[0], 40) : m[0],
        r.ganador === 1 ? Math.max(m[1], 40) : m[1],
      ]);
      if (this.torneo.campeon) e.torneosGanados++;
      this.guardarTorneo();
    }
    this.guardarEstadisticas();
    this.juego.escenas.cambiar(
      new MatchEnd(this.juego, this, {
        resultado: r,
        contexto: ctx,
        bustos: mesa.bustosParaFinal(),
        torneo: ctx.modo === 'torneo' ? this.torneo : null,
      }),
    );
  }

  campeon(): void {
    if (!this.torneo) return this.menu();
    this.juego.escenas.cambiar(new Champion(this.juego, this, this.torneo));
  }

  /** Abandonar el torneo en curso. */
  olvidarTorneo(): void {
    this.torneo = null;
    this.guardarTorneo();
  }

  apilar(e: Escena): void {
    this.juego.escenas.apilar(e);
  }
}
