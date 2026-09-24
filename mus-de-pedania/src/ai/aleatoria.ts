// Jugador aleatorio (sólo acciones legales). Sirve para estresar el motor en el
// simulador y en el test de propiedad: explora combinaciones que una IA sensata no haría.

import { randInt, randRango, type Rng } from '../core/rng';
import type { Accion, Decision } from '../mus/types';
import type { JugadorIA } from './jugador';
import type { VistaJugador } from './view';

export class JugadorAleatorio implements JugadorIA {
  readonly nombre = 'aleatorio';
  constructor(private readonly rng: Rng) {}

  decidir(vista: VistaJugador, d: Decision): Accion {
    const r = this.rng();
    switch (d.tipo) {
      case 'mus':
        return r < 0.6 ? { tipo: 'mus' } : { tipo: 'noHayMus' };
      case 'descarte': {
        const n = randRango(this.rng, 1, 4);
        const cartas = [...vista.cartas];
        for (let i = cartas.length - 1; i > 0; i--) {
          const j = randInt(this.rng, i + 1);
          [cartas[i], cartas[j]] = [cartas[j], cartas[i]];
        }
        return { tipo: 'descarte', cartas: cartas.slice(0, n) };
      }
      case 'apuesta': {
        const op = d.opciones;
        if (op.includes('paso')) {
          if (r < 0.6) return { tipo: 'paso' };
          if (r < 0.95) return { tipo: 'envido', cantidad: randRango(this.rng, 2, 6) };
          return { tipo: 'ordago' };
        }
        if (r < 0.4) return { tipo: 'quiero' };
        if (r < 0.85 || !op.includes('envido')) return { tipo: 'noQuiero' };
        if (r < 0.97) return { tipo: 'envido', cantidad: randRango(this.rng, 2, 10) };
        return { tipo: 'ordago' };
      }
    }
  }
}
