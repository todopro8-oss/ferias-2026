import { describe, expect, it } from 'vitest';
import { JugadorAleatorio } from '../src/ai/aleatoria';
import { simular } from '../src/ai/arena';
import { mulberry32 } from '../src/core/rng';
import { crearConfig } from '../src/mus/config';

describe('4.10 · propiedades', () => {
  it('17 · 10.000 manos aleatorias sin excepciones y con marcador coherente', () => {
    const rng = mulberry32(2026);
    const st = simular({
      manos: 10_000,
      config: crearConfig(),
      rng,
      crearJugadores: () => [0, 1, 2, 3].map(() => new JugadorAleatorio(rng)),
    });
    expect(st.manos).toBe(10_000);
    expect(st.juegos).toBeGreaterThan(0);
    expect(st.rebarajados).toBeGreaterThan(0);
    expect(st.ordagos.aceptados).toBeGreaterThan(0);
    expect(st.finJuego.deje + st.finJuego.ordago + st.finJuego.recuento).toBe(st.juegos);
  });

  it('también con 4 reyes, a 30 y al mejor de 3 con mus corrido', () => {
    const rng = mulberry32(7);
    const st = simular({
      manos: 2_000,
      config: crearConfig({ reyes: 4, puntosJuego: 30, juegosPartida: 3, musCorrido: true }),
      rng,
      crearJugadores: () => [0, 1, 2, 3].map(() => new JugadorAleatorio(rng)),
    });
    expect(st.manos).toBe(2_000);
    expect(st.partidas).toBeGreaterThan(0);
  });
});
