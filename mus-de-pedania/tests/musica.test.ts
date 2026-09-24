import { describe, expect, it } from 'vitest';
import { CANCIONES, CHARANGA, DERROTA, POPURRI, VICTORIA } from '../src/audio/songs';
import { compilar, validar } from '../src/audio/sequencer';
import { coeficientes, frecuenciaDeNota, periodoConFeedback } from '../src/audio/synth';

describe('música', () => {
  it('todas las canciones cuadran compás a compás', () => {
    for (const c of Object.values(CANCIONES)) expect(validar(c), c.nombre).toEqual([]);
  });

  it('duraciones: popurrí 60-90 s, victoria ~5 s, derrota ~4 s, charanga ~20 s', () => {
    const d = (c: typeof POPURRI) => compilar(c).duracion;
    expect(d(POPURRI)).toBeGreaterThanOrEqual(60);
    expect(d(POPURRI)).toBeLessThanOrEqual(90);
    expect(d(VICTORIA)).toBeGreaterThan(3);
    expect(d(VICTORIA)).toBeLessThan(6);
    expect(d(DERROTA)).toBeGreaterThan(2.5);
    expect(d(DERROTA)).toBeLessThan(5);
    expect(d(CHARANGA)).toBeGreaterThan(17);
    expect(d(CHARANGA)).toBeLessThan(23);
  });

  it('las notas se entienden', () => {
    expect(frecuenciaDeNota('A4')).toBeCloseTo(440);
    expect(frecuenciaDeNota('A5')).toBeCloseTo(880);
    expect(frecuenciaDeNota('C#5')).toBeCloseTo(554.37, 1);
    expect(frecuenciaDeNota('Bb3')).toBeCloseTo(233.08, 1);
    for (const c of Object.values(CANCIONES)) {
      for (const e of compilar(c).eventos) {
        if (e.instrumento === 'percusion') continue;
        for (const n of e.notas) expect(() => frecuenciaDeNota(n), `${c.nombre}: ${n}`).not.toThrow();
      }
    }
  });

  it('ondas OPL: el seno puro sólo tiene fundamental; la realimentación añade armónicos', () => {
    const seno = coeficientes(periodoConFeedback(0, 0));
    expect(seno.imag[1]).toBeCloseTo(1, 2);
    expect(Math.abs(seno.imag[2])).toBeLessThan(1e-3);
    const fb = coeficientes(periodoConFeedback(0, 6));
    expect(Math.hypot(fb.real[2], fb.imag[2])).toBeGreaterThan(0.05);
  });
});

import { duracionBalbuceo, silabas, cuantizar8bits } from '../src/audio/babble';
import { PERSONAJES } from '../src/data/characters';
import { generarSfx, NOMBRES_SFX } from '../src/audio/sfx';

describe('voces y efectos', () => {
  it('el balbuceo sale de las sílabas del texto y es determinista', () => {
    const voz = PERSONAJES.rufi.voz;
    const s = silabas('¡Mus, cariño!', voz);
    expect(s.map((x) => x.vocal)).toEqual(['u', 'a', 'i', 'o']);
    expect(silabas('¡Mus, cariño!', voz)).toEqual(s);
    // Anselmo habla más despacio que la Rufi.
    expect(duracionBalbuceo('Envido, y no me mires así.', PERSONAJES.anselmo.voz)).toBeGreaterThan(
      duracionBalbuceo('Envido, y no me mires así.', PERSONAJES.rufi.voz),
    );
    // El alguacil alarga la última vocal.
    const j = silabas('Que conste.', PERSONAJES.julian.voz);
    expect(j[j.length - 1].dur).toBeGreaterThan(j[0].dur * 1.5);
  });

  it('las preguntas suben al final', () => {
    const voz = PERSONAJES.tomasin.voz;
    const p = silabas('¿Aquí se puede comer?', voz);
    const a = silabas('Aquí se puede comer.', voz);
    expect(p[p.length - 1].tono).toBeGreaterThan(a[a.length - 1].tono);
  });

  it('filtro Sound Blaster: 8 bits', () => {
    const d = new Float32Array([0.123456, -0.5, 0.999]);
    cuantizar8bits(d);
    for (const v of d) expect(Math.round(v * 127)).toBeCloseTo(v * 127, 5);
  });

  it('todos los efectos se generan sin saturar', () => {
    for (const n of NOMBRES_SFX) {
      const d = generarSfx(n);
      let pico = 0;
      for (const v of d) pico = Math.max(pico, Math.abs(v));
      expect(pico, n).toBeGreaterThan(0.05);
      expect(pico, n).toBeLessThanOrEqual(1);
    }
  });
});
