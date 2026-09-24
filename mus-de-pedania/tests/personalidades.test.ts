import { describe, expect, it } from 'vitest';
import { medirPerfil } from '../src/ai/perfilado';
import { PERSONAJES } from '../src/data/characters';

// H4: «cada personalidad se nota». Se mide con la IA Fácil (sin Monte Carlo) para que el test sea rápido;
// los parámetros de personalidad son los mismos en todas las dificultades.
describe('personalidades', () => {
  const medir = (id: keyof typeof PERSONAJES) =>
    medirPerfil(PERSONAJES[id].stats, PERSONAJES[id].estilo, 300, 11, 'facil');
  const canijo = medir('canijo');
  const pura = medir('pura');
  const anselmo = medir('anselmo');
  const rufi = medir('rufi');

  it('el Canijo echa muchos más órdagos que Pura y que Anselmo', () => {
    expect(canijo.ordagos).toBeGreaterThan(pura.ordagos * 2);
    expect(canijo.ordagos).toBeGreaterThan(anselmo.ordagos * 2);
  });

  it('la Rufi farolea más que Pura y que Anselmo', () => {
    expect(rufi.farolea).toBeGreaterThan(pura.farolea);
    expect(rufi.farolea).toBeGreaterThan(anselmo.farolea);
  });

  it('el Canijo corta el mus mucho antes que Pura (umbral 0,45 frente a 0,75)', () => {
    expect(canijo.corteMus).toBeGreaterThan(pura.corteMus + 0.1);
  });

  it('la Rufi envida más que Anselmo', () => {
    expect(rufi.envida).toBeGreaterThan(anselmo.envida);
  });
});
