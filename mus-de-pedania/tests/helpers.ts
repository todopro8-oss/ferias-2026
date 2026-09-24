import { mulberry32 } from '../src/core/rng';
import { deCorta, type Carta } from '../src/mus/cards';
import { crearConfig, type MusConfig, type Seat } from '../src/mus/config';
import { ManoMus } from '../src/mus/handState';
import type { Accion } from '../src/mus/types';

export function cartas(texto: string): Carta[] {
  return texto.trim().split(/\s+/).map(deCorta);
}

/** Crea una mano con las cartas fijadas. Por defecto postre = 3, así que la mano es el asiento 0. */
export function manoFija(
  manos: [string, string, string, string],
  op: { config?: Partial<MusConfig>; postre?: Seat; marcador?: [number, number]; seed?: number } = {},
): ManoMus {
  return new ManoMus({
    config: crearConfig(op.config),
    postre: op.postre ?? 3,
    marcador: op.marcador ?? [0, 0],
    rng: mulberry32(op.seed ?? 1),
    manos: manos.map(cartas),
  });
}

/** Ejecuta una secuencia de [asiento, acción] y devuelve la mano. */
export function jugar(m: ManoMus, pasos: [Seat, Accion][]): ManoMus {
  for (const [s, a] of pasos) m.actuar(s, a);
  return m;
}

export const MUS: Accion = { tipo: 'mus' };
export const NO_HAY_MUS: Accion = { tipo: 'noHayMus' };
export const PASO: Accion = { tipo: 'paso' };
export const QUIERO: Accion = { tipo: 'quiero' };
export const NO_QUIERO: Accion = { tipo: 'noQuiero' };
export const ORDAGO: Accion = { tipo: 'ordago' };
export const envido = (cantidad: number): Accion => ({ tipo: 'envido', cantidad });

/** Todos pasan en el lance actual hasta que cambia de lance o termina la mano. */
export function pasarLance(m: ManoMus): void {
  const lance = m.lance;
  let d = m.pendiente();
  while (d && d.tipo === 'apuesta' && d.lance === lance) {
    m.actuar(d.jugador, PASO);
    d = m.pendiente();
  }
}

/** Todos pasan todos los lances que queden. */
export function pasarTodo(m: ManoMus): void {
  let d = m.pendiente();
  while (d && d.tipo === 'apuesta') {
    m.actuar(d.jugador, PASO);
    d = m.pendiente();
  }
}
