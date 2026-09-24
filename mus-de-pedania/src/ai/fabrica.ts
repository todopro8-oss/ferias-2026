import type { Rng } from '../core/rng';
import type { Seat } from '../mus/config';
import { EstimadorHeuristico, type Estimador } from './estimacion';
import { JugadorMus } from './jugadorMus';
import { PERSONALIDAD_NEUTRA, type Dificultad, type PerfilIA, type Personalidad } from './personalities';

export function crearEstimador(_dificultad: Dificultad): Estimador {
  return new EstimadorHeuristico();
}

export function crearJugador(perfil: PerfilIA, rng: Rng): JugadorMus {
  return new JugadorMus(perfil, rng, crearEstimador(perfil.dificultad));
}

/** Jugador neutro para el simulador. */
export function crearJugadorPorDefecto(
  asiento: Seat,
  rng: Rng,
  dificultad: Dificultad = 'normal',
  personalidad: Personalidad = PERSONALIDAD_NEUTRA,
): JugadorMus {
  return crearJugador({ personalidad, dificultad, nombre: `IA${asiento}` }, rng);
}
