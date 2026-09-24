// Mano guiada: una mano con las cartas fijadas y pistas para cada decisión.

import type { Juego } from '../core/juego';
import { PISTAS_TUTORIAL as T, MANOS_TUTORIAL } from '../data/reglas.es';
import { deCorta } from '../mus/cards';
import type { Decision } from '../mus/types';
import type { Flujo } from './flujo';
import { Mesa } from './Table';

function pista(d: Decision | null, mesa: Mesa): string | null {
  if (!d) return mesa.estado === 'continuar' ? T.fin : T.espera;
  if (d.tipo === 'mus') return T.mus;
  if (d.tipo === 'descarte') return T.descarte;
  const abrir = d.opciones.includes('paso');
  switch (d.lance) {
    case 'grande':
      return abrir ? T.grandeAbrir : T.grandeResponder;
    case 'chica':
      return abrir ? T.chicaAbrir : T.chicaResponder;
    case 'pares':
      return abrir ? T.paresAbrir : T.paresResponder;
    case 'juego':
      return abrir ? T.juegoAbrir : T.juegoResponder;
    case 'punto':
      return T.puntoAbrir;
  }
}

export function crearMesaTutorial(juego: Juego, flujo: Flujo): Mesa {
  const manos = MANOS_TUTORIAL.map((m) => m.split(' ').map(deCorta));
  return new Mesa(juego, {
    companero: 'anselmo',
    rivales: ['julian', 'marisa'],
    semilla: 1996,
    titulo: 'Mano guiada',
    tutorial: {
      manos,
      postre: 3,
      pista,
      alSalir: () => flujo.comoSeJuega(),
    },
    alPausar: () => flujo.comoSeJuega(),
  });
}
