// Convierte los eventos del motor en frases legibles: el registro de consola de
// `npm run partida` y el historial de la mano (tecla L) usan esto.

import { manoCorta } from '../mus/cards';
import type { Equipo, Seat } from '../mus/config';
import { describirPares, pares, sumaJuego, type Lance } from '../mus/evaluate';
import type { EventoMus, LineaRecuento, ParteRecuento, ResultadoLance } from '../mus/types';

export const NOMBRE_LANCE: Record<Lance, string> = {
  grande: 'Grande',
  chica: 'Chica',
  pares: 'Pares',
  juego: 'Juego',
  punto: 'Punto',
};

export const NOMBRE_EQUIPO: Record<Equipo, string> = { 0: 'Nosotros', 1: 'Ellos' };

export const NOMBRE_ASIENTO: Record<Seat, string> = { 0: 'Sur', 1: 'Este', 2: 'Norte', 3: 'Oeste' };

const CANTIDADES = [
  'cero',
  'una',
  'dos',
  'tres',
  'cuatro',
  'cinco',
  'seis',
  'siete',
  'ocho',
  'nueve',
  'diez',
  'once',
  'doce',
  'trece',
  'catorce',
  'quince',
  'dieciséis',
  'diecisiete',
  'dieciocho',
  'diecinueve',
  'veinte',
];

export function mayuscula(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function cantidadEnLetra(n: number): string {
  return CANTIDADES[n] ?? String(n);
}

export function describirResultado(r: ResultadoLance): string {
  switch (r.tipo) {
    case 'paso':
      return 'en paso';
    case 'querido':
      return r.ordago ? 'órdago querido' : `querido ${r.puntos}`;
    case 'rechazado':
      return `${r.ordago ? 'órdago no querido' : 'no querido'}: ${NOMBRE_EQUIPO[r.ganador]} +${r.piedras}`;
    case 'solo':
      return `sólo ${NOMBRE_EQUIPO[r.equipo]}`;
    case 'nadie':
      return 'nadie';
  }
}

export function describirParte(p: ParteRecuento): string {
  switch (p.motivo) {
    case 'querido':
      return `+${p.piedras} (querido)`;
    case 'paso':
      return `+${p.piedras} (en paso)`;
    case 'deje':
      return `+${p.piedras} (deje)`;
    case 'pareja':
      return `+${p.piedras} (pareja)`;
    case 'medias':
      return `+${p.piedras} (medias)`;
    case 'duples':
      return `+${p.piedras} (duples)`;
    case 'juego31':
      return `+${p.piedras} (31)`;
    case 'juego':
      return `+${p.piedras} (${p.suma ?? 'juego'})`;
    case 'punto':
      return `+${p.piedras} (punto)`;
  }
}

/** «Grande: Ellos +2 (querido)», «Pares: Nosotros +1 (deje) +3 (duples)». */
export function describirLineaRecuento(l: LineaRecuento): string {
  if (l.equipo === null || l.partes.length === 0) return `${NOMBRE_LANCE[l.lance]}: nadie`;
  return `${NOMBRE_LANCE[l.lance]}: ${NOMBRE_EQUIPO[l.equipo]} ${l.partes.map(describirParte).join(' ')}`;
}

/** Frase para un evento, o null si no merece línea. `nombres[asiento]`. */
export function narrar(e: EventoMus, nombres: readonly string[]): string | null {
  const n = (s: Seat) => nombres[s];
  switch (e.tipo) {
    case 'inicio_mano':
      return `Reparte ${n(e.postre)} (postre). Es mano ${n(e.mano)}.`;
    case 'baraja':
    case 'carta_repartida':
    case 'fase_mus':
    case 'descarte':
      return null;
    case 'habla':
      switch (e.voz) {
        case 'mus':
          return `${n(e.jugador)}: «Mus».`;
        case 'noHayMus':
          return `${n(e.jugador)}: «No hay mus».`;
        case 'descarte':
          return `${n(e.jugador)} se descarta de ${cantidadEnLetra(e.cantidad ?? 0)}.`;
        case 'paso':
          return `${n(e.jugador)}: «Paso».`;
        case 'envido':
          return `${n(e.jugador)}: «${e.cantidad === 2 ? 'Envido' : `Envido ${cantidadEnLetra(e.cantidad ?? 2)}`}».`;
        case 'envidoMas':
          return `${n(e.jugador)}: «${mayuscula(cantidadEnLetra(e.cantidad ?? 2))} más» (van ${e.total}).`;
        case 'quiero':
          return `${n(e.jugador)}: «Quiero».`;
        case 'quieroOrdago':
          return `${n(e.jugador)}: «¡Quiero el órdago!»`;
        case 'noQuiero':
          return `${n(e.jugador)}: «No quiero».`;
        case 'ordago':
          return `${n(e.jugador)}: «¡Órdago!»`;
        case 'paresSi':
          return `${n(e.jugador)}: «Pares sí».`;
        case 'paresNo':
          return `${n(e.jugador)}: «Pares no».`;
        case 'juegoSi':
          return `${n(e.jugador)}: «Juego sí».`;
        case 'juegoNo':
          return `${n(e.jugador)}: «Juego no».`;
      }
      return null;
    case 'rebarajar_descartes':
      return `Se acaba el mazo: se barajan los descartes (${e.cartas} cartas).`;
    case 'mano_avanza':
      return `Mus corrido: ahora es mano ${n(e.mano)}.`;
    case 'corte_mus':
      return null;
    case 'lance_inicio':
      return `— ${NOMBRE_LANCE[e.lance]} —`;
    case 'lance_fin':
      return `  ${NOMBRE_LANCE[e.lance]}: ${describirResultado(e.resultado)}.`;
    case 'deje':
      return `  ${NOMBRE_EQUIPO[e.equipo]} cobran ${e.piedras} en el acto (${e.marcador[0]}-${e.marcador[1]}).`;
    case 'ordago_aceptado':
      return `¡¡Órdago a ${e.lance === 'grande' || e.lance === 'chica' ? 'la' : 'los'} ${NOMBRE_LANCE[e.lance].toLowerCase()} aceptado!! Se destapan las cartas.`;
    case 'destape':
      return `Destape: ${e.manos.map((m, s) => `${n(s as Seat)} [${manoCorta(m)}]`).join(' · ')}`;
    case 'resolucion_ordago':
      return `Gana el órdago ${n(e.ganador)}: el juego es para ${NOMBRE_EQUIPO[e.equipo]}.`;
    case 'recuento':
      return `  ${describirLineaRecuento(e.linea)} → ${e.marcador[0]}-${e.marcador[1]}`;
    case 'adentro':
      return `¡${NOMBRE_EQUIPO[e.equipo]} están adentro!`;
    case 'fin_mano':
      return `Marcador: Nosotros ${e.marcador[0]} · Ellos ${e.marcador[1]}`;
    case 'fin_juego':
      return `*** Juego para ${NOMBRE_EQUIPO[e.fin.ganador]} (${e.fin.motivo === 'ordago' ? 'por órdago' : e.fin.motivo === 'deje' ? 'con un deje' : 'en el recuento'}) ***`;
  }
}

/** Descripción corta de una mano: «R R 7 A · pareja de reyes · 28». */
export function describirMano(cartas: readonly number[], reyes: 8 | 4): string {
  const p = pares(cartas, reyes);
  const s = sumaJuego(cartas, reyes);
  const partes = [manoCorta(cartas)];
  if (p.tipo > 0) partes.push(describirPares(p));
  partes.push(s >= 31 ? `juego de ${s}` : `${s} al punto`);
  return partes.join(' · ');
}
