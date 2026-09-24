// Pila de escenas. La de arriba recibe la entrada; las de debajo se dibujan si la de
// arriba es transparente y se actualizan si ésta no las pausa.

import type { EventoEntrada } from './input';

export interface Escena {
  /** Nombre para depuración y para las pruebas automáticas. */
  readonly nombre: string;
  /** Deja ver la escena de debajo (overlays: pausa, recuento…). */
  readonly transparente?: boolean;
  /** La escena de debajo sigue actualizándose mientras ésta está encima. */
  readonly actualizaDebajo?: boolean;
  entrar?(): void;
  salir?(): void;
  /** Vuelve a ser la de arriba tras quitar la que tenía encima. */
  reanudar?(): void;
  actualizar(dt: number): void;
  dibujar(ctx: CanvasRenderingContext2D): void;
  entrada?(e: EventoEntrada): void;
}

export class GestorEscenas {
  private pila: Escena[] = [];

  get actual(): Escena | undefined {
    return this.pila[this.pila.length - 1];
  }

  get nombres(): string[] {
    return this.pila.map((e) => e.nombre);
  }

  /** Sustituye toda la pila por una escena. */
  cambiar(e: Escena): void {
    while (this.pila.length) this.pila.pop()!.salir?.();
    this.pila.push(e);
    e.entrar?.();
  }

  apilar(e: Escena): void {
    this.pila.push(e);
    e.entrar?.();
  }

  quitar(e?: Escena): void {
    if (e && this.actual !== e) {
      const i = this.pila.indexOf(e);
      if (i >= 0) {
        this.pila.splice(i, 1);
        e.salir?.();
      }
      return;
    }
    const fuera = this.pila.pop();
    fuera?.salir?.();
    this.actual?.reanudar?.();
  }

  entrada(ev: EventoEntrada): void {
    this.actual?.entrada?.(ev);
  }

  actualizar(dt: number): void {
    const n = this.pila.length;
    if (n === 0) return;
    // Actualiza hacia abajo mientras la de encima lo permita.
    let i = n - 1;
    const aActualizar: Escena[] = [this.pila[i]];
    while (i > 0 && this.pila[i].actualizaDebajo) {
      i--;
      aActualizar.unshift(this.pila[i]);
    }
    for (const e of aActualizar) e.actualizar(dt);
  }

  dibujar(ctx: CanvasRenderingContext2D): void {
    const n = this.pila.length;
    if (n === 0) return;
    let i = n - 1;
    while (i > 0 && this.pila[i].transparente) i--;
    for (; i < n; i++) this.pila[i].dibujar(ctx);
  }
}
