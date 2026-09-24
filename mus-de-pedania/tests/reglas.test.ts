// Tests obligatorios de la sección 4.10 (numerados como en la spec) y algunos más.

import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../src/core/rng';
import { aplicarApuesta, iniciarApuesta } from '../src/mus/betting';
import { TOTAL_CARTAS } from '../src/mus/cards';
import { crearConfig } from '../src/mus/config';
import {
  claveChica,
  claveGrande,
  claveJuegoDeSuma,
  clavePunto,
  ganadorLance,
  pares,
  rangosDesc,
  sumaJuego,
  tieneJuego,
} from '../src/mus/evaluate';
import { ManoMus } from '../src/mus/handState';
import type { EventoMus } from '../src/mus/types';
import {
  cartas,
  envido,
  jugar,
  manoFija,
  MUS,
  NO_HAY_MUS,
  NO_QUIERO,
  ORDAGO,
  pasarLance,
  pasarTodo,
  PASO,
  QUIERO,
} from './helpers';

// Cartas de relleno sin pares ni juego para los asientos que no importan.
const RELLENO_A = 'Rb 7b 6b 5b';
const RELLENO_B = 'Cb 7o 6o 4b';

describe('4.10 · evaluación de manos', () => {
  it('1 · 8 reyes, [3, R, A, 2] → dos reyes, dos ases, duples reyes-ases, 22 sin juego', () => {
    const m = cartas('3b Re Ac 2o');
    expect(rangosDesc(m, 8)).toEqual([12, 12, 1, 1]);
    // Grande: dos reyes arriba; chica: dos ases abajo.
    expect(claveGrande(m, 8)).toBeGreaterThan(claveGrande(cartas('Rb Cc 7o 6e'), 8));
    expect(claveChica(m, 8)).toBeGreaterThan(claveChica(cartas('Ab 4c 5o 6e'), 8));
    const p = pares(m, 8);
    expect(p).toMatchObject({ tipo: 3, alta: 12, baja: 1 });
    expect(sumaJuego(m, 8)).toBe(22);
    expect(tieneJuego(sumaJuego(m, 8))).toBe(false);
    expect(clavePunto(m, 8)).toBe(22);
  });

  it('2 · la misma mano con 4 reyes → sin pares; suma 16', () => {
    const m = cartas('3b Re Ac 2o');
    expect(pares(m, 4).tipo).toBe(0);
    expect(sumaJuego(m, 4)).toBe(16);
  });

  it('3 · [7, 7, 7, S] → medias de sietes y juego de 31', () => {
    const m = cartas('7o 7c 7e So');
    expect(pares(m, 8)).toMatchObject({ tipo: 2, alta: 7 });
    expect(sumaJuego(m, 8)).toBe(31);
  });

  it('4 · [R, C, S, A] → juego de 31', () => {
    expect(sumaJuego(cartas('Ro Cc Se Ab'), 8)).toBe(31);
    expect(sumaJuego(cartas('Ro Cc Se Ab'), 4)).toBe(31);
  });

  it('5 · orden del juego 31 > 32 > 40 > 37 > 36 > 35 > 34 > 33', () => {
    const orden = [31, 32, 40, 37, 36, 35, 34, 33].map(claveJuegoDeSuma);
    for (let i = 1; i < orden.length; i++) expect(orden[i - 1]).toBeGreaterThan(orden[i]);
    expect(claveJuegoDeSuma(33)).toBeGreaterThan(0);
    expect(claveJuegoDeSuma(30)).toBe(0);
  });

  it('6 · empate exacto a grande → gana el más cercano a la mano', () => {
    const manos = [cartas('Co 6o 5o 4o'), cartas('Rc Rb 7c 4c'), cartas('Sc 6c 5c 4e'), cartas('Ro Re 7o 4b')];
    // Mano = 0: habla 0, 1, 2, 3 → el 1 va antes que el 3.
    expect(ganadorLance('grande', manos, 0, 8)).toBe(1);
    // Mano = 2: habla 2, 3, 0, 1 → ahora el 3 va antes.
    expect(ganadorLance('grande', manos, 2, 8)).toBe(3);
    // Mano = 1: el propio 1 es mano.
    expect(ganadorLance('grande', manos, 1, 8)).toBe(1);
  });

  it('16 · duples: [R, R, A, A] vence a cuatro caballos; [R, R, R, R] vence a [R, R, A, A]', () => {
    const rrAA = pares(cartas('Ro Rc Ao Ac'), 4);
    const cccc = pares(cartas('Co Cc Ce Cb'), 4);
    const rrrr = pares(cartas('Ro Rc Re Rb'), 4);
    expect(cccc).toMatchObject({ tipo: 3, alta: 11, baja: 11 });
    expect(rrAA.clave).toBeGreaterThan(cccc.clave);
    expect(rrrr.clave).toBeGreaterThan(rrAA.clave);
  });

  it('duples > medias > pareja, y dentro de cada tipo por rango', () => {
    const duplesBajos = pares(cartas('4o 4c Ao Ac'), 4).clave;
    const mediasReyes = pares(cartas('Ro Rc Re 4b'), 4).clave;
    const parejaReyes = pares(cartas('Ro Rc 5e 4b'), 4).clave;
    const parejaCaballos = pares(cartas('Co Cc 5e 4b'), 4).clave;
    expect(duplesBajos).toBeGreaterThan(mediasReyes);
    expect(mediasReyes).toBeGreaterThan(parejaReyes);
    expect(parejaReyes).toBeGreaterThan(parejaCaballos);
  });
});

describe('4.10 · apuestas', () => {
  it('7 · envido de 2, los dos rivales no quieren → +1 inmediato al que envidó', () => {
    let e = iniciarApuesta([0, 1, 2, 3]);
    e = aplicarApuesta(e, 0, { tipo: 'envido', cantidad: 2 });
    expect(e.turno).toBe(1);
    e = aplicarApuesta(e, 1, { tipo: 'noQuiero' });
    expect(e.turno).toBe(3);
    e = aplicarApuesta(e, 3, { tipo: 'noQuiero' });
    expect(e.resultado).toEqual({ tipo: 'rechazado', ganador: 0, piedras: 1, ordago: false });

    // Y en la mano completa, el deje se cobra en el acto.
    const m = manoFija([RELLENO_A, 'Ro Rc 5c 4c', RELLENO_B, 'Ao Ae 6e 4e']);
    jugar(m, [
      [0, NO_HAY_MUS],
      [0, envido(2)],
      [1, NO_QUIERO],
      [3, NO_QUIERO],
    ]);
    expect(m.marcador).toEqual([1, 0]);
    expect(m.resultados.grande).toMatchObject({ tipo: 'rechazado', ganador: 0, piedras: 1 });
    expect(m.lance).toBe('chica');
  });

  it('8 · envido 2 → «cinco más» (total 7) → no quiero → +2 a los que subieron', () => {
    let e = iniciarApuesta([0, 1, 2, 3]);
    e = aplicarApuesta(e, 0, { tipo: 'envido', cantidad: 2 });
    e = aplicarApuesta(e, 1, { tipo: 'envido', cantidad: 5 });
    expect(e.apuestaVigente).toBe(7);
    expect(e.apuestaAnterior).toBe(2);
    expect(e.turno).toBe(2);
    e = aplicarApuesta(e, 2, { tipo: 'noQuiero' });
    expect(e.turno).toBe(0);
    e = aplicarApuesta(e, 0, { tipo: 'noQuiero' });
    expect(e.resultado).toEqual({ tipo: 'rechazado', ganador: 1, piedras: 2, ordago: false });
  });

  it('9 · 2 → +5 (7) → +10 (17) → no quiero → +7', () => {
    let e = iniciarApuesta([0, 1, 2, 3]);
    e = aplicarApuesta(e, 0, { tipo: 'envido', cantidad: 2 });
    e = aplicarApuesta(e, 1, { tipo: 'envido', cantidad: 5 });
    e = aplicarApuesta(e, 2, { tipo: 'envido', cantidad: 10 });
    expect(e.apuestaVigente).toBe(17);
    expect(e.turno).toBe(3);
    e = aplicarApuesta(e, 3, { tipo: 'noQuiero' });
    expect(e.turno).toBe(1);
    e = aplicarApuesta(e, 1, { tipo: 'noQuiero' });
    expect(e.resultado).toEqual({ tipo: 'rechazado', ganador: 0, piedras: 7, ordago: false });
  });

  it('si el primero no quiere pero su compañero sí, la apuesta queda aceptada', () => {
    let e = iniciarApuesta([0, 1, 2, 3]);
    e = aplicarApuesta(e, 0, { tipo: 'envido', cantidad: 2 });
    e = aplicarApuesta(e, 1, { tipo: 'noQuiero' });
    e = aplicarApuesta(e, 3, { tipo: 'quiero' });
    expect(e.resultado).toEqual({ tipo: 'querido', puntos: 2, ordago: false });
  });

  it('nadie habla fuera de turno', () => {
    const e = iniciarApuesta([0, 1, 2, 3]);
    expect(() => aplicarApuesta(e, 2, { tipo: 'paso' })).toThrow(/turno/);
    const m = manoFija([RELLENO_A, 'Ro Rc 5c 4c', RELLENO_B, 'Ao Ae 6e 4e']);
    expect(() => m.actuar(1, MUS)).toThrow(/turno/);
    m.actuar(0, NO_HAY_MUS);
    expect(() => m.actuar(0, QUIERO)).toThrow();
    expect(() => m.actuar(1, PASO)).toThrow(/turno/);
  });

  it('10 · órdago a la grande aceptado → decide sólo la grande, aunque fuera 0-39', () => {
    const m = manoFija(['Ro Rc Re Rb', '7o 7c 7e 5o', 'Ao Ac Ae 4o', 'Co Cc 3o 4c'], { marcador: [0, 39] });
    jugar(m, [
      [0, NO_HAY_MUS],
      [0, ORDAGO],
      [1, QUIERO],
    ]);
    expect(m.terminada).toBe(true);
    expect(m.finJuego).toEqual({ ganador: 0, motivo: 'ordago', lance: 'grande' });
    const tipos = m.eventos.map((e) => e.tipo);
    expect(tipos).toContain('ordago_aceptado');
    expect(tipos.indexOf('destape')).toBeGreaterThan(tipos.indexOf('ordago_aceptado'));
    expect(tipos.at(-2)).toBe('fin_juego');
  });

  it('órdago rechazado sobre un envite → cobra la apuesta anterior', () => {
    const m = manoFija([RELLENO_A, 'Ro Rc 5c 4c', RELLENO_B, 'Ao Ae 6e 4e']);
    jugar(m, [
      [0, NO_HAY_MUS],
      [0, envido(4)],
      [1, ORDAGO],
      [2, NO_QUIERO],
      [0, NO_QUIERO],
    ]);
    expect(m.marcador).toEqual([0, 4]);
    expect(m.resultados.grande).toMatchObject({ tipo: 'rechazado', ganador: 1, piedras: 4, ordago: true });
  });

  it('un rechazo que alcanza los puntos del juego lo termina en el acto', () => {
    const m = manoFija([RELLENO_A, 'Ro Rc 5c 4c', RELLENO_B, 'Ao Ae 6e 4e'], { marcador: [30, 39] });
    jugar(m, [
      [0, NO_HAY_MUS],
      [0, PASO],
      [1, envido(2)],
      [2, NO_QUIERO],
      [0, NO_QUIERO],
    ]);
    expect(m.terminada).toBe(true);
    expect(m.finJuego).toEqual({ ganador: 1, motivo: 'deje', lance: 'grande' });
    expect(m.marcador).toEqual([30, 40]);
  });
});

describe('4.10 · recuento', () => {
  it('11 · sólo el equipo A tiene pares → no hay apuestas; A cobra sus pares en el recuento', () => {
    // A: 0 con pareja de reyes, 2 con medias de sotas. B sin pares.
    const m = manoFija(['Ro Rc 5o 4o', '7c 6c 5c 4c', 'So Sc Se Ab', 'Cb 7e 6e 5e']);
    m.actuar(0, NO_HAY_MUS);
    pasarLance(m); // grande
    pasarLance(m); // chica
    expect(m.resultados.pares).toEqual({ tipo: 'solo', equipo: 0 });
    expect(m.lance).not.toBe('pares');
    pasarTodo(m);
    expect(m.terminada).toBe(true);
    const lp = m.recuento.find((l) => l.lance === 'pares')!;
    expect(lp.equipo).toBe(0);
    expect(lp.total).toBe(1 + 2);
    expect(lp.partes.map((p) => p.motivo)).toEqual(['pareja', 'medias']);
  });

  it('12 · A con 38, B con 39: B gana la grande en paso → llega a 40 aunque A tuviera 6 de pares', () => {
    const m = manoFija(['Co Cc Ao Ac', 'Re Ce Se 7e', 'So Sc 4o 4c', '7b 6b 5b 4b'], { marcador: [38, 39] });
    m.actuar(0, NO_HAY_MUS);
    pasarTodo(m);
    expect(m.terminada).toBe(true);
    expect(m.finJuego).toEqual({ ganador: 1, motivo: 'recuento', lance: 'grande' });
    expect(m.marcador).toEqual([38, 40]);
    // El recuento se paró en la grande: los pares de A no llegaron a sumarse.
    const recuentos = m.eventos.filter((e): e is Extract<EventoMus, { tipo: 'recuento' }> => e.tipo === 'recuento');
    expect(recuentos).toHaveLength(1);
    expect(recuentos[0].linea.lance).toBe('grande');
  });

  it('13 · nadie tiene juego → punto; en paso +1; querido a 2 → +3', () => {
    const manos: [string, string, string, string] = ['Ro 7o 6o 5o', 'Rc 7c 6c 4c', 'Re 7e 5e 4e', 'Cb 6b 5b 4b'];
    const enPaso = manoFija(manos);
    enPaso.actuar(0, NO_HAY_MUS);
    pasarTodo(enPaso);
    expect(enPaso.hayJuego).toBe(false);
    const lpPaso = enPaso.recuento.find((l) => l.lance === 'punto')!;
    expect(lpPaso).toMatchObject({ equipo: 0, total: 1 });

    const querido = manoFija(manos);
    querido.actuar(0, NO_HAY_MUS);
    pasarLance(querido); // grande
    pasarLance(querido); // chica
    expect(querido.lance).toBe('punto');
    jugar(querido, [
      [0, envido(2)],
      [1, QUIERO],
    ]);
    const lpQuerido = querido.recuento.find((l) => l.lance === 'punto')!;
    expect(lpQuerido).toMatchObject({ equipo: 0, total: 3 });
    // Grande (A +1 en paso), chica (B +1 en paso), punto querido (A +3).
    expect(querido.marcador).toEqual([4, 1]);
  });

  it('14 · en pares, envite rechazado → +1 inmediato y el que envidó cobra además sus pares', () => {
    const m = manoFija(['Ro Rc 5o 4o', 'Co Cc 6c 4c', '7e 6e 5e Ae', '7b 6b 5b Sb']);
    m.actuar(0, NO_HAY_MUS);
    pasarLance(m);
    pasarLance(m);
    expect(m.lance).toBe('pares');
    expect(m.pendiente()).toMatchObject({ jugador: 0 });
    jugar(m, [
      [0, envido(2)],
      [1, NO_QUIERO],
    ]);
    // Deje en el acto.
    const deje = m.eventos.find((e) => e.tipo === 'deje');
    expect(deje).toMatchObject({ equipo: 0, piedras: 1, marcador: [1, 0] });
    pasarTodo(m);
    const lp = m.recuento.find((l) => l.lance === 'pares')!;
    expect(lp.equipo).toBe(0);
    expect(lp.partes).toEqual([
      { piedras: 1, motivo: 'deje', cobradoAntes: true },
      { piedras: 1, motivo: 'pareja', jugador: 0 },
    ]);
    expect(lp.total).toBe(1);
  });

  it('en pares sólo hablan los que tienen jugada', () => {
    const m = manoFija(['Ro Rc 5o 4o', '7c 6c 5c 4c', '7e 6e 5e Ae', 'Co Cc 6b Sb']);
    m.actuar(0, NO_HAY_MUS);
    pasarLance(m);
    pasarLance(m);
    expect(m.apuesta?.participantes).toEqual([0, 3]);
    jugar(m, [
      [0, envido(2)],
      [3, QUIERO],
    ]);
    pasarTodo(m);
    const lp = m.recuento.find((l) => l.lance === 'pares')!;
    expect(lp).toMatchObject({ equipo: 0, total: 2 + 1 });
  });

  it('juego: la 31 vale 3 y el resto 2; el equipo ganador cobra por cada miembro', () => {
    // 0: 31 (R C S A), 2: 32 (R R 6 6... con 8 reyes 3 = 10), 1: 33, 3: sin juego.
    const m = manoFija(['Ro Co So Ao', '7c 6c Rc Sc', 'Re 3e 6e 6o', 'Ab 2b 4b 5b']);
    m.actuar(0, NO_HAY_MUS);
    pasarTodo(m);
    const lj = m.recuento.find((l) => l.lance === 'juego')!;
    expect(lj.equipo).toBe(0);
    expect(lj.partes).toEqual([
      { piedras: 3, motivo: 'juego31', jugador: 0, suma: 31 },
      { piedras: 2, motivo: 'juego', jugador: 2, suma: 32 },
    ]);
  });
});

describe('4.10 · mus y descartes', () => {
  it('15 · mazo agotado durante los descartes → se rebarajan sin duplicar cartas', () => {
    const m = new ManoMus({ config: crearConfig(), postre: 3, marcador: [0, 0], rng: mulberry32(99) });
    let rebarajadas = 0;
    for (let ronda = 0; ronda < 6; ronda++) {
      for (const s of m.orden) m.actuar(s, MUS);
      for (const s of m.orden) m.actuar(s, { tipo: 'descarte', cartas: [...m.manos[s]] });
      m.comprobarInvariante();
      const enMano = m.manos.flat();
      expect(new Set(enMano).size).toBe(16);
      expect(m.mazo.length + m.descartes.length + enMano.length).toBe(TOTAL_CARTAS);
      rebarajadas += m.sacarEventos().filter((e) => e.tipo === 'rebarajar_descartes').length;
    }
    expect(rebarajadas).toBeGreaterThan(0);
  });

  it('el primer «no hay mus» corta y los demás ya no hablan', () => {
    const m = manoFija([RELLENO_A, 'Ro Rc 5c 4c', RELLENO_B, 'Ao Ae 6e 4e']);
    jugar(m, [
      [0, MUS],
      [1, NO_HAY_MUS],
    ]);
    expect(m.lance).toBe('grande');
    expect(m.pendiente()).toMatchObject({ tipo: 'apuesta', jugador: 0 });
  });

  it('hay que descartar entre 1 y 4 cartas propias', () => {
    const m = manoFija([RELLENO_A, 'Ro Rc 5c 4c', RELLENO_B, 'Ao Ae 6e 4e']);
    for (const s of m.orden) m.actuar(s, MUS);
    expect(() => m.actuar(0, { tipo: 'descarte', cartas: [] })).toThrow();
    expect(() => m.actuar(0, { tipo: 'descarte', cartas: cartas('Ro') })).toThrow();
    m.actuar(0, { tipo: 'descarte', cartas: cartas('Rb') });
    expect(m.descartesPorRonda[0][0]).toBe(1);
  });

  it('mus corrido: en la primera mano del juego la mano avanza cada vez que todos piden mus', () => {
    const m = new ManoMus({
      config: crearConfig({ musCorrido: true }),
      postre: 3,
      marcador: [0, 0],
      rng: mulberry32(5),
      primeraDelJuego: true,
    });
    expect(m.mano).toBe(0);
    for (const s of m.orden) m.actuar(s, MUS);
    for (const s of m.orden) m.actuar(s, { tipo: 'descarte', cartas: [m.manos[s][0]] });
    expect(m.mano).toBe(1);
    expect(m.postre).toBe(0);
    expect(m.pendiente()).toMatchObject({ tipo: 'mus', jugador: 1 });
  });
});
