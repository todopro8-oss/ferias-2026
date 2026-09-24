// Elección del descarte (sección 6.4): se prueban los 15 subconjuntos de cartas que se
// pueden conservar (descartando al menos una) y, para cada uno, N reposiciones simuladas.

import { randInt, type Rng } from '../core/rng';
import { barajaCompleta, rango, type Carta } from '../mus/cards';
import { sumaJuego } from '../mus/evaluate';
import { PESOS_POR_DEFECTO, tablas, valorEsperado, type PesosValor } from './handValue';
import { DIFICULTADES, type PerfilIA } from './personalities';
import type { VistaJugador } from './view';

/** Cartas que podrían llegarme en la reposición: ni las mías ni (si no se ha rebarajado) mis descartes. */
export function cartasDesconocidas(vista: VistaJugador): Carta[] {
  const fuera = new Set<Carta>(vista.cartas);
  if (!vista.rebarajado) for (const c of vista.misDescartes) fuera.add(c);
  return barajaCompleta().filter((c) => !fuera.has(c));
}

export function pesosDeEstilo(perfil: PerfilIA): PesosValor {
  switch (perfil.estilo) {
    case 'ordaguero':
      return { ...PESOS_POR_DEFECTO, grande: 2.1 };
    case 'prudente':
    case 'racana':
      return { ...PESOS_POR_DEFECTO, juego: 1.3, pares: 1.1 };
    case 'teatral':
    case 'farolera':
      return { ...PESOS_POR_DEFECTO, pares: 1.15 };
    default:
      return PESOS_POR_DEFECTO;
  }
}

export interface OpcionDescarte {
  conservar: Carta[];
  descartar: Carta[];
  valor: number;
}

export function evaluarDescartes(vista: VistaJugador, perfil: PerfilIA, rng: Rng): OpcionDescarte[] {
  const t = tablas(vista.config.reyes);
  const mano = vista.cartas;
  const pool = cartasDesconocidas(vista);
  const sims = DIFICULTADES[perfil.dificultad].simsDescarte;
  const pesos = pesosDeEstilo(perfil);
  const reyes = vista.config.reyes;
  const opciones: OpcionDescarte[] = [];
  const nueva: Carta[] = [0, 0, 0, 0];
  const bolsa = pool.slice();

  for (let mask = 0; mask < 16; mask++) {
    const conservar = mano.filter((_, i) => mask & (1 << i));
    if (conservar.length === 4) continue;
    const descartar = mano.filter((_, i) => !(mask & (1 << i)));
    const faltan = 4 - conservar.length;
    let suma = 0;
    for (let s = 0; s < sims; s++) {
      for (let i = 0; i < conservar.length; i++) nueva[i] = conservar[i];
      // Robo sin reemplazo con un Fisher-Yates parcial sobre la bolsa.
      for (let k = 0; k < faltan; k++) {
        const j = k + randInt(rng, bolsa.length - k);
        const tmp = bolsa[k];
        bolsa[k] = bolsa[j];
        bolsa[j] = tmp;
        nueva[conservar.length + k] = bolsa[k];
      }
      suma += valorEsperado(t, nueva, pesos);
      if (perfil.estilo === 'prudente' || perfil.estilo === 'racana') {
        if (sumaJuego(nueva, reyes) === 31) suma += 0.4;
      }
    }
    let valor = suma / sims;
    // El órdaguero guarda los reyes aunque no toque.
    if (perfil.estilo === 'ordaguero') {
      valor += conservar.filter((c) => rango(c, reyes) === 12).length * 0.12 * (0.5 + perfil.personalidad.ord);
    }
    opciones.push({ conservar, descartar, valor });
  }
  return opciones.sort((a, b) => b.valor - a.valor);
}

export function elegirDescarte(vista: VistaJugador, perfil: PerfilIA, rng: Rng): Carta[] {
  return evaluarDescartes(vista, perfil, rng)[0].descartar;
}
