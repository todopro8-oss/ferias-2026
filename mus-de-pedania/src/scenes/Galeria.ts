// Galería de depuración del arte procedural (?galeria=cartas | personajes).

import type { Escena } from '../core/sceneManager';
import { texto } from '../core/bitmapFont';
import { PALETA as P } from '../data/palette';
import { imagenCarta, imagenDorso, imagenMini, imagenReverso } from '../render/cardRenderer';
import { EXPRESIONES, generarHoja, type Vista } from '../art/placeholderGen';
import { IDS_PERSONAJES, PERSONAJES, type IdPersonaje } from '../data/characters';

export class Galeria implements Escena {
  readonly nombre = 'Galeria';
  pagina = 0;
  constructor(private readonly que: string) {}

  actualizar(): void {}

  dibujar(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = P.bastos;
    ctx.fillRect(0, 0, 320, 200);
    if (this.que === 'cartas') {
      for (let i = 0; i < 20; i++) {
        const c = this.pagina * 20 + i;
        ctx.drawImage(imagenCarta(c), 2 + (i % 8) * 40, 2 + Math.floor(i / 8) * 62);
      }
      ctx.drawImage(imagenReverso(), 242, 126);
      ctx.drawImage(imagenDorso(), 284, 126);
      ctx.drawImage(imagenMini(this.pagina * 20 + 9), 284, 144);
    } else if (this.que === 'minis') {
      for (let i = 0; i < 40; i++) ctx.drawImage(imagenMini(i), 2 + (i % 13) * 24, 2 + Math.floor(i / 13) * 38);
    } else if (this.que === 'personajes') {
      ctx.fillStyle = P.pared;
      ctx.fillRect(0, 0, 320, 200);
      const vista: Vista = this.pagina === 0 ? 'frontal' : 'tresCuartos';
      IDS_PERSONAJES.forEach((id, i) => {
        const hoja = generarHoja(PERSONAJES[id].aspecto, vista);
        const img = hoja.frames.idle0.aCanvas();
        ctx.drawImage(img, (i % 5) * 64, Math.floor(i / 5) * 80);
        texto(ctx, PERSONAJES[id].corto, (i % 5) * 64 + 2, Math.floor(i / 5) * 80 + 72, P.tinta);
      });
    } else if (this.que === 'expresiones') {
      ctx.fillStyle = P.pared;
      ctx.fillRect(0, 0, 320, 200);
      const id = (IDS_PERSONAJES[this.pagina % 7] ?? 'anselmo') as IdPersonaje;
      const vista: Vista = this.pagina >= 7 ? 'tresCuartos' : 'frontal';
      const hoja = generarHoja(PERSONAJES[id].aspecto, vista);
      const nombres = Object.keys(EXPRESIONES);
      const escala = 0.5;
      nombres.forEach((n, i) => {
        const img = hoja.frames[n].aCanvas();
        const x = (i % 10) * 32;
        const y = Math.floor(i / 10) * 40;
        ctx.drawImage(img, x, y, img.width * escala, img.height * escala);
      });
    } else if (this.que === 'fuente') {
      texto(ctx, 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ', 4, 6, P.tiza);
      texto(ctx, 'abcdefghijklmnñopqrstuvwxyz', 4, 20, P.tiza);
      texto(ctx, 'ÁÉÍÓÚÜ áéíóúü ¡¿«»·… 0123456789', 4, 34, P.tiza);
      texto(ctx, '¡ÓRDAGO! ¿Quiero? «Mus»', 4, 48, P.tiza, { variante: 'tiza' });
      texto(ctx, 'MUS DE PEDANÍA', 4, 64, P.oros, { variante: 'dorada', negrita: true, escala: 2 });
      texto(ctx, 'Envido, y no me mires así.', 4, 90, P.tinta, { sombra: P.papel });
      texto(ctx, 'pequeño gyjpq', 4, 104, P.fluorescente);
    }
  }
}
