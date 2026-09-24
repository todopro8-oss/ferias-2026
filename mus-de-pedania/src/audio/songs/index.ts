// Canciones originales de Mus de Pedanía (composición nueva, sin transcribir nada existente):
//  - popurri: tres secciones con aire de pasodoble (2/4), jota (3/4) y rumba (4/4), en bucle.
//  - victoria (≈5 s), derrota (≈4 s) y charanga (≈20 s).

import { jota, oomPah, repetir, rumba, type Acorde, type Cancion } from '../sequencer';

// Acordes
const Am: Acorde = { notas: 'A3,C4,E4', bajo: ['A2', 'E2'] };
const Dm: Acorde = { notas: 'A3,D4,F4', bajo: ['D2', 'A2'] };
const E7: Acorde = { notas: 'G#3,B3,D4', bajo: ['E2', 'B1'] };
const A: Acorde = { notas: 'A3,C#4,E4', bajo: ['A2', 'E2'] };
const D: Acorde = { notas: 'A3,D4,F#4', bajo: ['D2', 'A2'] };
const Dj: Acorde = { notas: 'D4,F#4,A4', bajo: ['D3', 'A2'] };
const A7j: Acorde = { notas: 'C#4,E4,G4', bajo: ['A2', 'E2'] };
const Gj: Acorde = { notas: 'B3,D4,G4', bajo: ['G2', 'D3'] };
const G: Acorde = { notas: 'G3,B3,D4', bajo: ['G2', 'D2'] };
const F: Acorde = { notas: 'F3,A3,C4', bajo: ['F2', 'C3'] };
const Er: Acorde = { notas: 'E3,G#3,B3', bajo: ['E2', 'B1'] };
const Fc: Acorde = { notas: 'A3,C4,F4', bajo: ['F2', 'C3'] };
const C7c: Acorde = { notas: 'Bb3,C4,E4', bajo: ['C3', 'G2'] };
const Bbc: Acorde = { notas: 'Bb3,D4,F4', bajo: ['Bb2', 'F2'] };

// ---------------------------------------------------------------------------
// 1. Pasodoble (2/4): en La menor y un «trío» en La mayor.
// ---------------------------------------------------------------------------

const pasodobleMelodia = [
  // La menor
  'E5:3 D5:1 C5:2 B4:2',
  'A4:4 E4:4',
  'A4:2 B4:2 C5:2 D5:2',
  'E5:6 R:2',
  'F5:3 E5:1 D5:2 C5:2',
  'B4:2 C5:1 B4:1 A4:2 G#4:2',
  'A4:2 B4:2 C5:2 D5:2',
  'E5:4 E4:4',
  'E5:3 D5:1 C5:2 B4:2',
  'A4:2 C5:2 E5:2 A5:2',
  'G#5:3 F5:1 E5:2 D5:2',
  'C5:2 B4:2 A4:2 G#4:2',
  'F5:3 E5:1 D5:2 C5:2',
  'B4:2 A4:2 G#4:2 B4:2',
  'A4:2 E4:2 A4:2 B4:2',
  'A4:6 R:2',
  // Trío en La mayor
  'C#5:3 D5:1 E5:2 C#5:2',
  'A4:4 R:2 E5:2',
  'F#5:3 E5:1 D5:2 B4:2',
  'E5:6 R:2',
  'D5:3 C#5:1 B4:2 A4:2',
  'G#4:2 A4:2 B4:2 D5:2',
  'C#5:2 B4:2 A4:2 G#4:2',
  'A4:6 R:2',
].join(' | ');

const pasodobleArmonia = [Am, Am, Dm, E7, Dm, E7, Am, E7, Am, Am, E7, Am, Dm, E7, Am, Am, A, A, D, A, D, E7, E7, A];
const pd = oomPah(pasodobleArmonia);

// ---------------------------------------------------------------------------
// 2. Jota (3/4): en Re mayor, alternando tónica y dominante.
// ---------------------------------------------------------------------------

const jotaMelodia = [
  'A4:2 D5:2 F#5:2 A5:2 F#5:2 D5:2',
  'E5:2 G5:2 E5:2 C#5:2 A4:4',
  'A4:2 C#5:2 E5:2 G5:2 F#5:2 E5:2',
  'F#5:4 D5:2 D5:6',
  'D5:2 E5:2 F#5:2 G5:2 A5:2 B5:2',
  'A5:4 G5:2 F#5:2 E5:4',
  'C#5:2 E5:2 A5:2 G5:2 E5:2 C#5:2',
  'D5:6 R:6',
  'F#5:2 F#5:2 F#5:2 G5:2 A5:4',
  'G5:2 G5:2 G5:2 F#5:2 E5:4',
  'E5:2 F#5:2 G5:2 A5:2 G5:2 E5:2',
  'F#5:4 A5:4 D5:4',
  'B5:2 A5:2 G5:2 F#5:2 E5:2 D5:2',
  'C#5:2 D5:2 E5:2 G5:2 F#5:2 E5:2',
  'D5:2 F#5:2 E5:2 C#5:2 A4:4',
  'D5:6 R:6',
].join(' | ');
const jotaArmonia = [Dj, A7j, A7j, Dj, Dj, A7j, A7j, Dj, Dj, A7j, A7j, Dj, Gj, A7j, A7j, Dj];
const jt = jota(jotaArmonia);

// ---------------------------------------------------------------------------
// 3. Rumba (4/4): cadencia andaluza La menor – Sol – Fa – Mi.
// ---------------------------------------------------------------------------

const rumbaMelodia = [
  'A4:2 C5:2 E5:3 D5:1 C5:4 B4:2 A4:2',
  'B4:2 D5:2 G5:3 F5:1 E5:4 D5:4',
  'C5:2 A4:2 F5:3 E5:1 D5:4 C5:2 B4:2',
  'G#4:4 B4:2 D5:2 F5:4 E5:4',
  'E5:2 E5:2 E5:2 D5:2 C5:4 A4:4',
  'D5:2 D5:2 D5:2 C5:2 B4:4 G4:4',
  'C5:2 D5:2 E5:2 F5:2 E5:3 D5:1 C5:2 B4:2',
  'B4:4 G#4:4 E4:8',
].join(' | ');
const rumbaArmonia = [Am, G, F, Er, Am, G, F, Er];
const rb = rumba(rumbaArmonia);

export const POPURRI: Cancion = {
  nombre: 'popurri',
  bucle: true,
  secciones: [
    {
      nombre: 'pasodoble',
      bpm: 112,
      compas: [2, 4],
      pistas: [
        { instrumento: 'trompeta', volumen: 1, notas: pasodobleMelodia },
        { instrumento: 'tuba', volumen: 0.9, notas: pd.bajo },
        { instrumento: 'acordeon', volumen: 0.7, notas: pd.acordes },
        { instrumento: 'percusion', volumen: 0.6, notas: repetir('b:4 s:4', 24) },
      ],
    },
    {
      nombre: 'jota',
      bpm: 176,
      compas: [3, 4],
      pistas: [
        { instrumento: 'clarinete', volumen: 1, notas: jotaMelodia },
        { instrumento: 'bajo', volumen: 0.9, notas: jt.bajo },
        { instrumento: 'guitarra', volumen: 0.8, notas: jt.acordes },
        { instrumento: 'percusion', volumen: 0.7, notas: repetir('c:1 c:1 c:2 c:2 c:2 c:2 c:2', 16) },
      ],
    },
    {
      nombre: 'rumba',
      bpm: 104,
      compas: [4, 4],
      repeticiones: 2,
      pistas: [
        { instrumento: 'trompeta', volumen: 0.8, notas: rumbaMelodia },
        { instrumento: 'bajo', volumen: 0.9, notas: rb.bajo },
        { instrumento: 'guitarra', volumen: 0.9, notas: rb.acordes },
        { instrumento: 'percusion', volumen: 0.7, notas: repetir('R:4 p:4 R:4 p:2 t:2', 8) },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Sintonías
// ---------------------------------------------------------------------------

export const VICTORIA: Cancion = {
  nombre: 'victoria',
  bucle: false,
  secciones: [
    {
      nombre: 'fanfarria',
      bpm: 132,
      compas: [4, 4],
      pistas: [
        { instrumento: 'trompeta', volumen: 1, notas: 'C5:2 E5:2 G5:2 C6:2 G5:2 C6:2 E6:4 | D6:3 C6:1 B5:2 G5:2 C6:8' },
        { instrumento: 'trompeta', volumen: 0.6, notas: 'C4,E4,G4:8 F4,A4,C5:8 | G4,B4,D5:8 C4,E4,G4,C5:8' },
        { instrumento: 'tuba', volumen: 0.9, notas: 'C3:4 C3:4 F2:4 F2:4 | G2:4 G2:4 C2:8' },
        {
          instrumento: 'percusion',
          volumen: 0.7,
          notas: 's:1 s:1 s:1 s:1 s:1 s:1 s:1 s:1 b:4 pl:4 | b:4 s:4 b:4 pl:4',
        },
      ],
    },
  ],
};

export const DERROTA: Cancion = {
  nombre: 'derrota',
  bucle: false,
  secciones: [
    {
      nombre: 'lamento',
      bpm: 72,
      compas: [4, 4],
      pistas: [
        { instrumento: 'trompeta', volumen: 0.9, notas: 'E4:4 D#4:4 D4:4 C#4:4' },
        { instrumento: 'tuba', volumen: 0.8, notas: 'A2:4 G#2:4 G2:4 A1:4' },
      ],
    },
  ],
};

const charangaMelodia = [
  'C5:2 F5:2 A5:2 F5:2',
  'G5:3 F5:1 E5:2 C5:2',
  'D5:2 G5:2 Bb5:2 G5:2',
  'A5:6 R:2',
  'C6:2 A5:2 F5:2 A5:2',
  'G5:2 E5:2 C5:2 E5:2',
  'F5:2 A5:2 G5:2 E5:2',
  'F5:6 R:2',
  'A5:3 Bb5:1 C6:2 A5:2',
  'Bb5:3 A5:1 G5:2 Bb5:2',
  'A5:3 G5:1 F5:2 A5:2',
  'G5:6 R:2',
  'C5:2 F5:2 A5:2 C6:2',
  'D6:2 C6:2 Bb5:2 G5:2',
  'A5:2 F5:2 G5:2 E5:2',
  'F5:4 C5:4',
  'F5:2 F5:2 F5:2 F5:2',
  'A5:2 A5:2 A5:2 A5:2',
  'C6:4 C6:4',
  'F6:6 R:2',
].join(' | ');
const charangaArmonia = [Fc, C7c, C7c, Fc, Fc, C7c, C7c, Fc, Fc, C7c, Fc, C7c, Fc, Bbc, C7c, Fc, Fc, Fc, C7c, Fc];
const ch = oomPah(charangaArmonia);

export const CHARANGA: Cancion = {
  nombre: 'charanga',
  bucle: true,
  secciones: [
    {
      nombre: 'pasacalles',
      bpm: 120,
      compas: [2, 4],
      pistas: [
        { instrumento: 'trompeta', volumen: 1, notas: charangaMelodia },
        {
          instrumento: 'clarinete',
          volumen: 0.5,
          notas: charangaMelodia.replace(/([A-G][#b]?)(\d)/g, (_m, n, o) => `${n}${Number(o) - 1}`),
        },
        { instrumento: 'tuba', volumen: 1, notas: ch.bajo },
        { instrumento: 'acordeon', volumen: 0.5, notas: ch.acordes },
        { instrumento: 'percusion', volumen: 0.8, notas: repetir('b:2 pl:2 b:2 pl:2', 20) },
      ],
    },
  ],
};

export const CANCIONES: Record<string, Cancion> = {
  popurri: POPURRI,
  menu: POPURRI,
  victoria: VICTORIA,
  derrota: DERROTA,
  charanga: CHARANGA,
};
