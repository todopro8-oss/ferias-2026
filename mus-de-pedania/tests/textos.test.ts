import { describe, expect, it } from 'vitest';
import { envolver, tieneGlifo } from '../src/core/bitmapFont';
import { IDS_PERSONAJES } from '../src/data/characters';
import { CAMEOS, EVENTOS_VOZ, LINEAS, LINEAS_NICANOR } from '../src/data/lines.es';

/** Eventos que se muestran en pantallas con más sitio (selección, fin de partida). */
const DE_PANTALLA = new Set(['presentacion', 'victoria', 'derrota']);

function rellenar(l: string): string {
  return l.replaceAll('{n}', 'cuatro').replaceAll('{N}', 'Cuatro');
}

describe('líneas de voz', () => {
  it('al menos 4 variantes por evento y personaje', () => {
    for (const id of IDS_PERSONAJES) {
      for (const ev of EVENTOS_VOZ) {
        expect(LINEAS[id][ev].length, `${id}.${ev}`).toBeGreaterThanOrEqual(4);
      }
    }
  });

  it('las líneas de mesa caben en un bocadillo de 2 líneas de 22 caracteres', () => {
    const malas: string[] = [];
    for (const id of IDS_PERSONAJES) {
      for (const ev of EVENTOS_VOZ) {
        if (DE_PANTALLA.has(ev)) continue;
        for (const l of LINEAS[id][ev]) if (envolver(rellenar(l), 22).length > 2) malas.push(`${id}.${ev}: ${l}`);
      }
    }
    for (const l of [...LINEAS_NICANOR, ...CAMEOS.flatMap((c) => c.lineas)]) {
      if (envolver(l, 22).length > 3) malas.push(`extra: ${l}`);
    }
    expect(malas).toEqual([]);
  });

  it('las líneas de pantalla caben en 4 líneas de 30 caracteres', () => {
    for (const id of IDS_PERSONAJES) {
      for (const ev of DE_PANTALLA) {
        for (const l of LINEAS[id][ev as 'victoria']) expect(envolver(l, 30).length, l).toBeLessThanOrEqual(4);
      }
    }
  });

  it('todos los caracteres tienen glifo en la fuente bitmap', () => {
    const faltan = new Set<string>();
    for (const id of IDS_PERSONAJES)
      for (const ev of EVENTOS_VOZ)
        for (const l of LINEAS[id][ev]) for (const ch of l) if (!tieneGlifo(ch)) faltan.add(ch);
    expect([...faltan]).toEqual([]);
  });
});
