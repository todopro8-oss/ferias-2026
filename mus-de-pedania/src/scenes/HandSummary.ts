// Recuento de la mano (sección 9, punto 9): pizarrita central que lista lance a lance
// lo que cobra cada pareja. La mesa la muestra encima mientras las piedras vuelan.

import { texto } from '../core/bitmapFont';
import { NOMBRE_EQUIPO, NOMBRE_LANCE, describirParte } from '../data/narrador.es';
import { UI } from '../data/ui.es';
import { DERIVADOS as D, PALETA as P } from '../data/palette';
import type { LineaRecuento } from '../mus/types';
import { panelPizarra } from '../render/ui';

export const RECT_RECUENTO = { x: 84, y: 128, w: 152, h: 68 };

export class HandSummary {
  lineas: LineaRecuento[] = [];
  visible = false;
  mensajeFinal: string | null = null;
  private t = 0;

  reiniciar(): void {
    this.lineas = [];
    this.visible = false;
    this.mensajeFinal = null;
  }

  agregar(l: LineaRecuento): void {
    this.visible = true;
    this.lineas.push(l);
  }

  actualizar(dt: number): void {
    this.t += dt;
  }

  dibujar(ctx: CanvasRenderingContext2D): void {
    if (!this.visible) return;
    const { x, y, w, h } = RECT_RECUENTO;
    panelPizarra(ctx, x, y, w, h);
    texto(ctx, UI.recuento.titulo, x + w / 2, y + 3, P.oros, { alinear: 'centro', variante: 'tiza' });
    this.lineas.slice(-4).forEach((l, i) => {
      const ly = y + 15 + i * 11;
      const nombre = NOMBRE_LANCE[l.lance];
      texto(ctx, `${nombre}:`, x + 3, ly, P.tiza, { variante: 'tiza' });
      if (l.equipo === null || l.partes.length === 0) {
        texto(ctx, 'nadie', x + 45, ly, P.tiza_sombra, { variante: 'tiza' });
        return;
      }
      const eq = l.equipo === 0 ? 'Nos.' : 'Ellos';
      texto(ctx, eq, x + 45, ly, l.equipo === 0 ? D.bastos_brillo : D.copas_brillo, { variante: 'tiza' });
      // Partes: «+2 (querido)» abreviadas para que quepan.
      const partes = l.partes.map((p) => describirParte(p));
      const resumen = compactar(partes);
      texto(ctx, resumen, x + w - 3, ly, P.tiza, { alinear: 'derecha', variante: 'tiza' });
    });
    if (this.mensajeFinal && Math.floor(this.t / 500) % 2 === 0) {
      texto(ctx, this.mensajeFinal, x + w / 2, y + h - 10, P.tiza_sombra, { alinear: 'centro' });
    }
  }
}

/** «+1 (deje) +3 (duples)» → «+1dj +3dp» si no cabe. */
function compactar(partes: string[]): string {
  const largo = partes.join(' ');
  if ([...largo].length <= 13) return largo;
  const abrev: Record<string, string> = {
    '(deje)': 'dj',
    '(pareja)': 'pr',
    '(medias)': 'md',
    '(duples)': 'dp',
    '(punto)': 'pt',
  };
  const corto = partes
    .map((p) => {
      const m = p.match(/^\+(\d+)\s*(.*)$/);
      if (!m) return p;
      const suf = abrev[m[2]] ?? m[2].replace(/[()]/g, '');
      return `+${m[1]}${suf}`;
    })
    .join(' ');
  if ([...corto].length <= 13) return corto;
  const total = partes.reduce((a, p) => a + Number(p.match(/^\+(\d+)/)?.[1] ?? 0), 0);
  return `+${total}`;
}

export function resumenTexto(l: LineaRecuento): string {
  if (l.equipo === null) return `${NOMBRE_LANCE[l.lance]}: nadie`;
  return `${NOMBRE_LANCE[l.lance]}: ${NOMBRE_EQUIPO[l.equipo]} ${l.partes.map(describirParte).join(' ')}`;
}
