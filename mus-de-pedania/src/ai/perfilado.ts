// Mide el estilo de juego de un perfil IA: cuánto corta el mus, envida, farolea,
// echa órdagos y quiere. Sirve para comprobar que cada personalidad se nota.

import { derivarSemilla, mulberry32, type Rng } from '../core/rng';
import { crearConfig, type Seat } from '../mus/config';
import { PartidaMus } from '../mus/match';
import { crearJugador } from './fabrica';
import type { JugadorMus } from './jugadorMus';
import { PERSONALIDAD_NEUTRA, type Dificultad, type Personalidad } from './personalities';
import { vistaPara } from './view';

export interface PerfilMedido {
  manos: number;
  /** De las veces que habló en el mus, cuántas cortó. */
  corteMus: number;
  /** Envites de apertura sobre las ocasiones de abrir. */
  envida: number;
  /** Faroles sobre las ocasiones de abrir. */
  farolea: number;
  /** Órdagos lanzados por mano. */
  ordagos: number;
  /** «Quiero» sobre las veces que tuvo que responder a un envite (no órdago). */
  quiere: number;
}

export function medirPerfil(
  personalidad: Personalidad,
  estilo: JugadorMus['perfil']['estilo'],
  manos: number,
  semilla: number,
  dificultad: Dificultad = 'normal',
): PerfilMedido {
  const rng: Rng = mulberry32(semilla);
  const config = crearConfig();
  const cuenta = { musHabla: 0, musCorta: 0, abre: 0, envida: 0, farol: 0, ordagos: 0, responde: 0, quiere: 0 };
  let jugadas = 0;
  const OBJETIVO: Seat = 1;
  while (jugadas < manos) {
    const partida = new PartidaMus(config, mulberry32(derivarSemilla(rng)));
    const jugadores = ([0, 1, 2, 3] as Seat[]).map((s) =>
      crearJugador(
        s === OBJETIVO
          ? { personalidad, dificultad, nombre: 'medido', estilo }
          : { personalidad: PERSONALIDAD_NEUTRA, dificultad, nombre: `n${s}` },
        mulberry32(derivarSemilla(rng)),
      ),
    );
    while (!partida.terminada && jugadas < manos) {
      const m = partida.nuevaMano();
      for (let d = m.pendiente(); d; d = m.pendiente()) {
        const a = jugadores[d.jugador].decidir(vistaPara(m, d.jugador), d);
        if (d.jugador === OBJETIVO) {
          if (d.tipo === 'mus') {
            cuenta.musHabla++;
            if (a.tipo === 'noHayMus') cuenta.musCorta++;
          } else if (d.tipo === 'apuesta') {
            if (d.opciones.includes('paso')) {
              cuenta.abre++;
              if (a.tipo === 'envido') cuenta.envida++;
              if (jugadores[OBJETIVO].ultimoMotivo.startsWith('farol')) cuenta.farol++;
            } else if (!d.ordago) {
              cuenta.responde++;
              if (a.tipo === 'quiero') cuenta.quiere++;
            }
            if (a.tipo === 'ordago') cuenta.ordagos++;
          }
        }
        m.actuar(d.jugador, a);
      }
      partida.cerrarMano();
      jugadas++;
    }
  }
  const r = (a: number, b: number) => (b === 0 ? 0 : a / b);
  return {
    manos: jugadas,
    corteMus: r(cuenta.musCorta, cuenta.musHabla),
    envida: r(cuenta.envida, cuenta.abre),
    farolea: r(cuenta.farol, cuenta.abre),
    ordagos: r(cuenta.ordagos, jugadas),
    quiere: r(cuenta.quiere, cuenta.responde),
  };
}
