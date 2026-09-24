// Generador pseudoaleatorio con semilla. Todo el motor y la IA reciben un `Rng`
// inyectado, de modo que una misma semilla reproduce la misma partida.

/** Devuelve un número en [0, 1). */
export type Rng = () => number;

/** mulberry32: rápido, 32 bits de estado, suficiente para barajar y simular. */
export function mulberry32(semilla: number): Rng {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Entero uniforme en [0, n). */
export function randInt(rng: Rng, n: number): number {
  return Math.floor(rng() * n);
}

/** Entero uniforme en [min, max] (ambos incluidos). */
export function randRango(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

export function elegir<T>(rng: Rng, lista: readonly T[]): T {
  if (lista.length === 0) throw new Error('elegir: lista vacía');
  return lista[randInt(rng, lista.length)];
}

/** Fisher-Yates en el sitio. Devuelve el mismo array por comodidad. */
export function barajarEnSitio<T>(lista: T[], rng: Rng): T[] {
  for (let i = lista.length - 1; i > 0; i--) {
    const j = randInt(rng, i + 1);
    const tmp = lista[i];
    lista[i] = lista[j];
    lista[j] = tmp;
  }
  return lista;
}

/** Hash FNV-1a de un texto: semilla estable para, por ejemplo, el balbuceo de una línea. */
export function semillaDeTexto(texto: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Deriva una semilla nueva a partir de un Rng (para dar a cada subsistema su propio flujo). */
export function derivarSemilla(rng: Rng): number {
  return Math.floor(rng() * 4294967296) >>> 0;
}
