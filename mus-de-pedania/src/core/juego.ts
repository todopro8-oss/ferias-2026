// Contexto global del juego que reciben las escenas.

import type { Dificultad } from '../ai/personalities';
import type { MusConfig, VelocidadIA } from '../mus/config';
import { crearConfig } from '../mus/config';
import type { Entrada } from './input';
import type { Escalado, Pantalla } from './pantalla';
import type { GestorEscenas } from './sceneManager';
import type { Bucle } from './loop';

export type Parloteo = 'poco' | 'normal' | 'clasico';

export interface Opciones {
  dificultad: Dificultad;
  reglas: Pick<MusConfig, 'reyes' | 'puntosJuego' | 'juegosPartida' | 'musCorrido'>;
  senas: MusConfig['senas'];
  senasDeLaCasa: boolean;
  velocidadIA: VelocidadIA;
  parloteo: Parloteo;
  volumenMusica: number;
  volumenEfectos: number;
  volumenVoces: number;
  vocesSinteticas: boolean;
  filtroSoundBlaster: boolean;
  escalado: Escalado;
  correccion43: boolean;
  arranqueRetro: boolean;
  chivato: boolean;
  historialVisible: boolean;
  /** Extra del remake: clic en la cara de un rival mientras hace una seña. */
  teHeVisto: boolean;
}

export const OPCIONES_POR_DEFECTO: Opciones = {
  dificultad: 'normal',
  reglas: { reyes: 8, puntosJuego: 40, juegosPartida: 1, musCorrido: false },
  senas: 'clasico',
  senasDeLaCasa: false,
  velocidadIA: 'normal',
  parloteo: 'normal',
  volumenMusica: 0.7,
  volumenEfectos: 0.8,
  volumenVoces: 0.8,
  vocesSinteticas: true,
  filtroSoundBlaster: false,
  escalado: 'auto',
  correccion43: false,
  arranqueRetro: true,
  chivato: false,
  historialVisible: false,
  teHeVisto: true,
};

export function configDeOpciones(o: Opciones): MusConfig {
  return crearConfig({ ...o.reglas, senas: o.senas, senasDeLaCasa: o.senasDeLaCasa, velocidadIA: o.velocidadIA });
}

/** Multiplicador de todas las esperas según la velocidad de la IA. */
export function ritmo(v: VelocidadIA): number {
  return v === 'lenta' ? 1.5 : v === 'rapida' ? 0.55 : 1;
}

export interface Juego {
  pantalla: Pantalla;
  entrada: Entrada;
  escenas: GestorEscenas;
  bucle: Bucle;
  opciones: Opciones;
  /** Guarda las opciones (lo implementa save.ts). */
  guardarOpciones(): void;
  /** Tiempo total transcurrido en ms (para animaciones de fondo). */
  tiempo: number;
  /** Multiplicador de velocidad global (prueba de resistencia). */
  turbo: number;
  audio: FachadaAudio;
}

/** Fachada de audio: la escena pide sonidos sin saber cómo se sintetizan. */
export interface FachadaAudio {
  sfx(nombre: string, op?: { volumen?: number; tono?: number; retardo?: number }): void;
  /** Reproduce una línea de voz (grabada o balbuceo). Devuelve su duración en ms. */
  voz(quien: string, evento: string, texto: string): number;
  musica(cancion: string | null): void;
  ambiente(activo: boolean): void;
}

export const AUDIO_MUDO: FachadaAudio = {
  sfx: () => {},
  voz: (_q, _e, t) => 400 + t.length * 45,
  musica: () => {},
  ambiente: () => {},
};
