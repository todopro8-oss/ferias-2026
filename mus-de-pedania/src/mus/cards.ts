// Baraja española de 40 cartas representada como enteros 0..39: `palo * 10 + índice`,
// con índice 0..9 ↔ números 1, 2, 3, 4, 5, 6, 7, sota (10), caballo (11), rey (12).

import { barajarEnSitio, type Rng } from '../core/rng';

export type Carta = number;
export type Palo = 0 | 1 | 2 | 3;
export type Reyes = 8 | 4;

export const PALOS = ['oros', 'copas', 'espadas', 'bastos'] as const;
export type NombrePalo = (typeof PALOS)[number];
export const NUMEROS = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12] as const;
export const TOTAL_CARTAS = 40;

export function palo(c: Carta): Palo {
  return Math.floor(c / 10) as Palo;
}

export function numero(c: Carta): number {
  return NUMEROS[c % 10];
}

export function carta(p: Palo | NombrePalo, n: number): Carta {
  const ip = typeof p === 'number' ? p : PALOS.indexOf(p);
  const k = NUMEROS.indexOf(n as (typeof NUMEROS)[number]);
  if (ip < 0 || k < 0) throw new Error(`Carta inexistente: ${n} de ${p}`);
  return ip * 10 + k;
}

// Tablas precalculadas: el Monte Carlo evalúa millones de manos.
const RANGO_8 = new Int8Array(TOTAL_CARTAS);
const RANGO_4 = new Int8Array(TOTAL_CARTAS);
const VALOR_8 = new Int8Array(TOTAL_CARTAS);
const VALOR_4 = new Int8Array(TOTAL_CARTAS);
for (let c = 0; c < TOTAL_CARTAS; c++) {
  const n = numero(c);
  RANGO_4[c] = n;
  RANGO_8[c] = n === 3 ? 12 : n === 2 ? 1 : n;
  VALOR_4[c] = RANGO_4[c] >= 10 ? 10 : RANGO_4[c];
  VALOR_8[c] = RANGO_8[c] >= 10 ? 10 : RANGO_8[c];
}

/** Rango efectivo: con 8 reyes el 3 cuenta como rey y el 2 como as. */
export function rango(c: Carta, reyes: Reyes): number {
  return reyes === 8 ? RANGO_8[c] : RANGO_4[c];
}

/** Valor para el juego: figuras 10, as 1, resto su número (con 8 reyes el 3 vale 10 y el 2 vale 1). */
export function valorJuego(c: Carta, reyes: Reyes): number {
  return reyes === 8 ? VALOR_8[c] : VALOR_4[c];
}

export function tablaRangos(reyes: Reyes): Int8Array {
  return reyes === 8 ? RANGO_8 : RANGO_4;
}

export function tablaValores(reyes: Reyes): Int8Array {
  return reyes === 8 ? VALOR_8 : VALOR_4;
}

export function barajaCompleta(): Carta[] {
  return Array.from({ length: TOTAL_CARTAS }, (_, i) => i);
}

export function barajar(cartas: readonly Carta[], rng: Rng): Carta[] {
  return barajarEnSitio([...cartas], rng);
}

const NOMBRE_NUMERO: Record<number, string> = {
  1: 'as',
  2: 'dos',
  3: 'tres',
  4: 'cuatro',
  5: 'cinco',
  6: 'seis',
  7: 'siete',
  10: 'sota',
  11: 'caballo',
  12: 'rey',
};

/** «rey de oros», «tres de copas»… */
export function nombreCarta(c: Carta): string {
  return `${NOMBRE_NUMERO[numero(c)]} de ${PALOS[palo(c)]}`;
}

const LETRA_NUMERO: Record<number, string> = { 1: 'A', 10: 'S', 11: 'C', 12: 'R' };
const LETRA_PALO = ['o', 'c', 'e', 'b'];

/** Forma corta para registros: «Ro» (rey de oros), «7c», «Se» (sota de espadas), «Ab». */
export function cartaCorta(c: Carta): string {
  const n = numero(c);
  return `${LETRA_NUMERO[n] ?? String(n)}${LETRA_PALO[palo(c)]}`;
}

/** Inversa de `cartaCorta`, útil en tests: «Ro», «3c», «Ae». */
export function deCorta(texto: string): Carta {
  const t = texto.trim();
  const p = LETRA_PALO.indexOf(t.slice(-1).toLowerCase());
  const cuerpo = t.slice(0, -1).toUpperCase();
  const inv: Record<string, number> = { A: 1, S: 10, C: 11, R: 12 };
  const n = inv[cuerpo] ?? Number(cuerpo);
  if (p < 0 || !Number.isFinite(n)) throw new Error(`Carta corta no válida: ${texto}`);
  return carta(p as Palo, n);
}

export function manoCorta(cartas: readonly Carta[]): string {
  return cartas.map(cartaCorta).join(' ');
}
