import { describe, expect, it } from 'vitest';
import { simular } from '../src/ai/arena';
import { decidirApuesta, jugadaMaxima } from '../src/ai/bet';
import { elegirDescarte } from '../src/ai/discard';
import { crearJugadorPorDefecto } from '../src/ai/fabrica';
import { decidirMus } from '../src/ai/musDecision';
import { PERSONALIDAD_NEUTRA, type PerfilIA } from '../src/ai/personalities';
import { vistaPara } from '../src/ai/view';
import { EstimadorMonteCarlo } from '../src/ai/montecarlo';
import { ManoMus } from '../src/mus/handState';
import { mulberry32 } from '../src/core/rng';
import { rango } from '../src/mus/cards';
import { crearConfig, type Seat } from '../src/mus/config';
import type { Decision } from '../src/mus/types';
import { cartas, envido, jugar, manoFija, MUS, NO_HAY_MUS, ORDAGO } from './helpers';

const perfil = (extra: Partial<PerfilIA> = {}): PerfilIA => ({
  personalidad: PERSONALIDAD_NEUTRA,
  dificultad: 'normal',
  nombre: 'test',
  ...extra,
});

describe('IA heurística', () => {
  it('2.000 manos IA Fácil contra IA Fácil sin errores y con marcador coherente', () => {
    const rng = mulberry32(3);
    const st = simular({
      manos: 2000,
      config: crearConfig(),
      rng,
      crearJugadores: (p) =>
        [0, 1, 2, 3].map((s) => crearJugadorPorDefecto(s as Seat, mulberry32(p * 10 + s), 'facil')),
    });
    expect(st.manos).toBe(2000);
    expect(st.juegos).toBeGreaterThan(50);
  });

  it('500 manos con Monte Carlo (Normal contra Difícil) sin errores', () => {
    const rng = mulberry32(4);
    const st = simular({
      manos: 500,
      config: crearConfig(),
      rng,
      crearJugadores: (p) =>
        [0, 1, 2, 3].map((s) =>
          crearJugadorPorDefecto(s as Seat, mulberry32(p * 10 + s), s % 2 ? 'dificil' : 'normal'),
        ),
    });
    expect(st.manos).toBe(500);
  });

  it('Monte Carlo: menos de 30 ms por decisión incluso con 800 muestras', () => {
    const est = new EstimadorMonteCarlo(800, mulberry32(9));
    let max = 0;
    for (let i = 0; i < 30; i++) {
      const m = new ManoMus({ config: crearConfig(), postre: 3, marcador: [0, 0], rng: mulberry32(100 + i) });
      m.actuar(0, NO_HAY_MUS);
      const t0 = performance.now();
      est.estimar(vistaPara(m, 1));
      max = Math.max(max, performance.now() - t0);
    }
    expect(max).toBeLessThan(30);
  });

  it('Monte Carlo respeta las declaraciones: si nadie más tiene pares, gano pares seguro', () => {
    const m = manoFija(['Ro Rc 5o 4e', '7c 6c 5c 4c', '7e 6e 5e Ae', 'Co Sc 6b 2b']);
    m.actuar(0, NO_HAY_MUS);
    for (let i = 0; i < 8; i++) {
      const d = m.pendiente();
      if (!d || d.tipo !== 'apuesta' || d.lance === 'pares' || m.declaraciones.pares) break;
      m.actuar(d.jugador, { tipo: 'paso' });
    }
    expect(m.declaraciones.pares).not.toBeNull();
    const r = new EstimadorMonteCarlo(200, mulberry32(1)).estimar(vistaPara(m, 0));
    expect(r.p.pares).toBe(1);
  });

  it('con duples o con 31 y otra baza siempre corta el mus', () => {
    const rng = mulberry32(1);
    const duples = manoFija(['Ro Rc Ao Ac', '7c 6c 5c 4c', '7e 6e 5e Ae', 'Co Cc 6b Sb']);
    expect(decidirMus(vistaPara(duples, 0), perfil(), rng).mus).toBe(false);
    const treintayuna = manoFija(['Ro Rc So Ac', '7c 6c 5c 4c', '7e 6e 5e Ae', 'Co Cc 6b Sb']);
    expect(decidirMus(vistaPara(treintayuna, 0), perfil(), rng).mus).toBe(false);
  });

  it('con una mano horrible pide mus', () => {
    const m = manoFija(['7o 6c 5e 4b', 'Rc Cc 5c 4c', '7e 6e 5o Ae', 'Co Ce 6b Sb']);
    expect(decidirMus(vistaPara(m, 0), perfil(), mulberry32(2)).mus).toBe(true);
  });

  it('al descartar con dos reyes, se queda los reyes', () => {
    const m = manoFija(['Ro Rc 5o 4e', '7c 6c 5c 4c', '7e 6e 5e Ae', 'Co Cc 6b Sb']);
    for (const s of m.orden) m.actuar(s, MUS);
    const tira = elegirDescarte(vistaPara(m, 0), perfil(), mulberry32(4));
    expect(tira.length).toBeGreaterThan(0);
    expect(tira.every((c) => rango(c, 8) !== 12)).toBe(true);
  });

  it('«Clásico 96»: en Fácil los rivales rechazan el órdago salvo con jugada máxima', () => {
    const m = manoFija(['Rb 7b 6b 5b', 'Ro Rc Re Cc', 'Cb 7o 6o 4b', 'Ao Ae 6e 4e']);
    jugar(m, [
      [0, NO_HAY_MUS],
      [0, ORDAGO],
    ]);
    const d = m.pendiente() as Extract<Decision, { tipo: 'apuesta' }>;
    expect(d.jugador).toBe(1);
    // Aunque tenga tres reyes y un caballo (p altísima), se achanta.
    const r = decidirApuesta(vistaPara(m, 1), d, 0.95, perfil({ dificultad: 'facil' }), mulberry32(1));
    expect(r.accion.tipo).toBe('noQuiero');
    expect(jugadaMaxima(cartas('Ro Rc Re Rb'), 'grande', 8)).toBe(true);
    // En Normal, con esa p, lo quiere.
    const n = decidirApuesta(vistaPara(m, 1), d, 0.95, perfil(), mulberry32(1));
    expect(n.accion.tipo).toBe('quiero');
  });

  it('el compañero IA no decide por el humano: ante un envite deja contestar al humano', () => {
    // Postre 0 → mano 1. Habla 1, 2, 3, 0. El 1 envida: responde primero el 2 (IA) y luego el 0 (humano).
    const m = manoFija(['Rb 7b 6b 5b', 'Ro Rc Re Cc', 'Cb 7o 6o 4b', 'Ao Ae 6e 4e'], { postre: 0 });
    jugar(m, [
      [1, NO_HAY_MUS],
      [1, envido(2)],
    ]);
    const d = m.pendiente() as Extract<Decision, { tipo: 'apuesta' }>;
    expect(d.jugador).toBe(2);
    const r = decidirApuesta(vistaPara(m, 2), d, 0.6, perfil({ companeroDeHumano: true }), mulberry32(1), {
      companeroHumano: true,
    });
    expect(r.accion.tipo).toBe('noQuiero');
    expect(r.motivo).toMatch(/compañero/);
  });
});
