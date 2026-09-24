// Estimación de la probabilidad de ganar cada lance. Dos implementaciones:
// la heurística (tablas de percentiles, «Fácil») y el Monte Carlo (`montecarlo.ts`).

import { companero, equipoDe, rival, miembros, type Seat } from '../mus/config';
import type { Lance } from '../mus/evaluate';
import { fuerza, probEquipo, tablas } from './handValue';
import type { VistaJugador } from './view';

export interface Estimacion {
  /** P(que mi pareja gane cada lance), dado lo que se sabe. */
  p: Record<Lance, number>;
  /** Piedras esperadas de la mano para mi pareja (aprox.). */
  piedras: number;
  /** true si `p` ya tiene en cuenta lo que han apostado los demás en el lance. */
  condicionada?: boolean;
}

export interface Estimador {
  estimar(vista: VistaJugador): Estimacion;
}

/** Ajustes por señas vistas: una seña de mi compañero sube mi confianza en ese lance. */
export function ajustePorSenas(vista: VistaJugador, lance: Lance): number {
  const comp = companero(vista.yo);
  let ajuste = 0;
  for (const s of vista.senas) {
    const mia = s.de === comp;
    const deRival = equipoDe(s.de) !== equipoDe(vista.yo);
    if (!mia && !deRival) continue;
    const signo = mia ? 1 : -1;
    switch (s.significado) {
      case 'reyes':
      case 'tresReyes':
        if (lance === 'grande') ajuste += signo * 0.2;
        break;
      case 'ases':
        if (lance === 'chica') ajuste += signo * 0.2;
        break;
      case 'medias':
        if (lance === 'pares') ajuste += signo * 0.15;
        break;
      case 'duples':
        if (lance === 'pares') ajuste += signo * 0.25;
        break;
      case 'treintayuna':
        if (lance === 'juego' || lance === 'punto') ajuste += signo * 0.25;
        break;
      case 'ciego':
        ajuste -= signo * 0.08;
        break;
    }
  }
  return ajuste;
}

function recortar(p: number): number {
  return Math.min(0.99, Math.max(0.01, p));
}

/** Estimación sin simulación, sólo con percentiles, declaraciones y señas. */
export class EstimadorHeuristico implements Estimador {
  estimar(vista: VistaJugador): Estimacion {
    const t = tablas(vista.config.reyes);
    const f = fuerza(t, vista.cartas);
    const yo = vista.yo;
    const comp = companero(yo);
    const eqRival = rival(equipoDe(yo));

    const conJugada = (decl: boolean[] | null, pct: number, pctCond: number, tengo: boolean): number => {
      if (!decl) return tengo ? probEquipo(pct) : 0.3;
      const rivalesCon = miembros(eqRival).filter((s) => decl[s]).length;
      const compTiene = decl[comp];
      if (rivalesCon === 0) return tengo || compTiene ? 1 : 0;
      if (!tengo && !compTiene) return 0;
      const pYo = tengo ? Math.pow(pctCond, rivalesCon) : 0;
      const pComp = compTiene ? 1 / (rivalesCon + 1) : 0;
      return 1 - (1 - pYo) * (1 - pComp);
    };

    const pG = recortar(probEquipo(f.grande) + ajustePorSenas(vista, 'grande'));
    const pC = recortar(probEquipo(f.chica) + ajustePorSenas(vista, 'chica'));
    const pP = recortar(
      conJugada(vista.declaraciones.pares, f.pares, t.paresCond[paresClave(f)], f.tipoPares > 0) +
        ajustePorSenas(vista, 'pares'),
    );
    const pJ = recortar(
      conJugada(vista.declaraciones.juego, f.juego, juegoCondPct(t.juegoCond, f.suma), f.suma >= 31) +
        ajustePorSenas(vista, 'juego'),
    );
    const pPt = recortar(probEquipo(f.punto) + ajustePorSenas(vista, 'punto'));

    const piedras =
      pG * 1.5 + pC * 1.2 + pP * (f.tipoPares + 1) + (f.suma >= 31 ? pJ * ((f.suma === 31 ? 3 : 2) + 1) : pPt * 0.8);
    return { p: { grande: pG, chica: pC, pares: pP, juego: pJ, punto: pPt }, piedras };
  }
}

function paresClave(f: { tipoPares: number; altaPares: number }): number {
  // Reconstruye una clave aproximada (sin la pareja baja) para el percentil condicionado.
  return f.tipoPares === 0 ? 0 : f.tipoPares * 10000 + f.altaPares * 100;
}

function juegoCondPct(tabla: Float32Array, suma: number): number {
  if (suma < 31) return 0;
  const k = suma === 31 ? 10 : suma === 32 ? 9 : suma - 32;
  return tabla[k];
}

/** Asientos de la pareja rival. */
export function rivalesDe(yo: Seat): [Seat, Seat] {
  return miembros(rival(equipoDe(yo)));
}
