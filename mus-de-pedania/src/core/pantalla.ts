// Pantalla lógica de 320×200 escalada a múltiplos enteros, con bandas negras
// y la opción «Corrección 4:3» (píxel no cuadrado, como en un monitor CRT).

export const ANCHO = 320;
export const ALTO = 200;

export type Escalado = 'auto' | 2 | 3 | 4 | 5 | 6;

export class Pantalla {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  escalado: Escalado = 'auto';
  correccion43 = false;
  /** Desplazamiento temporal (temblor de pantalla al cantar órdago). */
  temblor = { x: 0, y: 0 };
  private escalaActual = 1;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    canvas.width = ANCHO;
    canvas.height = ALTO;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Canvas 2D no disponible');
    this.ctx = ctx;
    this.ctx.imageSmoothingEnabled = false;
    window.addEventListener('resize', () => this.ajustar());
    document.addEventListener('fullscreenchange', () => this.ajustar());
    this.ajustar();
  }

  get escala(): number {
    return this.escalaActual;
  }

  configurar(escalado: Escalado, correccion43: boolean): void {
    this.escalado = escalado;
    this.correccion43 = correccion43;
    this.ajustar();
  }

  ajustar(): void {
    const altoLogico = this.correccion43 ? 240 : ALTO;
    const maxEscala = Math.max(1, Math.floor(Math.min(window.innerWidth / ANCHO, window.innerHeight / altoLogico)));
    const escala = this.escalado === 'auto' ? maxEscala : Math.min(this.escalado, Math.max(maxEscala, 1));
    this.escalaActual = escala;
    this.canvas.style.width = `${ANCHO * escala}px`;
    this.canvas.style.height = `${altoLogico * escala}px`;
  }

  /** Convierte coordenadas de ventana a coordenadas lógicas (0..319, 0..199). */
  aLogico(clientX: number, clientY: number): { x: number; y: number } {
    const r = this.canvas.getBoundingClientRect();
    return {
      x: Math.floor(((clientX - r.left) * ANCHO) / r.width),
      y: Math.floor(((clientY - r.top) * ALTO) / r.height),
    };
  }

  async alternarPantallaCompleta(): Promise<void> {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      // Algunos navegadores lo bloquean fuera de un gesto del usuario: no pasa nada.
    }
  }
}

/** Crea un lienzo fuera de pantalla con el suavizado desactivado. */
export function crearLienzo(ancho: number, alto: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = ancho;
  canvas.height = alto;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.imageSmoothingEnabled = false;
  return { canvas, ctx };
}
