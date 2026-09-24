// Apuestas de la IA (sección 6.5). Recibe `p` = P(que mi pareja gane el lance).

import type { Rng } from '../core/rng';
import { respondedores } from '../mus/betting';
import { rango, type Carta, type Reyes } from '../mus/cards';
import { companero, equipoDe, rival } from '../mus/config';
import { pares, sumaJuego, type Lance } from '../mus/evaluate';
import type { Accion, Decision } from '../mus/types';
import { DIFICULTADES, type PerfilIA } from './personalities';
import type { VistaJugador } from './view';

export interface DecisionApuesta {
  accion: Accion;
  motivo: string;
}

/** ¿Tengo la jugada máxima del lance? (para el modo «Clásico 96»). */
export function jugadaMaxima(cartas: readonly Carta[], lance: Lance, reyes: Reyes): boolean {
  const r = cartas.map((c) => rango(c, reyes));
  switch (lance) {
    case 'grande':
      return r.every((x) => x === 12);
    case 'chica':
      return r.every((x) => x === 1);
    case 'pares': {
      const p = pares(cartas, reyes);
      return p.tipo === 3 && p.alta === 12;
    }
    case 'juego':
      return sumaJuego(cartas, reyes) === 31;
    case 'punto':
      return sumaJuego(cartas, reyes) === 30;
  }
}

export interface OpcionesApuestaIA {
  /** El compañero de este jugador es el humano: no le pisa las apuestas. */
  companeroHumano?: boolean;
  /** Cuánto farolea el humano (0..1). Sólo «Difícil» lo aprende; se aplica si el que apuesta es él. */
  farolHumano?: number;
  /** La `p` que llega ya está condicionada a las apuestas del lance (Monte Carlo). */
  pCondicionada?: boolean;
}

function envite(cantidad: number): Accion {
  return { tipo: 'envido', cantidad: Math.max(2, Math.min(40, Math.round(cantidad))) };
}

export function decidirApuesta(
  vista: VistaJugador,
  d: Extract<Decision, { tipo: 'apuesta' }>,
  p: number,
  perfil: PerfilIA,
  rng: Rng,
  op: OpcionesApuestaIA = {},
): DecisionApuesta {
  const pers = perfil.personalidad;
  const dif = DIFICULTADES[perfil.dificultad];
  const eq = equipoDe(vista.yo);
  const meta = vista.config.puntosJuego;
  const nuestros = vista.marcador[eq];
  const suyos = vista.marcador[rival(eq)];
  const faltanNos = meta - nuestros;
  const faltanEllos = meta - suyos;
  const mira = dif.miraMarcador;

  // --- Nadie ha apostado todavía: paso, envido u órdago ---------------------------------
  if (d.opciones.includes('paso')) {
    if (p > 0.85 && rng() < pers.ord) return { accion: { tipo: 'ordago' }, motivo: `órdago con p=${p.toFixed(2)}` };
    if (mira && faltanEllos <= 5 && p > 0.7 && rng() < 0.15 + pers.ord) {
      return { accion: { tipo: 'ordago' }, motivo: 'el rival está a punto de ganar' };
    }
    if (mira && faltanEllos <= 3 && faltanNos >= 15 && rng() < pers.ord * pers.far * 2) {
      return { accion: { tipo: 'ordago' }, motivo: 'órdago desesperado' };
    }
    const umbralEnvido = 0.74 - 0.34 * pers.agr;
    if (p > umbralEnvido) {
      const cantidad = p > 0.8 ? 3 + Math.floor(rng() * (0.5 + 2.5 * pers.agr)) : 2;
      return { accion: envite(Math.min(cantidad, 5)), motivo: `envida con p=${p.toFixed(2)}` };
    }
    if (p < 0.35 && rng() < pers.far * dif.factorFarol) return { accion: envite(2), motivo: 'farol' };
    return { accion: { tipo: 'paso' }, motivo: `pasa con p=${p.toFixed(2)}` };
  }

  // --- Hay apuesta: quiero, no quiero, más u órdago ------------------------------------
  const ap = vista.apuesta;
  const vigente = d.apuestaVigente;
  const anterior = ap?.apuestaAnterior ?? 0;
  // ¿Mi compañero humano todavía puede contestar después de mí? Entonces no decido por él.
  let humanoPendiente = false;
  if (op.companeroHumano && ap?.apostador !== null && ap?.apostador !== undefined) {
    const resp = respondedores(ap.participantes, ap.apostador);
    humanoPendiente = resp[0] === vista.yo && resp.includes(companero(vista.yo));
  }
  // Una apuesta rival es información: si envidan, suele ser porque tienen cartas. Cuantas más
  // apuestas rivales en el lance (y más si es órdago), más se rebaja la confianza. Si el que
  // apuesta farolea mucho (lo aprende «Difícil»), se le respeta menos.
  const apuestasRivales = vista.historial.filter(
    (h) =>
      h.lance === d.lance &&
      equipoDe(h.jugador) !== eq &&
      (h.voz === 'envido' || h.voz === 'envidoMas' || h.voz === 'ordago'),
  ).length;
  const farolApostador = ap?.apostador === 0 ? (op.farolHumano ?? 0) : 0;
  // Con Monte Carlo la p ya viene ponderada por lo apostado: sólo queda un pequeño respeto.
  const porApuesta = op.pCondicionada ? 0.15 : 0.7;
  const respeto =
    (porApuesta * apuestasRivales + (d.ordago ? (op.pCondicionada ? 0.15 : 0.5) : 0)) * (1 - farolApostador);
  const pAjustada = Math.min(0.99, Math.pow(p, 1 + respeto) + farolApostador * 0.15);

  if (d.ordago) {
    if (dif.clasico96 && !jugadaMaxima(vista.cartas, d.lance, vista.config.reyes)) {
      return { accion: { tipo: 'noQuiero' }, motivo: 'Clásico 96: se achanta' };
    }
    let umbral = 0.55;
    if (mira) {
      if (suyos >= meta - 5) umbral = 0.4;
      else if (nuestros - suyos >= 15) umbral = 0.7;
      else if (nuestros >= meta - 5) umbral = 0.62;
    }
    if (humanoPendiente) umbral += 0.1;
    return pAjustada > umbral
      ? { accion: { tipo: 'quiero' }, motivo: `acepta el órdago con p=${pAjustada.toFixed(2)}` }
      : { accion: { tipo: 'noQuiero' }, motivo: `no quiere el órdago (p=${pAjustada.toFixed(2)} < ${umbral})` };
  }

  // Lo que cuesta rechazar frente a lo que se juega: quiero si (2p − 1)·V > −coste.
  const coste = Math.max(1, anterior);
  let umbralQuiero = 0.5 - coste / (2 * vigente) + (0.16 - 0.12 * pers.agr);
  if (mira && vigente >= faltanEllos) umbralQuiero = Math.max(umbralQuiero, 0.5);
  if (mira && vigente >= faltanNos) umbralQuiero -= 0.05;
  // Cada subida que ya ha habido en el lance exige más para volver a subir; a partir de la tercera,
  // o si ya se juega más de lo que falta para ganar, sólo se quiere, no se quiere o se va al órdago.
  const subidas = vista.historial.filter(
    (h) => h.lance === d.lance && (h.voz === 'envido' || h.voz === 'envidoMas'),
  ).length;
  const puedeSubir = subidas < 3 && vigente < Math.min(faltanNos, faltanEllos) && d.opciones.includes('envido');
  let umbralSubir = Math.max(
    umbralQuiero + 0.2,
    0.74 - 0.14 * pers.agr + 0.01 * Math.min(vigente, 10) + 0.06 * Math.max(0, subidas - 1),
  );
  if (humanoPendiente) {
    umbralQuiero += 0.12;
    umbralSubir = Math.max(umbralSubir + 0.1, 0.8);
  }

  if (pAjustada > 0.88 && rng() < pers.ord * 1.2 && !humanoPendiente) {
    return { accion: { tipo: 'ordago' }, motivo: `órdago de vuelta con p=${pAjustada.toFixed(2)}` };
  }
  if (pAjustada > umbralSubir && puedeSubir) {
    const mas = 2 + Math.floor(rng() * (1 + 3 * pers.agr));
    return { accion: envite(mas), motivo: `sube ${mas} con p=${pAjustada.toFixed(2)}` };
  }
  if (pAjustada > umbralQuiero) {
    return { accion: { tipo: 'quiero' }, motivo: `quiere con p=${pAjustada.toFixed(2)} > ${umbralQuiero.toFixed(2)}` };
  }
  if (p < 0.3 && !humanoPendiente && puedeSubir && subidas < 2 && rng() < pers.far * dif.factorFarol * 0.2) {
    return { accion: envite(2), motivo: 'farol de vuelta' };
  }
  return {
    accion: { tipo: 'noQuiero' },
    motivo: humanoPendiente ? 'deja decidir a su compañero' : `no quiere (p=${pAjustada.toFixed(2)})`,
  };
}
