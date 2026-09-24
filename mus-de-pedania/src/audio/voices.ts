// Voces: `playLine(personaje, evento)` → audio grabado si existe
// (assets/voices/<personaje>/<evento>_<n>.ogg, listado en el manifiesto) o, si no, balbuceo.

import { NICANOR, PERSONAJES, type IdPersonaje } from '../data/characters';
import type { VozBalbuceo } from './babble';

const VOZ_HUMANO: VozBalbuceo = { tono: 135, velocidad: 5.6, formantes: 1, melodia: 0.4, aspereza: 0.1, nasal: 0.1 };
const VOZ_CAMEO: VozBalbuceo = { tono: 170, velocidad: 6, formantes: 1.05, melodia: 0.5, aspereza: 0.05, nasal: 0.2 };

export function vozDe(quien: string): VozBalbuceo {
  if (quien === 'humano') return VOZ_HUMANO;
  if (quien === 'nicanor') return NICANOR.voz;
  const p = PERSONAJES[quien as IdPersonaje];
  return p ? p.voz : VOZ_CAMEO;
}

/** Ruta del archivo grabado para una línea (índice 0 → «_1»). */
export function rutaVoz(quien: string, evento: string, indice: number): string {
  return `voices/${quien}/${evento}_${indice + 1}.ogg`;
}
