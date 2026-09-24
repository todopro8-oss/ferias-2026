// Evaluación de manos para cada lance. Todas las «claves» siguen el convenio
// «más alta = mejor», así que comparar dos manos es restar claves.

import { tablaRangos, tablaValores, type Carta, type Reyes } from './cards';
import { ordenDesde, type Seat } from './config';

export type Lance = 'grande' | 'chica' | 'pares' | 'juego' | 'punto';
export const LANCES: readonly Lance[] = ['grande', 'chica', 'pares', 'juego', 'punto'];

/** 0 = nada, 1 = pareja, 2 = medias, 3 = duples. */
export type TipoPares = 0 | 1 | 2 | 3;

export interface InfoPares {
  tipo: TipoPares;
  /** Rango de la pareja alta (o de la pareja / medias). 0 si no hay. */
  alta: number;
  /** Rango de la pareja baja en duples; 0 en el resto. */
  baja: number;
  /** Clave comparable: más alta = mejor. 0 si no hay pares. */
  clave: number;
}

/** Rangos efectivos ordenados de mayor a menor. */
export function rangosDesc(mano: readonly Carta[], reyes: Reyes): number[] {
  const t = tablaRangos(reyes);
  return mano.map((c) => t[c]).sort((a, b) => b - a);
}

function ordenar4Desc(mano: readonly Carta[], t: Int8Array): [number, number, number, number] {
  let a = t[mano[0]];
  let b = t[mano[1]];
  let c = t[mano[2]];
  let d = t[mano[3]];
  let x: number;
  // Red de ordenación de 4 elementos (5 comparaciones).
  if (a < b) {
    x = a;
    a = b;
    b = x;
  }
  if (c < d) {
    x = c;
    c = d;
    d = x;
  }
  if (a < c) {
    x = a;
    a = c;
    c = x;
  }
  if (b < d) {
    x = b;
    b = d;
    d = x;
  }
  if (b < c) {
    x = b;
    b = c;
    c = x;
  }
  return [a, b, c, d];
}

/** Grande: compara lexicográficamente los rangos de mayor a menor. */
export function claveGrande(mano: readonly Carta[], reyes: Reyes): number {
  const [a, b, c, d] = ordenar4Desc(mano, tablaRangos(reyes));
  return ((a * 13 + b) * 13 + c) * 13 + d;
}

/** Chica: compara de menor a mayor y gana el menor. Se invierte para que «más alta = mejor». */
export function claveChica(mano: readonly Carta[], reyes: Reyes): number {
  const [a, b, c, d] = ordenar4Desc(mano, tablaRangos(reyes));
  return ((13 - d) * 13 + (13 - c)) * 13 * 13 + (13 - b) * 13 + (13 - a);
}

export function pares(mano: readonly Carta[], reyes: Reyes): InfoPares {
  const [a, b, c, d] = ordenar4Desc(mano, tablaRangos(reyes));
  let tipo: TipoPares = 0;
  let alta = 0;
  let baja = 0;
  if (a === b && c === d) {
    // Duples: dos parejas o cuatro iguales (pareja alta y baja iguales).
    tipo = 3;
    alta = a;
    baja = c;
  } else if ((a === b && b === c) || (b === c && c === d)) {
    tipo = 2;
    alta = b;
  } else if (a === b) {
    tipo = 1;
    alta = a;
  } else if (b === c) {
    tipo = 1;
    alta = b;
  } else if (c === d) {
    tipo = 1;
    alta = c;
  }
  return { tipo, alta, baja, clave: tipo === 0 ? 0 : tipo * 10000 + alta * 100 + baja };
}

export function clavePares(mano: readonly Carta[], reyes: Reyes): number {
  return pares(mano, reyes).clave;
}

export function sumaJuego(mano: readonly Carta[], reyes: Reyes): number {
  const t = tablaValores(reyes);
  return t[mano[0]] + t[mano[1]] + t[mano[2]] + t[mano[3]];
}

export function tieneJuego(suma: number): boolean {
  return suma >= 31;
}

/** Orden del juego: 31 > 32 > 40 > 37 > 36 > 35 > 34 > 33 (38 y 39 no pueden salir). 0 = sin juego. */
export function claveJuegoDeSuma(suma: number): number {
  if (suma < 31) return 0;
  if (suma === 31) return 10;
  if (suma === 32) return 9;
  return suma - 32; // 33 → 1 … 37 → 5, (38 → 6, 39 → 7), 40 → 8
}

export function claveJuego(mano: readonly Carta[], reyes: Reyes): number {
  return claveJuegoDeSuma(sumaJuego(mano, reyes));
}

/** Punto: gana la suma más alta (sólo cuando nadie tiene juego). */
export function clavePunto(mano: readonly Carta[], reyes: Reyes): number {
  const s = sumaJuego(mano, reyes);
  return s >= 31 ? 0 : s;
}

/** Piedras que vale una jugada de pares: pareja 1, medias 2, duples 3. */
export function valorPares(tipo: TipoPares): number {
  return tipo;
}

/** Piedras que vale un juego: la 31 vale 3, cualquier otro 2. */
export function valorDeJuego(suma: number): number {
  return suma === 31 ? 3 : suma > 31 ? 2 : 0;
}

export function clave(lance: Lance, mano: readonly Carta[], reyes: Reyes): number {
  switch (lance) {
    case 'grande':
      return claveGrande(mano, reyes);
    case 'chica':
      return claveChica(mano, reyes);
    case 'pares':
      return clavePares(mano, reyes);
    case 'juego':
      return claveJuego(mano, reyes);
    case 'punto':
      return clavePunto(mano, reyes);
  }
}

/** ¿Tiene jugada para ese lance? Grande, chica y punto: siempre. */
export function tieneJugada(lance: Lance, mano: readonly Carta[], reyes: Reyes): boolean {
  if (lance === 'pares') return clavePares(mano, reyes) > 0;
  if (lance === 'juego') return claveJuego(mano, reyes) > 0;
  return true;
}

/**
 * Mejor jugador del lance. Empate exacto: gana el más cercano a la mano.
 * En pares y juego sólo compiten quienes tienen jugada (o los `participantes` indicados).
 * Devuelve null si nadie compite.
 */
export function ganadorLance(
  lance: Lance,
  manos: readonly (readonly Carta[])[],
  mano: Seat,
  reyes: Reyes,
  participantes?: readonly Seat[],
): Seat | null {
  let mejor: Seat | null = null;
  let mejorClave = -1;
  for (const s of ordenDesde(mano)) {
    if (participantes && !participantes.includes(s)) continue;
    if (!tieneJugada(lance, manos[s], reyes)) continue;
    const k = clave(lance, manos[s], reyes);
    if (k > mejorClave) {
      mejorClave = k;
      mejor = s;
    }
  }
  return mejor;
}

// ---------------------------------------------------------------------------
// Descripciones legibles (registro, recuento)
// ---------------------------------------------------------------------------

const NOMBRE_RANGO: Record<number, [string, string]> = {
  1: ['as', 'ases'],
  2: ['dos', 'doses'],
  3: ['tres', 'treses'],
  4: ['cuatro', 'cuatros'],
  5: ['cinco', 'cincos'],
  6: ['seis', 'seises'],
  7: ['siete', 'sietes'],
  10: ['sota', 'sotas'],
  11: ['caballo', 'caballos'],
  12: ['rey', 'reyes'],
};

export function nombreRango(r: number, plural = false): string {
  return NOMBRE_RANGO[r]?.[plural ? 1 : 0] ?? String(r);
}

export function describirPares(info: InfoPares): string {
  switch (info.tipo) {
    case 0:
      return 'sin pares';
    case 1:
      return `pareja de ${nombreRango(info.alta, true)}`;
    case 2:
      return `medias de ${nombreRango(info.alta, true)}`;
    case 3:
      return info.alta === info.baja
        ? `duples de ${nombreRango(info.alta, true)}`
        : `duples ${nombreRango(info.alta, true)}-${nombreRango(info.baja, true)}`;
  }
}
