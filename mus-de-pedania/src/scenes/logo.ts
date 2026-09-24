// Logo «MUS DE PEDANÍA» dorado con ciclo de paleta (un brillo que recorre las letras).

import { AVANCE_NEGRITA, texto } from '../core/bitmapFont';
import { DERIVADOS as D, PALETA as P } from '../data/palette';
import { UI } from '../data/ui.es';

const CICLO = [D.oros_osc, P.oros, D.oros_brillo, '#FFF6C0', D.oros_brillo, P.oros];

export function dibujarLogo(ctx: CanvasRenderingContext2D, cx: number, y: number, t: number, escala = 2): void {
  const letras = [...UI.titulo];
  const ancho = (letras.length * AVANCE_NEGRITA - 1) * escala;
  let x = cx - ancho / 2;
  const fase = Math.floor(t / 70);
  letras.forEach((ch, i) => {
    const k = (i - fase + 1000) % 24;
    const color = k < CICLO.length ? CICLO[k] : P.oros;
    texto(ctx, ch, x + escala, y + escala, P.negro, { negrita: true, escala });
    texto(ctx, ch, x, y, color, { negrita: true, escala, variante: k < CICLO.length ? 'normal' : 'dorada' });
    x += AVANCE_NEGRITA * escala;
  });
}
