import type { Accion, Decision } from '../mus/types';
import type { VistaJugador } from './view';

/** Cualquier cosa capaz de decidir en la mesa a partir de su vista filtrada. */
export interface JugadorIA {
  readonly nombre: string;
  decidir(vista: VistaJugador, decision: Decision): Accion;
}
