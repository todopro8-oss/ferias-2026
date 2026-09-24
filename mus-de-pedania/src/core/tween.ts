// Suavizados y un animador sencillo basado en tiempo (ms).

export type Suavizado = (t: number) => number;

export const suave = {
  lineal: (t: number) => t,
  entrada: (t: number) => t * t,
  salida: (t: number) => 1 - (1 - t) * (1 - t),
  entradaSalida: (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  rebote: (t: number) => {
    const n = 7.5625;
    const d = 2.75;
    if (t < 1 / d) return n * t * t;
    if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
    if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375;
    return n * (t -= 2.625 / d) * t + 0.984375;
  },
  retroceso: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
} satisfies Record<string, Suavizado>;

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export interface Animacion {
  dur: number;
  retardo?: number;
  suavizado?: Suavizado;
  alEmpezar?: () => void;
  alActualizar?: (p: number) => void;
  alTerminar?: () => void;
  /** Se dibuja por encima de la escena mientras dura. */
  dibujar?: (ctx: CanvasRenderingContext2D, p: number) => void;
  /** Capa de dibujo: menor = más al fondo. */
  capa?: number;
}

interface AnimacionViva extends Animacion {
  t: number;
  empezada: boolean;
  p: number;
}

export class Animador {
  private vivas: AnimacionViva[] = [];
  /** Multiplicador de velocidad (x10 en la prueba de resistencia). */
  velocidad = 1;

  agregar(a: Animacion): Animacion {
    this.vivas.push({ ...a, t: 0, empezada: false, p: 0 });
    return a;
  }

  get ocupado(): boolean {
    return this.vivas.length > 0;
  }

  get cuantas(): number {
    return this.vivas.length;
  }

  actualizar(dt: number): void {
    const paso = dt * this.velocidad;
    const actuales = this.vivas;
    // Las animaciones que se añadan mientras tanto (al terminar otra) van a la lista nueva.
    this.vivas = [];
    const siguen: AnimacionViva[] = [];
    for (const a of actuales) {
      a.t += paso;
      const retardo = a.retardo ?? 0;
      if (a.t < retardo) {
        siguen.push(a);
        continue;
      }
      if (!a.empezada) {
        a.empezada = true;
        a.alEmpezar?.();
      }
      const bruto = a.dur <= 0 ? 1 : Math.min(1, (a.t - retardo) / a.dur);
      a.p = (a.suavizado ?? suave.lineal)(bruto);
      a.alActualizar?.(a.p);
      if (bruto >= 1) a.alTerminar?.();
      else siguen.push(a);
    }
    this.vivas = [...siguen, ...this.vivas];
  }

  dibujar(ctx: CanvasRenderingContext2D, capaMin = -Infinity, capaMax = Infinity): void {
    const lista = this.vivas
      .filter((a) => a.dibujar && a.empezada && (a.capa ?? 0) >= capaMin && (a.capa ?? 0) <= capaMax)
      .sort((a, b) => (a.capa ?? 0) - (b.capa ?? 0));
    for (const a of lista) a.dibujar!(ctx, a.p);
  }

  vaciar(): void {
    this.vivas = [];
  }
}

/** Temporizador sencillo que cuenta hacia atrás. */
export class Espera {
  restante = 0;
  empezar(ms: number): void {
    this.restante = ms;
  }
  actualizar(dt: number): boolean {
    if (this.restante <= 0) return true;
    this.restante -= dt;
    return this.restante <= 0;
  }
  get activa(): boolean {
    return this.restante > 0;
  }
}
