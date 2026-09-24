// Arena: juega manos y partidas completas entre jugadores IA, comprobando por el camino
// que el marcador es coherente. La usan el simulador, la partida en consola y los tests.

import type { Rng } from '../core/rng';
import { juegosParaGanar, type Equipo, type MusConfig, type Seat } from '../mus/config';
import type { Lance } from '../mus/evaluate';
import type { ManoMus } from '../mus/handState';
import { PartidaMus } from '../mus/match';
import type { EventoMus } from '../mus/types';
import type { JugadorIA } from './jugador';
import { vistaPara } from './view';

const MAX_DECISIONES = 5000;

/** Juega la mano hasta el final. Devuelve el número de decisiones tomadas. */
export function jugarMano(
  m: ManoMus,
  jugadores: readonly JugadorIA[],
  alDecidir?: (m: ManoMus, jugador: Seat) => void,
  juegos?: [number, number],
): number {
  let n = 0;
  for (let d = m.pendiente(); d; d = m.pendiente()) {
    if (++n > MAX_DECISIONES) throw new Error('La mano no termina (¿bucle de apuestas?)');
    const accion = jugadores[d.jugador].decidir(vistaPara(m, d.jugador, { juegos }), d);
    m.actuar(d.jugador, accion);
    alDecidir?.(m, d.jugador);
  }
  return n;
}

/** Comprueba que el marcador final cuadra con los dejes y el recuento emitidos. */
export function comprobarCoherencia(m: ManoMus): void {
  const suma: [number, number] = [0, 0];
  for (const e of m.eventos) {
    if (e.tipo === 'deje') suma[e.equipo] += e.piedras;
    if (e.tipo === 'recuento' && e.linea.equipo !== null) suma[e.linea.equipo] += e.linea.total;
  }
  for (const eq of [0, 1] as Equipo[]) {
    const esperado = m.marcadorInicial[eq] + suma[eq];
    if (m.marcador[eq] !== esperado) {
      throw new Error(`Marcador incoherente para el equipo ${eq}: ${m.marcador[eq]} ≠ ${esperado}`);
    }
    if (m.marcador[eq] < m.marcadorInicial[eq]) throw new Error('El marcador ha bajado');
  }
  const meta = m.config.puntosJuego;
  if (!m.terminada) throw new Error('La mano no ha terminado');
  if (m.finJuego) {
    const g = m.finJuego.ganador;
    if (m.finJuego.motivo !== 'ordago' && m.marcador[g] < meta)
      throw new Error('Gana el juego sin llegar a los puntos');
    if (m.marcador[1 - g] >= meta) throw new Error('El perdedor también había llegado a los puntos');
  } else if (m.marcador[0] >= meta || m.marcador[1] >= meta) {
    throw new Error('Alguien llegó a los puntos y el juego no terminó');
  }
  m.comprobarInvariante();
}

export interface EstadisticasSim {
  manos: number;
  juegos: number;
  partidas: number;
  decisiones: number;
  rondasMus: number;
  rebarajados: number;
  lances: Record<Lance, Record<string, number>>;
  ordagos: { lanzados: number; aceptados: number };
  finJuego: Record<'deje' | 'ordago' | 'recuento', number>;
  piedras: number;
  partidasGanadas: [number, number];
}

function nuevasEstadisticas(): EstadisticasSim {
  const lance = () => ({ paso: 0, querido: 0, rechazado: 0, solo: 0, nadie: 0 });
  return {
    manos: 0,
    juegos: 0,
    partidas: 0,
    decisiones: 0,
    rondasMus: 0,
    rebarajados: 0,
    lances: { grande: lance(), chica: lance(), pares: lance(), juego: lance(), punto: lance() },
    ordagos: { lanzados: 0, aceptados: 0 },
    finJuego: { deje: 0, ordago: 0, recuento: 0 },
    piedras: 0,
    partidasGanadas: [0, 0],
  };
}

function acumular(st: EstadisticasSim, m: ManoMus): void {
  st.manos++;
  st.rondasMus += m.rondaMus;
  if (m.rebarajado) st.rebarajados++;
  for (const [l, r] of Object.entries(m.resultados)) st.lances[l as Lance][r.tipo]++;
  for (const e of m.eventos) {
    if (e.tipo === 'habla' && e.voz === 'ordago') st.ordagos.lanzados++;
    if (e.tipo === 'ordago_aceptado') st.ordagos.aceptados++;
  }
  st.piedras += m.marcador[0] - m.marcadorInicial[0] + m.marcador[1] - m.marcadorInicial[1];
  if (m.finJuego) {
    st.juegos++;
    st.finJuego[m.finJuego.motivo]++;
  }
}

export interface OpcionesSim {
  manos: number;
  config: MusConfig;
  rng: Rng;
  /** Crea los cuatro jugadores de cada partida. */
  crearJugadores: (partida: number) => JugadorIA[];
  /** Llamado con cada evento de cada mano (para registros legibles). */
  alEvento?: (e: EventoMus, m: ManoMus, partida: PartidaMus) => void;
  alTerminarPartida?: (p: PartidaMus) => void;
}

/** Juega partidas completas hasta completar `manos` manos, comprobando coherencia en cada una. */
export function simular(op: OpcionesSim): EstadisticasSim {
  const st = nuevasEstadisticas();
  let partida: PartidaMus | null = null;
  let jugadores: JugadorIA[] = [];
  while (st.manos < op.manos) {
    if (!partida || partida.terminada) {
      if (partida) {
        st.partidas++;
        st.partidasGanadas[partida.ganador!]++;
        op.alTerminarPartida?.(partida);
      }
      partida = new PartidaMus(op.config, op.rng);
      jugadores = op.crearJugadores(st.partidas);
    }
    const p: PartidaMus = partida;
    const m = p.nuevaMano();
    const volcar = () => {
      for (const e of m.sacarEventos()) op.alEvento?.(e, m, p);
    };
    volcar();
    st.decisiones += jugarMano(m, jugadores, volcar, [p.juegos[0], p.juegos[1]]);
    volcar();
    comprobarCoherencia(m);
    acumular(st, m);
    p.cerrarMano();
    if (p.terminada && p.juegos[p.ganador!] !== juegosParaGanar(op.config)) {
      throw new Error('La partida terminó con un número de juegos incorrecto');
    }
  }
  if (partida?.terminada) {
    st.partidas++;
    st.partidasGanadas[partida.ganador!]++;
    op.alTerminarPartida?.(partida);
  }
  return st;
}
