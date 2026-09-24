import type { Rng } from '../core/rng';
import type { Seat } from '../mus/config';
import { derivarSemilla, mulberry32 } from '../core/rng';
import { EstimadorHeuristico, type Estimador } from './estimacion';
import { EstimadorMonteCarlo } from './montecarlo';
import { JugadorMus } from './jugadorMus';
import { DIFICULTADES, PERSONALIDAD_NEUTRA, type Dificultad, type PerfilIA, type Personalidad } from './personalities';

export function crearEstimador(dificultad: Dificultad, rng: Rng): Estimador {
  const n = DIFICULTADES[dificultad].muestrasMonteCarlo;
  return n > 0 ? new EstimadorMonteCarlo(n, rng) : new EstimadorHeuristico();
}

export function crearJugador(perfil: PerfilIA, rng: Rng): JugadorMus {
  return new JugadorMus(perfil, rng, crearEstimador(perfil.dificultad, mulberry32(derivarSemilla(rng))));
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
