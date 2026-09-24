// Carga de recursos opcionales: si existe arte final en assets/sprites/ (listado en
// sprites/manifest.json) se usa; si no, el generador de placeholders. Igual con las voces.

import type { Vista } from '../art/placeholderGen';
import { hojaDesdeAseprite, hojaPlaceholder, type HojaSprites } from '../art/spriteSheet';
import { NICANOR, PERSONAJES, type IdPersonaje } from '../data/characters';

interface Manifiesto {
  sprites: string[];
  voces: Record<string, string[]>;
}

const manifiesto: Manifiesto = { sprites: [], voces: {} };
const imagenes = new Map<string, { img: HTMLImageElement; json: unknown }>();
const hojas = new Map<string, HojaSprites>();

async function cargarJson<T>(url: string): Promise<T | null> {
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

function cargarImagen(url: string): Promise<HTMLImageElement | null> {
  return new Promise((ok) => {
    const img = new Image();
    img.onload = () => ok(img);
    img.onerror = () => ok(null);
    img.src = url;
  });
}

/** Lee los manifiestos (si no existen, todo son placeholders) y precarga los PNG. */
export async function cargarRecursos(): Promise<void> {
  const sprites = await cargarJson<{ sprites: string[] }>('sprites/manifest.json');
  const voces = await cargarJson<{ voces: Record<string, string[]> }>('voices/manifest.json');
  manifiesto.sprites = sprites?.sprites ?? [];
  manifiesto.voces = voces?.voces ?? {};
  await Promise.all(
    manifiesto.sprites.map(async (id) => {
      const [img, json] = await Promise.all([
        cargarImagen(`sprites/${id}.png`),
        cargarJson<unknown>(`sprites/${id}.json`),
      ]);
      if (img && json) imagenes.set(id, { img, json });
    }),
  );
}

export function hojaPersonaje(id: IdPersonaje | 'nicanor', vista: Vista, espejo = false): HojaSprites {
  const clave = `${id}|${vista}|${espejo ? 1 : 0}`;
  const hecha = hojas.get(clave);
  if (hecha) return hecha;
  const aspecto = id === 'nicanor' ? NICANOR.aspecto : PERSONAJES[id].aspecto;
  const placeholder = hojaPlaceholder(aspecto, vista, espejo);
  let hoja = placeholder;
  const final = imagenes.get(id);
  if (final) {
    const h = hojaDesdeAseprite(final.img, final.json as never, vista, espejo);
    // Completa lo que falte con el placeholder.
    for (const [n, c] of placeholder.frames) if (!h.frames.has(n)) h.frames.set(n, c);
    hoja = h;
  }
  hojas.set(clave, hoja);
  return hoja;
}

/** Rutas de voces grabadas disponibles para un personaje y evento. */
export function vocesGrabadas(personaje: string, evento: string): string[] {
  return manifiesto.voces[`${personaje}/${evento}`] ?? [];
}
