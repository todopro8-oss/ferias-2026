import type { Rng } from '../core/rng';
import type { Seat } from '../mus/config';
import { JugadorAleatorio } from './aleatoria';
import type { JugadorIA } from './jugador';

/** Jugador IA por defecto para el simulador. (H1: aleatorio; la IA heurística llega en H2.) */
export function crearJugadorPorDefecto(_asiento: Seat, rng: Rng): JugadorIA {
  return new JugadorAleatorio(rng);
}
