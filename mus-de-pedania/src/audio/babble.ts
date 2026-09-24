// Balbuceo sintético (sección 12): sílabas generadas a partir del texto, con formantes
// sencillos y el tono, la velocidad y el timbre de cada personaje. La semilla es la propia
// línea, así que la misma frase suena siempre igual.

import { mulberry32, semillaDeTexto } from '../core/rng';

export interface VozBalbuceo {
  tono: number;
  velocidad: number;
  formantes: number;
  melodia: number;
  aspereza: number;
  nasal: number;
  alarga?: boolean;
}

export interface Silaba {
  /** Vocal de la sílaba (a, e, i, o, u). */
  vocal: 'a' | 'e' | 'i' | 'o' | 'u';
  /** Consonante de ataque: fricativa (ruido), oclusiva (golpe), nasal o ninguna. */
  ataque: 'fricativa' | 'oclusiva' | 'nasal' | 'liquida' | 'ninguna';
  inicio: number;
  dur: number;
  /** Tono relativo (1 = el del personaje). */
  tono: number;
  /** Intensidad 0..1 (la acentuada, más). */
  fuerza: number;
}

const VOCALES = 'aeiouáéíóúü';
const FRICATIVAS = 'fsjzxhcg';
const OCLUSIVAS = 'pbtdkq';
const NASALES = 'mnñ';
const LIQUIDAS = 'lrvy';

function normalizarVocal(c: string): Silaba['vocal'] {
  const m: Record<string, Silaba['vocal']> = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ü: 'u' };
  return (m[c] ?? c) as Silaba['vocal'];
}

/** Divide el texto en sílabas aproximadas (un núcleo vocálico por sílaba) con su tiempo y tono. */
export function silabas(texto: string, voz: VozBalbuceo): Silaba[] {
  const rng = mulberry32(semillaDeTexto(texto));
  const res: Silaba[] = [];
  const minusculas = texto.toLowerCase();
  const durBase = 1 / voz.velocidad;
  let t = 0.03;
  let consonante: Silaba['ataque'] = 'ninguna';
  const palabras = minusculas.split(/(\s+|[.,;:!?¡¿…«»—-]+)/);
  const esPregunta = texto.trim().endsWith('?');
  const esExclamacion = /[!¡]/.test(texto);
  // Núcleos silábicos: cada grupo de vocales seguidas cuenta como uno (diptongos).
  let total = 0;
  for (const p of palabras) {
    let previa = false;
    for (const c of p) {
      const v = VOCALES.includes(c);
      if (v && !previa) total++;
      previa = v;
    }
  }
  let idx = 0;
  for (const palabra of palabras) {
    if (!palabra) continue;
    if (/^\s+$/.test(palabra)) {
      t += durBase * 0.25;
      continue;
    }
    if (/^[.,;:!?¡¿…«»—-]+$/.test(palabra)) {
      t += durBase * (palabra.includes(',') ? 0.6 : 0.9);
      continue;
    }
    let ultimaVocal = -1;
    for (let i = 0; i < palabra.length; i++) {
      const c = palabra[i];
      if (VOCALES.includes(c)) {
        // Diptongos: dos vocales seguidas cuentan como una sílaba.
        if (ultimaVocal === i - 1) continue;
        ultimaVocal = i;
        const pos = total > 1 ? idx / (total - 1) : 0;
        // Entonación: baja al final; sube si es pregunta; más viva si hay exclamación.
        let contorno = 1 + voz.melodia * 0.12 * Math.sin(idx * 1.7 + rng() * 2) - 0.1 * pos;
        if (esPregunta && pos > 0.75) contorno += 0.25 * (pos - 0.75) * 4;
        if (esExclamacion) contorno += 0.08;
        const acentuada = /[áéíóú]/.test(c) || rng() < 0.2;
        let dur = durBase * (0.75 + rng() * 0.5) * (acentuada ? 1.2 : 1);
        if (voz.alarga && idx === total - 1) dur *= 2.4;
        res.push({
          vocal: normalizarVocal(c),
          ataque: consonante,
          inicio: t,
          dur,
          tono: contorno,
          fuerza: acentuada ? 1 : 0.75,
        });
        t += dur;
        idx++;
        consonante = 'ninguna';
      } else if (FRICATIVAS.includes(c)) consonante = 'fricativa';
      else if (OCLUSIVAS.includes(c)) consonante = 'oclusiva';
      else if (NASALES.includes(c)) consonante = 'nasal';
      else if (LIQUIDAS.includes(c)) consonante = 'liquida';
    }
  }
  return res;
}

export function duracionBalbuceo(texto: string, voz: VozBalbuceo): number {
  const s = silabas(texto, voz);
  if (s.length === 0) return 0.3;
  const ultima = s[s.length - 1];
  return ultima.inicio + ultima.dur + 0.15;
}

/** Formantes F1, F2 de cada vocal (Hz, voz neutra). */
const FORMANTES: Record<Silaba['vocal'], [number, number]> = {
  a: [800, 1250],
  e: [500, 1850],
  i: [300, 2250],
  o: [500, 900],
  u: [320, 750],
};

/**
 * Sintetiza la línea en un contexto (normalmente un OfflineAudioContext, para poder
 * aplicarle el filtro Sound Blaster). Programa todo desde t0.
 */
export function sintetizarBalbuceo(
  ctx: BaseAudioContext,
  destino: AudioNode,
  texto: string,
  voz: VozBalbuceo,
  t0 = 0,
): number {
  const sils = silabas(texto, voz);
  const fin = t0 + duracionBalbuceo(texto, voz);
  // Fuente sonora: diente de sierra con la melodía de la frase.
  const fuente = ctx.createOscillator();
  fuente.type = 'sawtooth';
  const f0 = voz.tono;
  fuente.frequency.setValueAtTime(f0, t0);
  // Aspereza: ruido mezclado con la fuente.
  const nRuido = Math.ceil((fin - t0 + 0.2) * ctx.sampleRate);
  const bufRuido = ctx.createBuffer(1, nRuido, ctx.sampleRate);
  const datos = bufRuido.getChannelData(0);
  const r = mulberry32(semillaDeTexto(texto) ^ 0x5bd1e995);
  for (let i = 0; i < nRuido; i++) datos[i] = r() * 2 - 1;
  const ruido = ctx.createBufferSource();
  ruido.buffer = bufRuido;
  const ganRuidoVoz = ctx.createGain();
  ganRuidoVoz.gain.value = voz.aspereza * 0.35;
  const ganConsonante = ctx.createGain();
  ganConsonante.gain.setValueAtTime(0, t0);
  const filtroConsonante = ctx.createBiquadFilter();
  filtroConsonante.type = 'highpass';
  filtroConsonante.frequency.value = 2500;

  const mezcla = ctx.createGain();
  fuente.connect(mezcla);
  ruido.connect(ganRuidoVoz).connect(mezcla);
  ruido.connect(filtroConsonante).connect(ganConsonante);

  // Dos formantes en paralelo (más uno nasal si hace falta).
  const f1 = ctx.createBiquadFilter();
  f1.type = 'bandpass';
  f1.Q.value = 6;
  const f2 = ctx.createBiquadFilter();
  f2.type = 'bandpass';
  f2.Q.value = 9;
  const g2 = ctx.createGain();
  g2.gain.value = 0.7;
  mezcla.connect(f1);
  mezcla.connect(f2).connect(g2);
  const volumen = ctx.createGain();
  volumen.gain.setValueAtTime(0, t0);
  f1.connect(volumen);
  g2.connect(volumen);
  if (voz.nasal > 0) {
    const fn = ctx.createBiquadFilter();
    fn.type = 'bandpass';
    fn.frequency.value = 250;
    fn.Q.value = 4;
    const gn = ctx.createGain();
    gn.gain.value = voz.nasal * 0.9;
    mezcla.connect(fn).connect(gn).connect(volumen);
  }
  const salida = ctx.createGain();
  salida.gain.value = 0.9;
  const suavizado = ctx.createBiquadFilter();
  suavizado.type = 'lowpass';
  suavizado.frequency.value = 4800;
  suavizado.Q.value = 0.5;
  volumen.connect(salida);
  ganConsonante.connect(salida);
  salida.connect(suavizado).connect(destino);

  for (const s of sils) {
    const t = t0 + s.inicio;
    const [a, b] = FORMANTES[s.vocal];
    f1.frequency.setTargetAtTime(a * voz.formantes, t, 0.015);
    f2.frequency.setTargetAtTime(b * voz.formantes, t, 0.015);
    fuente.frequency.setTargetAtTime(f0 * s.tono, t, 0.03);
    // Envolvente de la sílaba
    volumen.gain.setTargetAtTime(0.9 * s.fuerza, t + (s.ataque === 'oclusiva' ? 0.025 : 0.01), 0.012);
    volumen.gain.setTargetAtTime(0.05, t + s.dur * 0.75, 0.02);
    // Consonante
    if (s.ataque === 'fricativa' || s.ataque === 'oclusiva') {
      ganConsonante.gain.setValueAtTime(0, t - 0.005);
      ganConsonante.gain.linearRampToValueAtTime(s.ataque === 'fricativa' ? 0.18 : 0.25, t);
      ganConsonante.gain.linearRampToValueAtTime(0, t + (s.ataque === 'fricativa' ? 0.06 : 0.02));
    }
  }
  volumen.gain.setTargetAtTime(0, fin - 0.1, 0.03);
  fuente.start(t0);
  ruido.start(t0);
  fuente.stop(fin + 0.1);
  ruido.stop(fin + 0.1);
  return fin - t0;
}

/** Filtro «Sound Blaster»: cuantiza las muestras a 8 bits (el remuestreo lo hace el contexto a 11 025 Hz). */
export function cuantizar8bits(datos: Float32Array): void {
  for (let i = 0; i < datos.length; i++) datos[i] = Math.round(Math.max(-1, Math.min(1, datos[i])) * 127) / 127;
}

/** Normaliza una toma a −3 dBFS de pico (≈ 0,708), como pide la guía de grabación. */
export function normalizarToma(datos: Float32Array, pico = 0.708): void {
  let m = 0;
  for (let i = 0; i < datos.length; i++) m = Math.max(m, Math.abs(datos[i]));
  if (m > 0) for (let i = 0; i < datos.length; i++) datos[i] = (datos[i] / m) * pico;
}
