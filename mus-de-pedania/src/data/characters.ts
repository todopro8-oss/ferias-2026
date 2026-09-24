// Personajes de Mus de Pedanía (sección 8). Todos inventados: ninguno se basa en personas reales.

import type { PerfilIA, Personalidad } from '../ai/personalities';

export type IdPersonaje = 'anselmo' | 'rufi' | 'canijo' | 'pura' | 'tomasin' | 'marisa' | 'julian';

export type PeloEstilo =
  'calvoCerco' | 'permanente' | 'gorraCooperativa' | 'mono' | 'flequillo' | 'tupe' | 'gorraPlato' | 'repeinado';

export type RopaEstilo =
  'chaleco' | 'bata' | 'tirantes' | 'rebeca' | 'sudadera' | 'lentejuelas' | 'uniforme' | 'delantal';

export type Accesorio =
  | 'gafasRedondas'
  | 'boligrafo'
  | 'aros'
  | 'chicle'
  | 'bigotePoblado'
  | 'tatuajeAncla'
  | 'gafasCadenita'
  | 'broche'
  | 'gafasAlambre'
  | 'walkman'
  | 'unasRojas'
  | 'bigotito'
  | 'corneta'
  | 'palillo'
  | 'trapo';

/** Rasgos para el generador de pixel art (`src/art/placeholderGen.ts`). */
export interface Aspecto {
  piel: 'piel_1' | 'piel_2' | 'piel_3';
  pelo: { estilo: PeloEstilo; color: string; sombra: string };
  ropa: { estilo: RopaEstilo; color: string; sombra: string; detalle: string };
  cara: {
    forma: 'redonda' | 'alargada' | 'cuadrada' | 'ovalada' | 'ancha';
    nariz: 'grande' | 'pequena' | 'ganchuda' | 'patata' | 'respingona';
    labios: 'finos' | 'gruesos' | 'pintados';
    cejas: 'pobladas' | 'finas' | 'arqueadas' | 'canosas';
    /** 0 = joven, 1 = mayor (arrugas). */
    edad: number;
  };
  accesorios: Accesorio[];
  /** Tamaño relativo del cuerpo (el Canijo es enorme). */
  corpulencia: number;
}

/** Parámetros del balbuceo sintético (sección 12). */
export interface VozPersonaje {
  /** Frecuencia fundamental en Hz. */
  tono: number;
  /** Sílabas por segundo. */
  velocidad: number;
  /** Desplazamiento de formantes (1 = neutro; >1 más agudo). */
  formantes: number;
  /** Variación de entonación (0..1). */
  melodia: number;
  /** Aspereza (0..1): la voz ronca del Canijo. */
  aspereza: number;
  /** Nasalidad (0..1). */
  nasal: number;
  /** Alarga las vocales finales (el alguacil). */
  alarga?: boolean;
}

export interface Personaje {
  id: IdPersonaje;
  nombre: string;
  /** Nombre corto para bocadillos y marcadores. */
  corto: string;
  oficio: string;
  estiloJuego: string;
  estilo: NonNullable<PerfilIA['estilo']>;
  vozDescripcion: string;
  stats: Personalidad;
  aspecto: Aspecto;
  voz: VozPersonaje;
  /** Nivel para el torneo (la Final la juegan los dos de más nivel). */
  nivel: number;
}

export const PERSONAJES: Record<IdPersonaje, Personaje> = {
  anselmo: {
    id: 'anselmo',
    nombre: 'Don Anselmo',
    corto: 'Anselmo',
    oficio: 'Boticario jubilado',
    estiloJuego: 'Prudente, cuenta cartas, casi nunca farolea y lee las señas.',
    estilo: 'calculador',
    vozDescripcion: 'Grave y lenta',
    stats: { agr: 0.3, far: 0.08, ord: 0.05, vis: 0.85, dis: 0.8, fra: 0.6, cor: 0.7 },
    aspecto: {
      piel: 'piel_1',
      pelo: { estilo: 'calvoCerco', color: '#EAEAE0', sombra: '#9FA69B' },
      ropa: { estilo: 'chaleco', color: '#7A1E2A', sombra: '#4E1119', detalle: '#F1E6C8' },
      cara: { forma: 'ovalada', nariz: 'grande', labios: 'finos', cejas: 'canosas', edad: 0.9 },
      accesorios: ['gafasRedondas', 'boligrafo'],
      corpulencia: 0.9,
    },
    voz: { tono: 95, velocidad: 4.2, formantes: 0.9, melodia: 0.2, aspereza: 0.15, nasal: 0.1 },
    nivel: 5,
  },
  rufi: {
    id: 'rufi',
    nombre: 'La Rufi',
    corto: 'Rufi',
    oficio: 'Peluquera',
    estiloJuego: 'Habladora, farolera y se pica.',
    estilo: 'farolera',
    vozDescripcion: 'Aguda y rápida',
    stats: { agr: 0.7, far: 0.4, ord: 0.15, vis: 0.55, dis: 0.3, fra: 0.8, cor: 0.5 },
    aspecto: {
      piel: 'piel_1',
      pelo: { estilo: 'permanente', color: '#8E3B1F', sombra: '#5A2211' },
      ropa: { estilo: 'bata', color: '#F29BC0', sombra: '#C0628C', detalle: '#FFFFFF' },
      cara: { forma: 'redonda', nariz: 'respingona', labios: 'pintados', cejas: 'arqueadas', edad: 0.45 },
      accesorios: ['aros', 'chicle'],
      corpulencia: 1,
    },
    voz: { tono: 250, velocidad: 7.5, formantes: 1.2, melodia: 0.8, aspereza: 0.05, nasal: 0.2 },
    nivel: 3,
  },
  canijo: {
    id: 'canijo',
    nombre: 'El Canijo',
    corto: 'Canijo',
    oficio: 'Camionero de dos metros',
    estiloJuego: 'Órdaguero.',
    estilo: 'ordaguero',
    vozDescripcion: 'Ronca y fuerte',
    stats: { agr: 0.85, far: 0.3, ord: 0.4, vis: 0.25, dis: 0.15, fra: 0.9, cor: 0.45 },
    aspecto: {
      piel: 'piel_2',
      pelo: { estilo: 'gorraCooperativa', color: '#2E2A26', sombra: '#1A1410' },
      ropa: { estilo: 'tirantes', color: '#E8E4D8', sombra: '#B4AE9C', detalle: '#2F58A8' },
      cara: { forma: 'cuadrada', nariz: 'patata', labios: 'gruesos', cejas: 'pobladas', edad: 0.4 },
      accesorios: ['bigotePoblado', 'tatuajeAncla'],
      corpulencia: 1.25,
    },
    voz: { tono: 80, velocidad: 5, formantes: 0.85, melodia: 0.35, aspereza: 0.7, nasal: 0 },
    nivel: 2,
  },
  pura: {
    id: 'pura',
    nombre: 'Doña Pura',
    corto: 'Pura',
    oficio: 'La del estanco',
    estiloJuego: 'Rácana: sólo va con cartas.',
    estilo: 'racana',
    vozDescripcion: 'Seca y nasal',
    stats: { agr: 0.35, far: 0.05, ord: 0.05, vis: 0.75, dis: 0.7, fra: 0.4, cor: 0.75 },
    aspecto: {
      piel: 'piel_1',
      pelo: { estilo: 'mono', color: '#A7A7A0', sombra: '#6E6E68' },
      ropa: { estilo: 'rebeca', color: '#26221F', sombra: '#141210', detalle: '#E2B227' },
      cara: { forma: 'alargada', nariz: 'ganchuda', labios: 'finos', cejas: 'finas', edad: 0.8 },
      accesorios: ['gafasCadenita', 'broche'],
      corpulencia: 0.85,
    },
    voz: { tono: 190, velocidad: 5.2, formantes: 1.05, melodia: 0.15, aspereza: 0.1, nasal: 0.8 },
    nivel: 4,
  },
  tomasin: {
    id: 'tomasin',
    nombre: 'Tomasín',
    corto: 'Tomasín',
    oficio: 'Estudiante de Estadística',
    estiloJuego: 'Calculador, pero sobrado.',
    estilo: 'calculador',
    vozDescripcion: 'Nasal y pedante',
    stats: { agr: 0.5, far: 0.2, ord: 0.1, vis: 0.6, dis: 0.5, fra: 0.5, cor: 0.6 },
    aspecto: {
      piel: 'piel_1',
      pelo: { estilo: 'flequillo', color: '#5A3A1E', sombra: '#3A2415' },
      ropa: { estilo: 'sudadera', color: '#2F58A8', sombra: '#1E3A72', detalle: '#EAEAE0' },
      cara: { forma: 'alargada', nariz: 'pequena', labios: 'finos', cejas: 'finas', edad: 0 },
      accesorios: ['gafasAlambre', 'walkman'],
      corpulencia: 0.8,
    },
    voz: { tono: 150, velocidad: 6.5, formantes: 1.05, melodia: 0.3, aspereza: 0.05, nasal: 0.6 },
    nivel: 4,
  },
  marisa: {
    id: 'marisa',
    nombre: 'Marisa Lentejuela',
    corto: 'Marisa',
    oficio: 'Cantante de orquesta de verbena',
    estiloJuego: 'Teatral, señas exageradas, farolea con estilo.',
    estilo: 'teatral',
    vozDescripcion: 'Impostada y cantarina',
    stats: { agr: 0.6, far: 0.35, ord: 0.2, vis: 0.4, dis: 0.1, fra: 0.85, cor: 0.5 },
    aspecto: {
      piel: 'piel_1',
      pelo: { estilo: 'tupe', color: '#F4F0C8', sombra: '#C8C090' },
      ropa: { estilo: 'lentejuelas', color: '#2EC4B6', sombra: '#16847A', detalle: '#F4FFE0' },
      cara: { forma: 'ovalada', nariz: 'respingona', labios: 'pintados', cejas: 'arqueadas', edad: 0.35 },
      accesorios: ['unasRojas'],
      corpulencia: 0.95,
    },
    voz: { tono: 230, velocidad: 5.5, formantes: 1.15, melodia: 1, aspereza: 0, nasal: 0.1 },
    nivel: 3,
  },
  julian: {
    id: 'julian',
    nombre: 'Julián',
    corto: 'Julián',
    oficio: 'Alguacil del pueblo',
    estiloJuego: 'Reglamentista, protesta cualquier cosa, muy estable.',
    estilo: 'reglamentista',
    vozDescripcion: 'De pregonero, alarga las vocales',
    stats: { agr: 0.45, far: 0.15, ord: 0.1, vis: 0.7, dis: 0.6, fra: 0.6, cor: 0.6 },
    aspecto: {
      piel: 'piel_2',
      pelo: { estilo: 'gorraPlato', color: '#1C2A4A', sombra: '#0E1628' },
      ropa: { estilo: 'uniforme', color: '#1C2A4A', sombra: '#0E1628', detalle: '#E2B227' },
      cara: { forma: 'redonda', nariz: 'grande', labios: 'finos', cejas: 'pobladas', edad: 0.6 },
      accesorios: ['bigotito', 'corneta'],
      corpulencia: 1,
    },
    voz: { tono: 120, velocidad: 4, formantes: 0.95, melodia: 0.6, aspereza: 0.2, nasal: 0.15, alarga: true },
    nivel: 5,
  },
};

export const IDS_PERSONAJES: readonly IdPersonaje[] = [
  'anselmo',
  'rufi',
  'canijo',
  'pura',
  'tomasin',
  'marisa',
  'julian',
];

/** Nicanor, dueño y camarero del Bar El Envite (no jugable). */
export const NICANOR = {
  id: 'nicanor',
  nombre: 'Nicanor',
  aspecto: {
    piel: 'piel_2',
    pelo: { estilo: 'repeinado', color: '#2E2A26', sombra: '#1A1410' },
    ropa: { estilo: 'delantal', color: '#F1E6C8', sombra: '#C8BC9C', detalle: '#3E7C2C' },
    cara: { forma: 'ancha', nariz: 'patata', labios: 'gruesos', cejas: 'pobladas', edad: 0.6 },
    accesorios: ['palillo', 'trapo'],
    corpulencia: 1.1,
  } satisfies Aspecto,
  voz: { tono: 110, velocidad: 5, formantes: 0.95, melodia: 0.4, aspereza: 0.3, nasal: 0.1 } satisfies VozPersonaje,
};

export function personaje(id: IdPersonaje): Personaje {
  return PERSONAJES[id];
}
