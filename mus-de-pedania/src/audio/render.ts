// Renderizado offline (para comprobar el audio sin altavoces y, si hace falta, exportarlo).

import { normalizarToma, sintetizarBalbuceo, type VozBalbuceo } from './babble';
import { compilar, type Cancion } from './sequencer';
import { generarSfx, type NombreSfx } from './sfx';
import { frecuenciaDeNota, PATCHES, tocarNota } from './synth';

export interface Medidas {
  pico: number;
  rms: number;
  /** Salto máximo entre dos muestras seguidas (un clic se ve como un salto grande). */
  saltoMax: number;
  duracion: number;
}

export function medir(b: AudioBuffer): Medidas {
  const d = b.getChannelData(0);
  let pico = 0;
  let suma = 0;
  let salto = 0;
  for (let i = 0; i < d.length; i++) {
    const v = d[i];
    if (!Number.isFinite(v)) return { pico: Infinity, rms: NaN, saltoMax: Infinity, duracion: b.duration };
    pico = Math.max(pico, Math.abs(v));
    suma += v * v;
    if (i > 0) salto = Math.max(salto, Math.abs(v - d[i - 1]));
  }
  return { pico, rms: Math.sqrt(suma / d.length), saltoMax: salto, duracion: b.duration };
}

export async function renderizarCancion(cancion: Cancion, segundos: number, sr = 22050): Promise<AudioBuffer> {
  const ctx = new OfflineAudioContext(1, Math.ceil(segundos * sr), sr);
  const salida = ctx.createGain();
  salida.gain.value = 0.7;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -10;
  comp.ratio.value = 4;
  salida.connect(comp).connect(ctx.destination);
  const perc = new Map<string, AudioBuffer>();
  const { eventos } = compilar(cancion);
  for (const e of eventos) {
    if (e.t > segundos) break;
    if (e.instrumento === 'percusion') {
      for (const g of e.notas) {
        const nombre = `perc_${g}` as NombreSfx;
        let b = perc.get(nombre);
        if (!b) {
          const datos = generarSfx(nombre, 22050);
          b = ctx.createBuffer(1, datos.length, 22050);
          b.copyToChannel(datos as Float32Array<ArrayBuffer>, 0);
          perc.set(nombre, b);
        }
        const s = ctx.createBufferSource();
        s.buffer = b;
        const g2 = ctx.createGain();
        g2.gain.value = e.volumen;
        s.connect(g2).connect(salida);
        s.start(e.t);
      }
    } else {
      for (const n of e.notas)
        tocarNota(ctx, salida, PATCHES[e.instrumento], frecuenciaDeNota(n), e.t, e.dur * 0.92, e.volumen);
    }
  }
  return ctx.startRendering();
}

export async function renderizarVoz(texto: string, voz: VozBalbuceo, sr = 22050): Promise<AudioBuffer> {
  const ctx = new OfflineAudioContext(1, Math.ceil(6 * sr), sr);
  sintetizarBalbuceo(ctx, ctx.destination, texto, voz, 0.02);
  const b = await ctx.startRendering();
  normalizarToma(b.getChannelData(0));
  return b;
}
