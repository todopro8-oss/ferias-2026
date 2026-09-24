// Señas (sección 7): catálogo, qué seña corresponde a una mano, cuándo la hace la IA y
// con qué probabilidad la caza un rival. Puro: la mesa se encarga de animarlo.

import type { Rng } from '../core/rng';
import { tablaRangos, type Carta, type Reyes } from '../mus/cards';
import type { ModoSenas } from '../mus/config';
import { pares, sumaJuego } from '../mus/evaluate';
import { DIFICULTADES, type Dificultad, type Personalidad } from './personalities';
import type { SignificadoSena } from './view';

export type IdSena = 'labio' | 'lengua' | 'torcer' | 'cejas' | 'guino' | 'ciego' | 'tresReyes';

export interface DefinicionSena {
  id: IdSena;
  significado: SignificadoSena;
  /** Gesto, para el menú y el chivato. */
  gesto: string;
  /** Lo que quiere decir. */
  quiere: string;
  /** Etiqueta de animación de la cara. */
  animacion: string;
  deLaCasa: boolean;
}

export const CATALOGO: readonly DefinicionSena[] = [
  {
    id: 'labio',
    significado: 'reyes',
    gesto: 'Morderse el labio',
    quiere: 'dos reyes',
    animacion: 'sena_labio',
    deLaCasa: false,
  },
  {
    id: 'lengua',
    significado: 'ases',
    gesto: 'Sacar la lengua',
    quiere: 'dos ases',
    animacion: 'sena_lengua',
    deLaCasa: false,
  },
  {
    id: 'torcer',
    significado: 'medias',
    gesto: 'Torcer la boca',
    quiere: 'medias',
    animacion: 'sena_torcer',
    deLaCasa: false,
  },
  {
    id: 'cejas',
    significado: 'duples',
    gesto: 'Subir las cejas',
    quiere: 'duples',
    animacion: 'sena_cejas',
    deLaCasa: false,
  },
  {
    id: 'guino',
    significado: 'treintayuna',
    gesto: 'Guiñar un ojo',
    quiere: '31 (o 30)',
    animacion: 'sena_guino',
    deLaCasa: false,
  },
  {
    id: 'ciego',
    significado: 'ciego',
    gesto: 'Cerrar los ojos',
    quiere: 'ciego (nada)',
    animacion: 'sena_ciego',
    deLaCasa: true,
  },
  {
    id: 'tresReyes',
    significado: 'tresReyes',
    gesto: 'Morder el labio dos veces',
    quiere: 'tres reyes',
    animacion: 'sena_tresReyes',
    deLaCasa: true,
  },
];

export function sena(id: IdSena): DefinicionSena {
  return CATALOGO.find((s) => s.id === id)!;
}

export function catalogoActivo(senasDeLaCasa: boolean): DefinicionSena[] {
  return CATALOGO.filter((s) => senasDeLaCasa || !s.deLaCasa);
}

/** Duración de la seña en la cara: clásico 1200 ms (cantosa), discreto 350 ms. */
export function duracionSena(modo: ModoSenas): number {
  return modo === 'discreto' ? 350 : 1200;
}

/** Señas que dicen la verdad sobre una mano (con 8 reyes, «dos reyes» incluye treses y «dos ases» doses). */
export function senasVerdaderas(cartas: readonly Carta[], reyes: Reyes, senasDeLaCasa: boolean): IdSena[] {
  const t = tablaRangos(reyes);
  const reyesN = cartas.filter((c) => t[c] === 12).length;
  const asesN = cartas.filter((c) => t[c] === 1).length;
  const p = pares(cartas, reyes);
  const s = sumaJuego(cartas, reyes);
  const res: IdSena[] = [];
  if (p.tipo === 3) res.push('cejas');
  if (s === 31 || s === 30) res.push('guino');
  if (p.tipo === 2) res.push('torcer');
  if (senasDeLaCasa && reyesN >= 3) res.push('tresReyes');
  if (reyesN >= 2) res.push('labio');
  if (asesN >= 2) res.push('lengua');
  if (senasDeLaCasa && res.length === 0 && p.tipo === 0 && s < 31) res.push('ciego');
  return res;
}

/**
 * ¿Hace seña la IA? Con probabilidad `franqueza` cuando tiene jugada que enseñar;
 * enseña la más valiosa (duples > 31 > medias > tres reyes > reyes > ases).
 */
export function elegirSenaIA(
  cartas: readonly Carta[],
  reyes: Reyes,
  senasDeLaCasa: boolean,
  personalidad: Personalidad,
  rng: Rng,
): IdSena | null {
  const opciones = senasVerdaderas(cartas, reyes, senasDeLaCasa);
  if (opciones.length === 0) return null;
  if (rng() >= personalidad.fra) return null;
  return opciones[0];
}

/**
 * Probabilidad de que un rival IA cace una seña (sección 7.2):
 * vista × factor de dificultad (tope 0,95) × (clásico ? 1 : 0,45 · (1,2 − disimulo del que la hace)).
 */
export function probabilidadCaza(
  observador: Personalidad,
  dificultad: Dificultad,
  modo: ModoSenas,
  emisor?: Personalidad,
): number {
  if (modo === 'off') return 0;
  const base = Math.min(0.95, observador.vis * DIFICULTADES[dificultad].factorVista);
  if (modo === 'clasico') return base;
  const disimulo = emisor?.dis ?? 0.5;
  return Math.max(0, Math.min(0.95, base * 0.45 * (1.2 - disimulo)));
}
