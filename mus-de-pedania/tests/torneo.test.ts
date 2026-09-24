import { describe, expect, it } from 'vitest';
import { AlmacenMemoria, escribir, leer, usarAlmacen } from '../src/core/save';
import { PERSONAJES } from '../src/data/characters';
import { nuevoTorneo, registrarResultado, rivalesActuales } from '../src/data/tournament';

describe('torneo comarcal', () => {
  it('8 parejas; rivales formados con los 5 personajes restantes; la final, los de más nivel', () => {
    const t = nuevoTorneo('rufi', 'Paco', 42);
    expect(t.parejas).toHaveLength(8);
    const r1 = rivalesActuales(t)!;
    expect(r1).not.toContain('rufi');
    const conPersonajes = t.parejas.filter((p) => p.miembros);
    expect(conPersonajes).toHaveLength(3);
    const finalistas = t.parejas[4].miembros!;
    const nivelMin = Math.min(...finalistas.map((id) => PERSONAJES[id].nivel));
    for (const id of [...t.parejas[1].miembros!, ...t.parejas[2].miembros!]) {
      expect(PERSONAJES[id].nivel).toBeLessThanOrEqual(nivelMin);
    }
    // Pareja nueva cada ronda.
    expect(t.parejas[1].miembros).not.toEqual(t.parejas[2].miembros);
  });

  it('ganando se avanza a semis y final contra las parejas previstas, y se acaba campeón', () => {
    let t = nuevoTorneo('anselmo', 'Paco', 7);
    t = registrarResultado(t, true, [40, 22]);
    expect(t.rondaActual).toBe(1);
    expect(rivalesActuales(t)).toEqual(t.parejas[2].miembros);
    t = registrarResultado(t, true, [40, 30]);
    expect(t.rondaActual).toBe(2);
    expect(rivalesActuales(t)).toEqual(t.parejas[4].miembros);
    t = registrarResultado(t, true, [40, 39]);
    expect(t.campeon).toBe(true);
    expect(rivalesActuales(t)).toBeNull();
  });

  it('perdiendo quedas eliminado y el cuadro se completa', () => {
    let t = nuevoTorneo('julian', 'Paco', 9);
    t = registrarResultado(t, false, [31, 40]);
    expect(t.eliminado).toBe(true);
    expect(t.rondas[2][0].ganador).not.toBeNull();
    expect(rivalesActuales(t)).toBeNull();
  });

  it('el guardado es versionado y migra o descarta formatos viejos', () => {
    usarAlmacen(new AlmacenMemoria());
    escribir('musped.prueba', 2, { a: 1 });
    expect(leer('musped.prueba', 2, { a: 0 })).toEqual({ a: 1 });
    // Versión distinta sin migración → por defecto.
    expect(leer('musped.prueba', 3, { a: 0 })).toEqual({ a: 0 });
    // Con migración.
    expect(leer('musped.prueba', 3, { b: 0 }, (v, d) => (v === 2 ? { b: (d as { a: number }).a + 10 } : null))).toEqual(
      { b: 11 },
    );
    expect(leer('musped.prueba', 3, { b: 0 })).toEqual({ b: 11 });
  });
});
