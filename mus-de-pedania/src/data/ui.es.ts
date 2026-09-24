// Diccionario de la interfaz (preparado para otros idiomas: todas las cadenas visibles
// que no son voces de personaje están aquí).

import type { Lance } from '../mus/evaluate';

export const UI = {
  titulo: 'MUS DE PEDANÍA',
  bar: 'BAR EL ENVITE',
  pueblo: 'Villaenvite',
  campeonato: 'I Campeonato Comarcal de Mus',
  botones: {
    mus: 'MUS',
    noHayMus: 'NO HAY MUS',
    descartar: 'DESCARTAR',
    paso: 'PASO',
    envido: 'ENVIDO',
    envidoMas: 'MÁS',
    quiero: 'QUIERO',
    noQuiero: 'NO QUIERO',
    ordago: 'ÓRDAGO',
    continuar: 'CONTINUAR',
    senas: 'SEÑAS',
    cancelar: 'CANCELAR',
  },
  lances: { grande: 'GRANDE', chica: 'CHICA', pares: 'PARES', juego: 'JUEGO', punto: 'PUNTO' } satisfies Record<
    Lance,
    string
  >,
  estado: {
    paso: 'paso',
    querido: (n: number) => `q. ${n}`,
    deje: (n: number) => `+${n}`,
    envite: (n: number) => `env ${n}`,
    ordago: 'ÓRD.',
    solo: 'sólo',
    nadie: '—',
    actual: '◂',
  },
  marcador: { nosotros: 'NOSOTROS', ellos: 'ELLOS' },
  tu: 'Tú',
  ayuda: {
    mus: 'M: mus · N: no hay mus',
    descarte: 'Elige de 1 a 4 cartas (1-4) y D',
    apertura: 'P: paso · E: envido · O: órdago · ←→',
    respuesta: 'Q: quiero · X: no quiero · +: más',
    continuar: 'Espacio o clic para seguir',
    esperando: 'Esperando…',
  },
  recuento: {
    titulo: 'RECUENTO',
    seguir: 'Clic para seguir',
  },
  finJuego: {
    ganamos: '¡JUEGO PARA NOSOTROS!',
    perdemos: 'JUEGO PARA ELLOS',
    partidaGanada: '¡PARTIDA GANADA!',
    partidaPerdida: 'PARTIDA PERDIDA',
  },
  historial: { titulo: 'LO QUE SE HA DICHO', vacio: '(nada todavía)' },
};

/** Lo que dice el humano (asiento sur) en su bocadillo. */
export const LINEAS_HUMANO: Record<string, string[]> = {
  mus: ['Mus.', 'Mus, a ver si mejora.', 'Mus.'],
  noHayMus: ['No hay mus.', 'Aquí no se toca nada.', 'No hay mus.'],
  descarte: ['{N}.', 'Me descarto de {n}.', '{N}, por favor.'],
  paso: ['Paso.', 'Paso.', 'Paso, de momento.'],
  envido: ['Envido.', 'Envido {n}.', 'Envido {n}.'],
  envidoMas: ['{N} más.', '{N} más.', 'Subo {n}.'],
  quiero: ['Quiero.', 'Quiero.', 'Lo quiero.'],
  noQuiero: ['No quiero.', 'No quiero.', 'No, gracias.'],
  ordago: ['¡Órdago!', '¡Órdago!', '¡Órdago, y a ver qué pasa!'],
  quieroOrdago: ['¡Quiero!', '¡Lo quiero!', '¡Quiero el órdago!'],
  paresSi: ['Pares sí.'],
  paresNo: ['Pares no.'],
  juegoSi: ['Juego sí.'],
  juegoNo: ['Juego no.'],
  adentro: ['¡Adentro!'],
};
