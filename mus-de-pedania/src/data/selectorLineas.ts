// Elige la línea que dice un personaje para un evento: nunca repite ninguna de sus 2
// últimas líneas, y rellena {n}/{N} con la cantidad en letra.

import type { Rng } from '../core/rng';
import { cantidadEnLetra, mayuscula } from './narrador.es';

export class SelectorLineas {
  private recientes = new Map<string, string[]>();

  constructor(private readonly rng: Rng) {}

  elegir(quien: string, opciones: readonly string[], cantidad?: number): string {
    if (opciones.length === 0) return '';
    const ultimas = this.recientes.get(quien) ?? [];
    const validas = opciones.filter((o) => !ultimas.includes(o));
    const lista = validas.length > 0 ? validas : opciones;
    const elegida = lista[Math.floor(this.rng() * lista.length)];
    this.recientes.set(quien, [...ultimas, elegida].slice(-2));
    return rellenar(elegida, cantidad);
  }
}

export function rellenar(linea: string, cantidad?: number): string {
  if (cantidad === undefined) return linea.replaceAll('{n}', '').replaceAll('{N}', '');
  const n = cantidadEnLetra(cantidad);
  return linea.replaceAll('{n}', n).replaceAll('{N}', mayuscula(n));
}
