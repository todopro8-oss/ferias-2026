// Guardado en localStorage con claves versionadas y migración (sección 14).
// Claves: musped.opciones, musped.torneo, musped.estadisticas.

export const CLAVES = {
  opciones: 'musped.opciones',
  torneo: 'musped.torneo',
  estadisticas: 'musped.estadisticas',
} as const;

interface Envoltorio<T> {
  v: number;
  datos: T;
}

type Almacen = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

/** Almacén en memoria para cuando localStorage no está disponible (tests, modo privado). */
export class AlmacenMemoria implements Almacen {
  private m = new Map<string, string>();
  getItem(k: string): string | null {
    return this.m.get(k) ?? null;
  }
  setItem(k: string, v: string): void {
    this.m.set(k, v);
  }
  removeItem(k: string): void {
    this.m.delete(k);
  }
}

let almacen: Almacen = new AlmacenMemoria();
try {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('musped.prueba', '1');
    localStorage.removeItem('musped.prueba');
    almacen = localStorage;
  }
} catch {
  // Sin localStorage: se guarda en memoria durante la sesión.
}

export function usarAlmacen(a: Almacen): void {
  almacen = a;
}

export type Migracion<T> = (version: number, datos: unknown) => T | null;

/**
 * Lee un valor guardado. Si la versión no coincide, se intenta migrar; si no se puede
 * (o el JSON está roto), se devuelve el valor por defecto.
 */
export function leer<T>(clave: string, version: number, porDefecto: T, migrar?: Migracion<T>): T {
  try {
    const bruto = almacen.getItem(clave);
    if (!bruto) return porDefecto;
    const env = JSON.parse(bruto) as Envoltorio<unknown>;
    if (typeof env !== 'object' || env === null || typeof env.v !== 'number') return porDefecto;
    if (env.v === version) return env.datos as T;
    const migrado = migrar?.(env.v, env.datos);
    if (migrado) {
      escribir(clave, version, migrado);
      return migrado;
    }
    return porDefecto;
  } catch {
    return porDefecto;
  }
}

export function escribir<T>(clave: string, version: number, datos: T): void {
  try {
    almacen.setItem(clave, JSON.stringify({ v: version, datos } satisfies Envoltorio<T>));
  } catch {
    // Almacenamiento lleno o bloqueado: el juego sigue sin guardar.
  }
}

export function borrar(clave: string): void {
  try {
    almacen.removeItem(clave);
  } catch {
    // nada
  }
}
