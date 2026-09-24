import { describe, expect, it } from 'vitest';
import { EstimadorMonteCarlo } from '../src/ai/montecarlo';
import { decidirMus } from '../src/ai/musDecision';
import { PERSONALIDAD_NEUTRA } from '../src/ai/personalities';
import { duracionSena, elegirSenaIA, probabilidadCaza, senasVerdaderas } from '../src/ai/senas';
import { vistaPara, type SenaVista } from '../src/ai/view';
import { mulberry32 } from '../src/core/rng';
import { cartas, manoFija, NO_HAY_MUS } from './helpers';

describe('7 · señas', () => {
  it('cada mano tiene sus señas verdaderas (con 8 reyes el 3 es rey y el 2 es as)', () => {
    expect(senasVerdaderas(cartas('Ro 3c Ao 2c'), 8, false)).toEqual(['cejas', 'labio', 'lengua']);
    expect(senasVerdaderas(cartas('Ro Cc Se Ab'), 8, false)).toEqual(['guino']);
    expect(senasVerdaderas(cartas('7o 7c 7e So'), 8, false)).toEqual(['guino', 'torcer']);
    expect(senasVerdaderas(cartas('7o 6c 5e 4b'), 8, false)).toEqual([]);
    expect(senasVerdaderas(cartas('7o 6c 5e 4b'), 8, true)).toEqual(['ciego']);
    expect(senasVerdaderas(cartas('Ro Rc 3e 4b'), 8, true)).toContain('tresReyes');
  });

  it('la IA hace seña con probabilidad «franqueza» y enseña la más valiosa', () => {
    const mano = cartas('Ro Rc Ao Ac');
    expect(elegirSenaIA(mano, 8, false, { ...PERSONALIDAD_NEUTRA, fra: 0 }, mulberry32(1))).toBeNull();
    expect(elegirSenaIA(mano, 8, false, { ...PERSONALIDAD_NEUTRA, fra: 1 }, mulberry32(1))).toBe('cejas');
  });

  it('modo clásico 1200 ms, discreto 350 ms', () => {
    expect(duracionSena('clasico')).toBe(1200);
    expect(duracionSena('discreto')).toBe(350);
  });

  it('probabilidad de cazar: vista × dificultad (tope 0,95) × (clásico ? 1 : 0,45 · …)', () => {
    const obs = { ...PERSONALIDAD_NEUTRA, vis: 0.8 };
    expect(probabilidadCaza(obs, 'facil', 'clasico')).toBeCloseTo(0.4);
    expect(probabilidadCaza(obs, 'normal', 'clasico')).toBeCloseTo(0.8);
    expect(probabilidadCaza(obs, 'dificil', 'clasico')).toBeCloseTo(0.95);
    const discreto = probabilidadCaza(obs, 'normal', 'discreto', { ...PERSONALIDAD_NEUTRA, dis: 0.2 });
    expect(discreto).toBeCloseTo(0.8 * 0.45 * 1.0);
    // Cuanto más disimula el que la hace, menos se le caza.
    expect(probabilidadCaza(obs, 'normal', 'discreto', { ...PERSONALIDAD_NEUTRA, dis: 0.8 })).toBeLessThan(discreto);
    expect(probabilidadCaza(obs, 'normal', 'off')).toBe(0);
  });

  it('una seña del humano cambia lo que calcula su compañero IA', () => {
    const m = manoFija(['Ro Rc Ao Ac', '7c 6c 5c 4c', 'Se 6e 5e 4e', 'Co Cc 6b Sb']);
    m.actuar(0, NO_HAY_MUS);
    const sin = new EstimadorMonteCarlo(400, mulberry32(3)).estimar(vistaPara(m, 2));
    const senas: SenaVista[] = [{ de: 0, significado: 'duples', deCompanero: true }];
    const con = new EstimadorMonteCarlo(400, mulberry32(3)).estimar(vistaPara(m, 2, { senas }));
    expect(con.p.pares).toBeGreaterThan(sin.p.pares + 0.2);
    const reyes: SenaVista[] = [{ de: 0, significado: 'reyes', deCompanero: true }];
    const conReyes = new EstimadorMonteCarlo(400, mulberry32(3)).estimar(vistaPara(m, 2, { senas: reyes }));
    expect(conReyes.p.grande).toBeGreaterThan(sin.p.grande + 0.15);
  });

  it('una seña cazada al rival le baja la confianza a quien la caza', () => {
    const m = manoFija(['Ro 7o 5o 4e', '7c 6c 5c 4c', 'Se 6e 5e 4b', 'Co Cc 6b Sb']);
    m.actuar(0, NO_HAY_MUS);
    const sin = new EstimadorMonteCarlo(400, mulberry32(5)).estimar(vistaPara(m, 0));
    const senas: SenaVista[] = [{ de: 3, significado: 'reyes', deCompanero: false }];
    const con = new EstimadorMonteCarlo(400, mulberry32(5)).estimar(vistaPara(m, 0, { senas }));
    expect(con.p.grande).toBeLessThan(sin.p.grande - 0.1);
  });

  it('con seña de jugada del compañero, la IA corta el mus antes', () => {
    const m = manoFija(['7o 6c 5e 4b', 'Rc Cc 5c 4c', 'Ro So 5o Ae', 'Co Ce 6b Sb']);
    const perfil = { personalidad: PERSONALIDAD_NEUTRA, dificultad: 'normal' as const, nombre: 't' };
    const sin = decidirMus(vistaPara(m, 2), perfil, mulberry32(1));
    const con = decidirMus(
      vistaPara(m, 2, { senas: [{ de: 0, significado: 'duples', deCompanero: true }] }),
      perfil,
      mulberry32(1),
    );
    expect(con.umbral).toBeLessThan(sin.umbral);
  });
});
