import { describe, expect, it } from 'vitest';
import { vistaPara } from '../src/ai/view';
import type { Seat } from '../src/mus/config';
import { manoFija, NO_HAY_MUS, PASO } from './helpers';

describe('6.1 · vista filtrada', () => {
  it('la IA no puede acceder a cartas ajenas: su vista no depende de ellas', () => {
    // Mismas cartas para el asiento 1; las de los demás cambian por completo.
    const a = manoFija(['Rb 7b 6b 5b', 'Ro Rc 5c 4c', 'Cb 7o 6o 4b', 'Ao Ae 6e 4e']);
    const b = manoFija(['So Sc Se Sb', 'Ro Rc 5c 4c', '7c 7e 6c 6e', 'Co Cc Ce 5o']);
    for (const m of [a, b]) {
      m.actuar(0, NO_HAY_MUS);
      m.actuar(0, PASO);
    }
    const va = vistaPara(a, 1);
    const vb = vistaPara(b, 1);
    expect(va).toEqual(vb);
    expect(va.cartas).toEqual(a.manos[1]);
  });

  it('la vista sólo contiene las cartas propias', () => {
    const m = manoFija(['Rb 7b 6b 5b', 'Ro Rc 5c 4c', 'Cb 7o 6o 4b', 'Ao Ae 6e 4e']);
    for (const s of [0, 1, 2, 3] as Seat[]) {
      const v = vistaPara(m, s);
      const texto = JSON.stringify(v);
      expect(v.cartas).toEqual(m.manos[s]);
      expect(texto).not.toMatch(/manos/);
      expect(Object.keys(v)).not.toContain('mazo');
    }
  });

  it('modificar la vista no altera el motor', () => {
    const m = manoFija(['Rb 7b 6b 5b', 'Ro Rc 5c 4c', 'Cb 7o 6o 4b', 'Ao Ae 6e 4e']);
    const v = vistaPara(m, 0);
    v.cartas.pop();
    v.marcador[0] = 99;
    expect(m.manos[0]).toHaveLength(4);
    expect(m.marcador[0]).toBe(0);
  });
});
