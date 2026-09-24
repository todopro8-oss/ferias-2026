// Valoración heurística de una mano a partir de tablas de percentiles precalculadas
// sobre las 91.390 manos posibles de 4 cartas. Sin Monte Carlo: es lo que usa «Fácil»
// y la base del descarte y de la decisión de mus en todas las dificultades.

import type { Carta, Reyes } from '../mus/cards';
import {
  claveChica,
  claveGrande,
  claveJuego,
  clavePares,
  clavePunto,
  pares,
  sumaJuego,
  type Lance,
} from '../mus/evaluate';

const TOTAL_COMBINACIONES = 91390;

export interface TablasPercentil {
  reyes: Reyes;
  grande: Float32Array;
  chica: Float32Array;
  /** Percentil de pares entre todas las manos (sin pares = abajo del todo). */
  pares: Float32Array;
  /** Percentil de pares sólo entre manos con pares. */
  paresCond: Float32Array;
  juego: Float32Array;
  juegoCond: Float32Array;
  punto: Float32Array;
  /** Valores esperados de todas las manos, ordenados (para el percentil de la mano). */
  valoresOrdenados: Float32Array;
  /** Probabilidad a priori de que una mano cualquiera tenga pares / juego. */
  probPares: number;
  probJuego: number;
}

function percentiles(cuentas: Uint32Array, total: number): Float32Array {
  const res = new Float32Array(cuentas.length);
  let debajo = 0;
  for (let k = 0; k < cuentas.length; k++) {
    res[k] = (debajo + 0.5 * cuentas[k]) / total;
    debajo += cuentas[k];
  }
  return res;
}

/** Probabilidad de que la pareja gane un lance si mi mano está en el percentil F y la de mi compañero es
 * desconocida: P(max(F, U) > max(R1, R2)) con U, R1, R2 uniformes = F³ + (1 − F³) / 3. */
export function probEquipo(f: number): number {
  const f3 = f * f * f;
  return f3 + (1 - f3) / 3;
}

const cache = new Map<Reyes, TablasPercentil>();

export function tablas(reyes: Reyes): TablasPercentil {
  const hecho = cache.get(reyes);
  if (hecho) return hecho;

  const cG = new Uint32Array(28561);
  const cC = new Uint32Array(28561);
  const cP = new Uint32Array(31213);
  const cJ = new Uint32Array(11);
  const cPt = new Uint32Array(41);
  const mano = [0, 0, 0, 0];
  for (let a = 0; a < 40; a++)
    for (let b = a + 1; b < 40; b++)
      for (let c = b + 1; c < 40; c++)
        for (let d = c + 1; d < 40; d++) {
          mano[0] = a;
          mano[1] = b;
          mano[2] = c;
          mano[3] = d;
          cG[claveGrande(mano, reyes)]++;
          cC[claveChica(mano, reyes)]++;
          cP[clavePares(mano, reyes)]++;
          cJ[claveJuego(mano, reyes)]++;
          cPt[clavePunto(mano, reyes)]++;
        }
  const conPares = TOTAL_COMBINACIONES - cP[0];
  const conJuego = TOTAL_COMBINACIONES - cJ[0];
  const cPcond = cP.slice();
  cPcond[0] = 0;
  const cJcond = cJ.slice();
  cJcond[0] = 0;

  const t: TablasPercentil = {
    reyes,
    grande: percentiles(cG, TOTAL_COMBINACIONES),
    chica: percentiles(cC, TOTAL_COMBINACIONES),
    pares: percentiles(cP, TOTAL_COMBINACIONES),
    paresCond: percentiles(cPcond, conPares),
    juego: percentiles(cJ, TOTAL_COMBINACIONES),
    juegoCond: percentiles(cJcond, conJuego),
    punto: percentiles(cPt, TOTAL_COMBINACIONES),
    valoresOrdenados: new Float32Array(0),
    probPares: conPares / TOTAL_COMBINACIONES,
    probJuego: conJuego / TOTAL_COMBINACIONES,
  };

  // Distribución del valor esperado de todas las manos.
  const valores = new Float32Array(TOTAL_COMBINACIONES);
  let i = 0;
  for (let a = 0; a < 40; a++)
    for (let b = a + 1; b < 40; b++)
      for (let c = b + 1; c < 40; c++)
        for (let d = c + 1; d < 40; d++) {
          mano[0] = a;
          mano[1] = b;
          mano[2] = c;
          mano[3] = d;
          valores[i++] = valorEsperadoCon(t, mano);
        }
  valores.sort();
  t.valoresOrdenados = valores;
  cache.set(reyes, t);
  return t;
}

export interface FuerzaMano {
  /** Percentiles de la mano en cada lance. */
  grande: number;
  chica: number;
  pares: number;
  juego: number;
  punto: number;
  /** Datos crudos útiles para las reglas fijas. */
  tipoPares: number;
  altaPares: number;
  suma: number;
}

export function fuerza(t: TablasPercentil, mano: readonly Carta[]): FuerzaMano {
  const r = t.reyes;
  const p = pares(mano, r);
  const suma = sumaJuego(mano, r);
  return {
    grande: t.grande[claveGrande(mano, r)],
    chica: t.chica[claveChica(mano, r)],
    pares: t.pares[p.clave],
    juego: t.juego[claveJuego(mano, r)],
    punto: t.punto[clavePunto(mano, r)],
    tipoPares: p.tipo,
    altaPares: p.alta,
    suma,
  };
}

/** Pesos de cada lance en el valor esperado (piedras) de una mano. */
export interface PesosValor {
  grande: number;
  chica: number;
  pares: number;
  juego: number;
  punto: number;
}

export const PESOS_POR_DEFECTO: PesosValor = { grande: 1.6, chica: 1.2, pares: 1, juego: 1, punto: 0.6 };

function valorEsperadoCon(t: TablasPercentil, mano: readonly Carta[], w: PesosValor = PESOS_POR_DEFECTO): number {
  const f = fuerza(t, mano);
  let e = probEquipo(f.grande) * w.grande + probEquipo(f.chica) * w.chica;
  if (f.tipoPares > 0) e += probEquipo(f.pares) * (f.tipoPares + 1.5) * w.pares;
  else e += 0.15 * w.pares;
  if (f.suma >= 31) e += probEquipo(f.juego) * ((f.suma === 31 ? 3 : 2) + 1.8) * w.juego;
  else e += (0.2 + probEquipo(f.punto) * 0.6) * w.punto;
  return e;
}

/** Piedras esperadas que aporta la mano (heurística, sin información de la mesa). */
export function valorEsperado(t: TablasPercentil, mano: readonly Carta[], w?: PesosValor): number {
  return valorEsperadoCon(t, mano, w);
}

/** Percentil (0..1) del valor esperado de la mano entre todas las manos posibles. */
export function percentilMano(t: TablasPercentil, valor: number): number {
  const v = t.valoresOrdenados;
  let lo = 0;
  let hi = v.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (v[mid] < valor) lo = mid + 1;
    else hi = mid;
  }
  return lo / v.length;
}

/** Percentil de una mano en un lance (en pares y juego, entre las manos que tienen jugada). */
export function percentilEnLance(t: TablasPercentil, lance: Lance, m: readonly Carta[]): number {
  const r = t.reyes;
  switch (lance) {
    case 'grande':
      return t.grande[claveGrande(m, r)];
    case 'chica':
      return t.chica[claveChica(m, r)];
    case 'pares':
      return t.paresCond[clavePares(m, r)] ?? 0;
    case 'juego':
      return t.juegoCond[claveJuego(m, r)] ?? 0;
    case 'punto':
      return t.punto[clavePunto(m, r)];
  }
}
