// Hojas de sprites de personaje. El formato en disco es el de la exportación JSON de
// Aseprite (frames con x, y, w, h, duration y frameTags). Los nombres de frame son
// «<vista>:<fotograma>», p. ej. «frontal:idle0» o «tresCuartos:sena_guino1».

import { crearLienzo } from '../core/pantalla';
import type { Aspecto } from '../data/characters';
import { ETIQUETAS, generarHoja, TAMANO_VISTA, type Etiqueta, type Vista } from './placeholderGen';

export interface HojaSprites {
  vista: Vista;
  w: number;
  h: number;
  frames: Map<string, HTMLCanvasElement>;
  etiquetas: Map<string, Etiqueta>;
  /** true si viene de un PNG de arte final. */
  final: boolean;
}

export function hojaPlaceholder(aspecto: Aspecto, vista: Vista, espejo = false): HojaSprites {
  const g = generarHoja(aspecto, vista);
  const frames = new Map<string, HTMLCanvasElement>();
  for (const [n, px] of Object.entries(g.frames)) frames.set(n, (espejo ? px.espejado() : px).aCanvas());
  return { vista, w: g.w, h: g.h, frames, etiquetas: new Map(ETIQUETAS.map((e) => [e.nombre, e])), final: false };
}

/** Estructura mínima del JSON de Aseprite que entendemos. */
interface JsonAseprite {
  frames: Record<string, { frame: { x: number; y: number; w: number; h: number }; duration?: number }>;
  meta?: { frameTags?: { name: string; from: number; to: number; direction?: string }[] };
}

export function hojaDesdeAseprite(
  img: HTMLImageElement,
  json: JsonAseprite,
  vista: Vista,
  espejo = false,
): HojaSprites {
  const { w, h } = TAMANO_VISTA[vista];
  const frames = new Map<string, HTMLCanvasElement>();
  const orden: string[] = [];
  const duraciones: number[] = [];
  for (const [nombre, f] of Object.entries(json.frames)) {
    const [v, n] = nombre.includes(':') ? nombre.split(':') : [vista, nombre.replace(/\.(png|ase|aseprite)$/, '')];
    if (v !== vista) continue;
    const { canvas, ctx } = crearLienzo(w, h);
    if (espejo) {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(img, f.frame.x, f.frame.y, f.frame.w, f.frame.h, 0, h - f.frame.h, f.frame.w, f.frame.h);
    frames.set(n, canvas);
    orden.push(n);
    duraciones.push(f.duration ?? 100);
  }
  const etiquetas = new Map(ETIQUETAS.map((e) => [e.nombre, e]));
  for (const t of json.meta?.frameTags ?? []) {
    const [v, nombre] = t.name.includes(':') ? t.name.split(':') : [vista, t.name];
    if (v !== vista) continue;
    etiquetas.set(nombre, {
      nombre,
      frames: orden.slice(t.from, t.to + 1),
      duraciones: duraciones.slice(t.from, t.to + 1),
      bucle: nombre === 'idle' || nombre === 'hablar' || nombre.startsWith('sena_'),
    });
  }
  // Si al arte final le falta algún fotograma, se completa con los del placeholder.
  return { vista, w, h, frames, etiquetas, final: true };
}

/** Exporta una hoja placeholder como PNG + JSON de Aseprite (para que los artistas la usen de plantilla). */
export function exportarPlantilla(aspecto: Aspecto): { png: HTMLCanvasElement; json: JsonAseprite } {
  const vistas: Vista[] = ['frontal', 'tresCuartos'];
  const hojas = vistas.map((v) => generarHoja(aspecto, v));
  const nombres = Object.keys(hojas[0].frames);
  const ancho = nombres.length * 64;
  const { canvas, ctx } = crearLienzo(ancho, 72 + 76);
  const json: JsonAseprite = { frames: {}, meta: { frameTags: [] } };
  hojas.forEach((hoja, fila) => {
    const y = fila === 0 ? 0 : 72;
    nombres.forEach((n, i) => {
      hoja.frames[n].volcar(ctx, i * 64, y);
      json.frames[`${hoja.vista}:${n}`] = { frame: { x: i * 64, y, w: hoja.w, h: hoja.h }, duration: 100 };
    });
  });
  return { png: canvas, json };
}
