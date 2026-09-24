// Vista filtrada del estado para un jugador (sección 6.1): sus cartas y lo público.
// La IA sólo decide a partir de esto; nunca recibe la ManoMus.

import type { Carta } from '../mus/cards';
import type { Equipo, MusConfig, Seat } from '../mus/config';
import type { Lance } from '../mus/evaluate';
import type { ManoMus } from '../mus/handState';
import type { RegistroHabla, ResultadoLance } from '../mus/types';

/** Lo que una seña le cuenta a quien la ve. */
export type SignificadoSena = 'reyes' | 'ases' | 'medias' | 'duples' | 'treintayuna' | 'ciego' | 'tresReyes';

export interface SenaVista {
  de: Seat;
  significado: SignificadoSena;
  /** true si la hizo mi compañero para mí; false si la cacé a un rival (o me la hicieron a mí). */
  deCompanero: boolean;
}

export interface ApuestaPublica {
  lance: Lance;
  participantes: Seat[];
  apuestaVigente: number;
  apuestaAnterior: number;
  apostadoPor: Equipo | null;
  apostador: Seat | null;
  ordago: boolean;
}

export interface VistaJugador {
  yo: Seat;
  config: MusConfig;
  cartas: Carta[];
  /** Cartas que yo he descartado en esta mano (sólo las mías). */
  misDescartes: Carta[];
  mano: Seat;
  postre: Seat;
  marcador: [number, number];
  juegos: [number, number];
  rondaMus: number;
  descartesPorRonda: number[][];
  rebarajado: boolean;
  historial: RegistroHabla[];
  declaraciones: { pares: boolean[] | null; juego: boolean[] | null };
  lance: Lance | null;
  apuesta: ApuestaPublica | null;
  resultados: Partial<Record<Lance, ResultadoLance>>;
  hayJuego: boolean | null;
  senas: SenaVista[];
}

function clonar<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T;
}

export function vistaPara(
  m: ManoMus,
  yo: Seat,
  extra: { juegos?: [number, number]; senas?: SenaVista[] } = {},
): VistaJugador {
  const a = m.apuesta;
  return {
    yo,
    config: { ...m.config },
    cartas: [...m.manos[yo]],
    misDescartes: [...m.descartadas[yo]],
    mano: m.mano,
    postre: m.postre,
    marcador: [m.marcador[0], m.marcador[1]],
    juegos: extra.juegos ? [extra.juegos[0], extra.juegos[1]] : [0, 0],
    rondaMus: m.rondaMus,
    descartesPorRonda: m.descartesPorRonda.map((r) => [...r]),
    rebarajado: m.rebarajado,
    historial: clonar(m.historial),
    declaraciones: {
      pares: m.declaraciones.pares ? [...m.declaraciones.pares] : null,
      juego: m.declaraciones.juego ? [...m.declaraciones.juego] : null,
    },
    lance: m.lance,
    apuesta:
      a && m.lance
        ? {
            lance: m.lance,
            participantes: [...a.participantes],
            apuestaVigente: a.apuestaVigente,
            apuestaAnterior: a.apuestaAnterior,
            apostadoPor: a.apostadoPor,
            apostador: a.apostador,
            ordago: a.ordago,
          }
        : null,
    resultados: clonar(m.resultados),
    hayJuego: m.hayJuego,
    senas: extra.senas ? clonar(extra.senas) : [],
  };
}
