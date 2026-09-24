// Tipos compartidos del motor: acciones, decisiones pendientes, resultados y eventos.

import type { AccionApuesta, TipoAccionApuesta, VozApuesta } from './betting';
import type { Carta } from './cards';
import type { Equipo, Seat } from './config';
import type { Lance } from './evaluate';

export type Accion = { tipo: 'mus' } | { tipo: 'noHayMus' } | { tipo: 'descarte'; cartas: Carta[] } | AccionApuesta;

export type Decision =
  | { tipo: 'mus'; jugador: Seat }
  | { tipo: 'descarte'; jugador: Seat }
  | {
      tipo: 'apuesta';
      jugador: Seat;
      lance: Lance;
      opciones: TipoAccionApuesta[];
      /** Total propuesto ahora mismo (0 = no hay apuesta). */
      apuestaVigente: number;
      ordago: boolean;
    };

/** Cómo quedó cada lance. */
export type ResultadoLance =
  | { tipo: 'paso' }
  | { tipo: 'querido'; puntos: number; ordago: boolean }
  | { tipo: 'rechazado'; ganador: Equipo; piedras: number; ordago: boolean }
  /** Sólo un equipo tenía jugada (pares o juego): no hubo apuestas. */
  | { tipo: 'solo'; equipo: Equipo }
  /** Nadie tenía jugada (pares): no hubo lance. */
  | { tipo: 'nadie' };

export type MotivoParte = 'querido' | 'paso' | 'deje' | 'pareja' | 'medias' | 'duples' | 'juego31' | 'juego' | 'punto';

export interface ParteRecuento {
  piedras: number;
  motivo: MotivoParte;
  /** El deje se cobra en el acto: en el recuento sólo se recuerda, no se vuelve a sumar. */
  cobradoAntes?: boolean;
  jugador?: Seat;
  /** Suma de juego (31, 32…) cuando aplica. */
  suma?: number;
}

export interface LineaRecuento {
  lance: Lance;
  equipo: Equipo | null;
  partes: ParteRecuento[];
  /** Piedras que se suman ahora (sin contar lo cobrado antes). */
  total: number;
}

export type MotivoFinJuego = 'deje' | 'ordago' | 'recuento';

export interface FinJuego {
  ganador: Equipo;
  motivo: MotivoFinJuego;
  lance?: Lance;
}

export type VozMus = VozApuesta | 'mus' | 'noHayMus' | 'descarte' | 'paresSi' | 'paresNo' | 'juegoSi' | 'juegoNo';

export type EventoMus =
  | { tipo: 'inicio_mano'; postre: Seat; mano: Seat; marcador: [number, number] }
  | { tipo: 'baraja' }
  | { tipo: 'carta_repartida'; a: Seat; carta: Carta; reposicion: boolean }
  | { tipo: 'habla'; jugador: Seat; voz: VozMus; cantidad?: number; lance?: Lance; total?: number }
  | { tipo: 'descarte'; jugador: Seat; cartas: Carta[] }
  | { tipo: 'rebarajar_descartes'; cartas: number }
  | { tipo: 'mano_avanza'; mano: Seat; postre: Seat }
  | { tipo: 'fase_mus'; ronda: number }
  | { tipo: 'corte_mus'; jugador: Seat }
  | { tipo: 'lance_inicio'; lance: Lance; participantes: Seat[] }
  | { tipo: 'lance_fin'; lance: Lance; resultado: ResultadoLance }
  | { tipo: 'deje'; lance: Lance; equipo: Equipo; piedras: number; marcador: [number, number] }
  | { tipo: 'ordago_aceptado'; lance: Lance }
  | { tipo: 'destape'; manos: Carta[][] }
  | { tipo: 'resolucion_ordago'; lance: Lance; ganador: Seat; equipo: Equipo }
  | { tipo: 'recuento'; linea: LineaRecuento; marcador: [number, number] }
  | { tipo: 'adentro'; equipo: Equipo }
  | { tipo: 'fin_mano'; marcador: [number, number] }
  | { tipo: 'fin_juego'; fin: FinJuego; marcador: [number, number] };

/** Registro público de lo que se ha dicho (lo que cualquiera en la mesa ha oído). */
export interface RegistroHabla {
  jugador: Seat;
  voz: VozMus;
  lance?: Lance;
  cantidad?: number;
  total?: number;
  rondaMus?: number;
}
