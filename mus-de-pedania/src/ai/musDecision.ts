// ¿Mus o no hay mus? (sección 6.3)

import type { Rng } from '../core/rng';
import { companero, equipoDe, rival } from '../mus/config';
import { fuerza, percentilMano, probEquipo, tablas, valorEsperado } from './handValue';
import { DIFICULTADES, type PerfilIA } from './personalities';
import type { VistaJugador } from './view';

export interface MotivoMus {
  mus: boolean;
  percentil: number;
  umbral: number;
  motivo: string;
}

export function decidirMus(vista: VistaJugador, perfil: PerfilIA, rng: Rng): MotivoMus {
  const t = tablas(vista.config.reyes);
  const cartas = vista.cartas;
  const f = fuerza(t, cartas);
  // Valor de mus en 0..1: percentil de la mano entre todas las posibles, curvado para que el umbral
  // de la tabla de personajes (0.45 – 0.75) deje un 20-40 % de manos con mus para los cuatro.
  const pct = Math.pow(percentilMano(t, valorEsperado(t, cartas)), 1.5);

  // Reglas fijas del perfil normal: cortar siempre con 31 y otra baza, duples, o medias de reyes.
  const otraBaza = probEquipo(f.grande) > 0.6 || probEquipo(f.chica) > 0.6 || f.tipoPares > 0;
  if (f.suma === 31 && otraBaza) return { mus: false, percentil: pct, umbral: 0, motivo: '31 y otra baza' };
  if (f.tipoPares === 3) return { mus: false, percentil: pct, umbral: 0, motivo: 'duples' };
  if (f.tipoPares === 2 && f.altaPares === 12)
    return { mus: false, percentil: pct, umbral: 0, motivo: 'medias de reyes' };

  const dif = DIFICULTADES[perfil.dificultad];
  let umbral = perfil.personalidad.cor;
  // Posición: la mano gana los empates y corta con menos; el postre necesita más.
  if (vista.yo === vista.mano) umbral -= 0.05;
  if (vista.yo === vista.postre) umbral += 0.03;
  // Marcador: si el rival está cerca de ganar, se corta antes.
  if (dif.miraMarcador) {
    const meta = vista.config.puntosJuego;
    if (vista.marcador[rival(equipoDe(vista.yo))] >= meta - 5) umbral -= 0.12;
    else if (vista.marcador[equipoDe(vista.yo)] >= meta - 5) umbral -= 0.05;
  }
  // Señas del compañero: si enseña jugada, la pareja ya tiene algo y conviene cortar.
  const comp = companero(vista.yo);
  const senasComp = vista.senas.filter((s) => s.de === comp && s.significado !== 'ciego');
  if (senasComp.length > 0) umbral -= 0.08 * Math.min(2, senasComp.length);
  if (vista.senas.some((s) => s.de === comp && s.significado === 'ciego')) umbral += 0.05;
  // Tras varias rondas de mus la gente se cansa y corta con menos.
  umbral -= 0.03 * Math.min(4, vista.rondaMus);
  umbral += (rng() - 0.5) * 0.06;

  const mus = pct <= umbral;
  return { mus, percentil: pct, umbral, motivo: mus ? 'mano floja' : 'mano servida' };
}
