// Entrada de ratón y teclado en coordenadas lógicas.

import type { Pantalla } from './pantalla';

export type EventoEntrada =
  | { tipo: 'clic'; x: number; y: number; boton: number }
  | { tipo: 'soltar'; x: number; y: number; boton: number }
  | { tipo: 'mover'; x: number; y: number }
  | { tipo: 'tecla'; tecla: string; codigo: string; mayus: boolean; repetida: boolean };

export class Entrada {
  readonly raton = { x: -1, y: -1, dentro: false, pulsado: false };
  /** true cuando el último uso fue el teclado (para mostrar el foco). */
  modoTeclado = false;
  private cola: EventoEntrada[] = [];
  private escuchasGesto: (() => void)[] = [];

  constructor(pantalla: Pantalla) {
    const c = pantalla.canvas;
    c.addEventListener('mousemove', (e) => {
      const p = pantalla.aLogico(e.clientX, e.clientY);
      this.raton.x = p.x;
      this.raton.y = p.y;
      this.raton.dentro = true;
      this.modoTeclado = false;
      this.cola.push({ tipo: 'mover', x: p.x, y: p.y });
    });
    c.addEventListener('mouseleave', () => {
      this.raton.dentro = false;
    });
    c.addEventListener('mousedown', (e) => {
      e.preventDefault();
      c.focus();
      const p = pantalla.aLogico(e.clientX, e.clientY);
      this.raton.x = p.x;
      this.raton.y = p.y;
      this.raton.pulsado = true;
      this.modoTeclado = false;
      this.cola.push({ tipo: 'clic', x: p.x, y: p.y, boton: e.button });
      this.gesto();
    });
    window.addEventListener('mouseup', (e) => {
      if (!this.raton.pulsado) return;
      this.raton.pulsado = false;
      const p = pantalla.aLogico(e.clientX, e.clientY);
      this.cola.push({ tipo: 'soltar', x: p.x, y: p.y, boton: e.button });
    });
    c.addEventListener(
      'touchstart',
      (e) => {
        const t = e.changedTouches[0];
        if (!t) return;
        e.preventDefault();
        const p = pantalla.aLogico(t.clientX, t.clientY);
        this.raton.x = p.x;
        this.raton.y = p.y;
        this.cola.push({ tipo: 'clic', x: p.x, y: p.y, boton: 0 });
        this.gesto();
      },
      { passive: false },
    );
    c.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('keydown', (e) => {
      // Que el navegador no haga scroll ni busque con las teclas del juego.
      if ([' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', "'", '/'].includes(e.key)) e.preventDefault();
      if (e.key === 'F11') return;
      this.modoTeclado = true;
      this.cola.push({ tipo: 'tecla', tecla: e.key, codigo: e.code, mayus: e.shiftKey, repetida: e.repeat });
      this.gesto();
    });
  }

  /** Llamado en el primer gesto del usuario (para desbloquear el audio). */
  alPrimerGesto(fn: () => void): void {
    this.escuchasGesto.push(fn);
  }

  private gesto(): void {
    const fns = this.escuchasGesto;
    this.escuchasGesto = [];
    for (const f of fns) f();
  }

  sacar(): EventoEntrada[] {
    const c = this.cola;
    this.cola = [];
    return c;
  }
}

export function dentro(x: number, y: number, r: { x: number; y: number; w: number; h: number }): boolean {
  return x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h;
}
