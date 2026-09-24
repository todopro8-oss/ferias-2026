// Bucle principal: lógica a paso fijo de 60 Hz y dibujo en cada fotograma.

export const PASO_MS = 1000 / 60;

export interface OpcionesBucle {
  actualizar: (dt: number) => void;
  dibujar: () => void;
}

export class Bucle {
  private acumulado = 0;
  private anterior = 0;
  private corriendo = false;
  private idFrame = 0;
  /** Multiplica los pasos lógicos por fotograma (prueba de resistencia a x10). */
  aceleracion = 1;
  /** Fotogramas por segundo medidos (media móvil). */
  fps = 60;

  constructor(private readonly op: OpcionesBucle) {}

  empezar(): void {
    if (this.corriendo) return;
    this.corriendo = true;
    this.anterior = performance.now();
    const frame = (ahora: number) => {
      if (!this.corriendo) return;
      const dt = Math.min(250, ahora - this.anterior);
      this.anterior = ahora;
      if (dt > 0) this.fps = this.fps * 0.95 + (1000 / dt) * 0.05;
      this.acumulado += dt * this.aceleracion;
      let pasos = 0;
      while (this.acumulado >= PASO_MS && pasos < 60 * this.aceleracion) {
        this.op.actualizar(PASO_MS);
        this.acumulado -= PASO_MS;
        pasos++;
      }
      if (pasos >= 60 * this.aceleracion) this.acumulado = 0;
      this.op.dibujar();
      this.idFrame = requestAnimationFrame(frame);
    };
    this.idFrame = requestAnimationFrame(frame);
  }

  parar(): void {
    this.corriendo = false;
    cancelAnimationFrame(this.idFrame);
  }
}
