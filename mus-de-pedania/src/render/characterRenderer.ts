// Busto animado de un jugador: respiración, parpadeo aleatorio, habla mientras tiene
// bocadillo, expresiones puntuales y señas (con la duración del modo de señas).

import type { HojaSprites } from '../art/spriteSheet';

export class BustoAnimado {
  private etiqueta = 'idle';
  private frameIdx = 0;
  private tFrame = 0;
  private tParpadeo = 0;
  private proximoParpadeo = 2500;
  private parpadeando = 0;
  /** Etiqueta puntual que se reproduce durante `restante` ms y luego vuelve a idle. */
  private puntual: { etiqueta: string; restante: number } | null = null;
  private hablando = 0;
  /** Temblor horizontal (golpe de órdago, cabreo). */
  sacudida = 0;

  constructor(
    public hoja: HojaSprites,
    private readonly rng: () => number = Math.random,
  ) {
    this.proximoParpadeo = 1500 + rng() * 3000;
    this.tFrame = rng() * 700;
  }

  /** Reproduce una expresión o seña durante `ms`. */
  mostrar(etiqueta: string, ms: number): void {
    if (!this.hoja.etiquetas.has(etiqueta)) return;
    this.puntual = { etiqueta, restante: ms };
    this.cambiar(etiqueta);
  }

  hablar(ms: number): void {
    this.hablando = Math.max(this.hablando, ms);
  }

  callar(): void {
    this.hablando = 0;
  }

  get haciendoSena(): string | null {
    return this.puntual?.etiqueta.startsWith('sena_') ? this.puntual.etiqueta : null;
  }

  get expresion(): string {
    return this.puntual?.etiqueta ?? (this.hablando > 0 ? 'hablar' : 'idle');
  }

  private cambiar(etiqueta: string): void {
    if (this.etiqueta === etiqueta) return;
    this.etiqueta = etiqueta;
    this.frameIdx = 0;
    this.tFrame = 0;
  }

  actualizar(dt: number): void {
    if (this.sacudida > 0) this.sacudida = Math.max(0, this.sacudida - dt);
    if (this.puntual) {
      this.puntual.restante -= dt;
      if (this.puntual.restante <= 0) this.puntual = null;
    }
    if (this.hablando > 0) this.hablando -= dt;
    const deseada = this.puntual?.etiqueta ?? (this.hablando > 0 ? 'hablar' : 'idle');
    this.cambiar(deseada);

    const tag = this.hoja.etiquetas.get(this.etiqueta);
    if (tag) {
      this.tFrame += dt;
      const dur = tag.duraciones[this.frameIdx] ?? 100;
      if (this.tFrame >= dur) {
        this.tFrame -= dur;
        if (this.frameIdx + 1 < tag.frames.length) this.frameIdx++;
        else if (tag.bucle) this.frameIdx = 0;
      }
    }
    // Parpadeo aleatorio (sólo en reposo o hablando).
    this.tParpadeo += dt;
    if (this.parpadeando > 0) this.parpadeando -= dt;
    if (this.tParpadeo > this.proximoParpadeo) {
      this.tParpadeo = 0;
      this.proximoParpadeo = 1800 + this.rng() * 4200;
      if (this.etiqueta === 'idle' || this.etiqueta === 'hablar') this.parpadeando = 120;
    }
  }

  frameActual(): HTMLCanvasElement {
    if (this.parpadeando > 0 && this.etiqueta === 'idle') return this.hoja.frames.get('parpadeo')!;
    const tag = this.hoja.etiquetas.get(this.etiqueta);
    const nombre = tag?.frames[this.frameIdx] ?? 'idle0';
    return this.hoja.frames.get(nombre) ?? this.hoja.frames.get('idle0')!;
  }

  dibujar(ctx: CanvasRenderingContext2D, x: number, y: number, recorteAbajo?: number): void {
    const img = this.frameActual();
    const dx = this.sacudida > 0 ? (Math.floor(this.sacudida / 40) % 2 ? 1 : -1) : 0;
    const h = recorteAbajo !== undefined ? Math.min(img.height, recorteAbajo) : img.height;
    ctx.drawImage(img, 0, 0, img.width, h, Math.round(x + dx), Math.round(y), img.width, h);
  }
}
