// Recuento al final de la mano (sección 4.8) y utilidades de marcador.

import type { Carta, Reyes } from './cards';
import { equipoDe, type Equipo, type Seat } from './config';
import { ganadorLance, pares, sumaJuego, valorDeJuego, type Lance, type TipoPares } from './evaluate';
import type { LineaRecuento, MotivoParte, ParteRecuento, ResultadoLance } from './types';

export const PIEDRAS_POR_AMARRACO = 5;

/** 27 piedras → 5 amarracos y 2 piedras. */
export function enAmarracos(piedras: number): { amarracos: number; piedras: number } {
  return { amarracos: Math.floor(piedras / PIEDRAS_POR_AMARRACO), piedras: piedras % PIEDRAS_POR_AMARRACO };
}

export interface ContextoRecuento {
  manos: readonly (readonly Carta[])[];
  mano: Seat;
  reyes: Reyes;
  resultados: Partial<Record<Lance, ResultadoLance>>;
  /** Quiénes tenían jugada (y hablaron) en pares y en juego. */
  participantesPares: readonly Seat[];
  participantesJuego: readonly Seat[];
  /** false si se jugó al punto. */
  hayJuego: boolean;
}

const MOTIVO_PARES: Record<TipoPares, MotivoParte> = { 0: 'pareja', 1: 'pareja', 2: 'medias', 3: 'duples' };

function partesJugadas(ctx: ContextoRecuento, lance: 'pares' | 'juego', equipo: Equipo): ParteRecuento[] {
  const partes: ParteRecuento[] = [];
  // Orden de habla, para que el recuento se lea como en la mesa.
  for (let k = 0; k < 4; k++) {
    const s = ((ctx.mano + k) % 4) as Seat;
    if (equipoDe(s) !== equipo) continue;
    if (lance === 'pares') {
      const p = pares(ctx.manos[s], ctx.reyes);
      if (p.tipo > 0) partes.push({ piedras: p.tipo, motivo: MOTIVO_PARES[p.tipo], jugador: s });
    } else {
      const suma = sumaJuego(ctx.manos[s], ctx.reyes);
      const v = valorDeJuego(suma);
      if (v > 0) partes.push({ piedras: v, motivo: suma === 31 ? 'juego31' : 'juego', jugador: s, suma });
    }
  }
  return partes;
}

function linea(lance: Lance, equipo: Equipo | null, partes: ParteRecuento[]): LineaRecuento {
  const total = partes.reduce((acc, p) => acc + (p.cobradoAntes ? 0 : p.piedras), 0);
  return { lance, equipo, partes, total };
}

function equipoGanador(ctx: ContextoRecuento, lance: Lance, participantes?: readonly Seat[]): Equipo {
  const g = ganadorLance(lance, ctx.manos, ctx.mano, ctx.reyes, participantes);
  if (g === null) throw new Error(`Nadie gana el lance de ${lance}`);
  return equipoDe(g);
}

function recuentoGrandeChica(ctx: ContextoRecuento, lance: 'grande' | 'chica'): LineaRecuento {
  const r = ctx.resultados[lance];
  if (!r) throw new Error(`Falta el resultado de ${lance}`);
  switch (r.tipo) {
    case 'querido':
      return linea(lance, equipoGanador(ctx, lance), [{ piedras: r.puntos, motivo: 'querido' }]);
    case 'paso':
      return linea(lance, equipoGanador(ctx, lance), [{ piedras: 1, motivo: 'paso' }]);
    case 'rechazado':
      return linea(lance, r.ganador, [{ piedras: r.piedras, motivo: 'deje', cobradoAntes: true }]);
    default:
      throw new Error(`Resultado imposible en ${lance}: ${r.tipo}`);
  }
}

function recuentoJugada(ctx: ContextoRecuento, lance: 'pares' | 'juego'): LineaRecuento {
  const r = ctx.resultados[lance];
  if (!r) throw new Error(`Falta el resultado de ${lance}`);
  const participantes = lance === 'pares' ? ctx.participantesPares : ctx.participantesJuego;
  switch (r.tipo) {
    case 'nadie':
      return linea(lance, null, []);
    case 'solo':
      return linea(lance, r.equipo, partesJugadas(ctx, lance, r.equipo));
    case 'paso': {
      const e = equipoGanador(ctx, lance, participantes);
      return linea(lance, e, partesJugadas(ctx, lance, e));
    }
    case 'querido': {
      const e = equipoGanador(ctx, lance, participantes);
      return linea(lance, e, [{ piedras: r.puntos, motivo: 'querido' }, ...partesJugadas(ctx, lance, e)]);
    }
    case 'rechazado':
      return linea(lance, r.ganador, [
        { piedras: r.piedras, motivo: 'deje', cobradoAntes: true },
        ...partesJugadas(ctx, lance, r.ganador),
      ]);
  }
}

function recuentoPunto(ctx: ContextoRecuento): LineaRecuento {
  const r = ctx.resultados.punto;
  if (!r) throw new Error('Falta el resultado del punto');
  switch (r.tipo) {
    case 'querido':
      return linea('punto', equipoGanador(ctx, 'punto'), [
        { piedras: r.puntos, motivo: 'querido' },
        { piedras: 1, motivo: 'punto' },
      ]);
    case 'paso':
      return linea('punto', equipoGanador(ctx, 'punto'), [{ piedras: 1, motivo: 'punto' }]);
    case 'rechazado':
      // Igual que en pares y juego: quien gana por «no quiero» cobra además el valor del lance.
      return linea('punto', r.ganador, [
        { piedras: r.piedras, motivo: 'deje', cobradoAntes: true },
        { piedras: 1, motivo: 'punto' },
      ]);
    default:
      throw new Error(`Resultado imposible en punto: ${r.tipo}`);
  }
}

/** Líneas del recuento en orden: grande, chica, pares, juego o punto. */
export function calcularRecuento(ctx: ContextoRecuento): LineaRecuento[] {
  return [
    recuentoGrandeChica(ctx, 'grande'),
    recuentoGrandeChica(ctx, 'chica'),
    recuentoJugada(ctx, 'pares'),
    ctx.hayJuego ? recuentoJugada(ctx, 'juego') : recuentoPunto(ctx),
  ];
}
