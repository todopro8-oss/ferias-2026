// Partida: sucesión de manos y de juegos (sección 4.9).

import { randInt, type Rng } from '../core/rng';
import type { Carta } from './cards';
import { juegosParaGanar, type Equipo, type MusConfig, type Seat } from './config';
import { ManoMus } from './handState';
import type { FinJuego } from './types';

export interface ResumenMano {
  numero: number;
  juego: number;
  postre: Seat;
  marcadorAntes: [number, number];
  marcadorDespues: [number, number];
  finJuego: FinJuego | null;
}

export class PartidaMus {
  readonly config: MusConfig;
  /** Piedras del juego en curso. */
  marcador: [number, number] = [0, 0];
  /** Juegos ganados por cada equipo. */
  juegos: [number, number] = [0, 0];
  postre: Seat;
  numeroMano = 0;
  numeroJuego = 0;
  manoActual: ManoMus | null = null;
  ganador: Equipo | null = null;
  readonly historial: ResumenMano[] = [];
  private primeraDelJuego = true;
  private readonly rng: Rng;

  constructor(config: MusConfig, rng: Rng, postreInicial?: Seat) {
    this.config = config;
    this.rng = rng;
    // Primera mano: postre aleatorio (el «cortar a ver quién da»).
    this.postre = postreInicial ?? (randInt(rng, 4) as Seat);
  }

  get terminada(): boolean {
    return this.ganador !== null;
  }

  /** Reparte una mano nueva. `manos` sólo para tutoriales y tests. */
  nuevaMano(manos?: Carta[][]): ManoMus {
    if (this.terminada) throw new Error('La partida ha terminado');
    if (this.manoActual && !this.manoActual.terminada) throw new Error('La mano actual no ha terminado');
    this.manoActual = new ManoMus({
      config: this.config,
      postre: this.postre,
      marcador: [this.marcador[0], this.marcador[1]],
      rng: this.rng,
      primeraDelJuego: this.primeraDelJuego,
      manos,
    });
    return this.manoActual;
  }

  /** Aplica el resultado de la mano terminada y prepara la siguiente. */
  cerrarMano(): ResumenMano {
    const m = this.manoActual;
    if (!m || !m.terminada) throw new Error('No hay una mano terminada que cerrar');
    const resumen: ResumenMano = {
      numero: this.numeroMano,
      juego: this.numeroJuego,
      postre: m.postre,
      marcadorAntes: [this.marcador[0], this.marcador[1]],
      marcadorDespues: [m.marcador[0], m.marcador[1]],
      finJuego: m.finJuego,
    };
    this.historial.push(resumen);
    this.numeroMano++;
    // La antigua mano pasa a ser postre (con mus corrido, la mano puede haber avanzado).
    this.postre = m.mano;
    this.manoActual = null;

    if (m.finJuego) {
      this.juegos[m.finJuego.ganador]++;
      this.marcador = [0, 0];
      this.numeroJuego++;
      this.primeraDelJuego = true;
      if (this.juegos[m.finJuego.ganador] >= juegosParaGanar(this.config)) this.ganador = m.finJuego.ganador;
    } else {
      this.marcador = [m.marcador[0], m.marcador[1]];
      this.primeraDelJuego = false;
    }
    return resumen;
  }
}
