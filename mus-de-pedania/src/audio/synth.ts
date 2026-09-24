// Sintetizador FM de 2 operadores al estilo OPL2 (AdLib) con Web Audio.
// Cada voz: moduladora → (índice) → frecuencia de la portadora → envolvente → salida.
// Las formas de onda del OPL2 (seno, medio seno, seno absoluto, cuarto de seno) y la
// realimentación de la moduladora se aproximan con PeriodicWaves calculadas por DFT.

/** 0 seno · 1 medio seno · 2 seno absoluto · 3 cuarto de seno (pulsos). */
export type OndaOPL = 0 | 1 | 2 | 3;

export interface Operador {
  /** Multiplicador de frecuencia (0.5, 1, 2, 3…). */
  mult: number;
  onda: OndaOPL;
  /** Tiempos en segundos; sostenido 0..1. */
  ataque: number;
  decaimiento: number;
  sostenido: number;
  relajacion: number;
}

export interface Patch {
  nombre: string;
  portadora: Operador & { nivel: number };
  moduladora: Operador & {
    /** Índice de modulación (desviación = índice × frecuencia de la moduladora). */
    indice: number;
    /** Realimentación 0..7, como en el OPL2. */
    feedback: number;
  };
}

// ---------------------------------------------------------------------------
// Formas de onda (puro, testeable)
// ---------------------------------------------------------------------------

const MUESTRAS = 1024;

export function muestraOnda(onda: OndaOPL, fase: number): number {
  const s = Math.sin(fase);
  const f = ((fase % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  switch (onda) {
    case 0:
      return s;
    case 1:
      return f < Math.PI ? s : 0;
    case 2:
      return Math.abs(s);
    case 3:
      // Cuarto de seno: sube en el primer y tercer cuarto, silencio en los otros.
      return f < Math.PI / 2 || (f >= Math.PI && f < 1.5 * Math.PI) ? Math.abs(s) : 0;
  }
}

/** Un periodo de la onda con realimentación (la moduladora se modula a sí misma). */
export function periodoConFeedback(onda: OndaOPL, feedback: number, n = MUESTRAS): Float32Array {
  const beta = feedback === 0 ? 0 : Math.pow(2, feedback - 7) * Math.PI;
  const res = new Float32Array(n);
  let y1 = 0;
  let y2 = 0;
  // Varias vueltas para que se estabilice la realimentación.
  for (let vuelta = 0; vuelta < 3; vuelta++) {
    for (let i = 0; i < n; i++) {
      const fase = (2 * Math.PI * i) / n + beta * ((y1 + y2) / 2);
      const y = muestraOnda(onda, fase);
      y2 = y1;
      y1 = y;
      if (vuelta === 2) res[i] = y;
    }
  }
  return res;
}

/** DFT de un periodo: coeficientes coseno (real) y seno (imag) de los primeros armónicos. */
export function coeficientes(periodo: Float32Array, armonicos = 48): { real: Float32Array; imag: Float32Array } {
  const n = periodo.length;
  const real = new Float32Array(armonicos + 1);
  const imag = new Float32Array(armonicos + 1);
  for (let k = 1; k <= armonicos; k++) {
    let a = 0;
    let b = 0;
    for (let i = 0; i < n; i++) {
      const ang = (2 * Math.PI * k * i) / n;
      a += periodo[i] * Math.cos(ang);
      b += periodo[i] * Math.sin(ang);
    }
    real[k] = (2 * a) / n;
    imag[k] = (2 * b) / n;
  }
  return { real, imag };
}

// ---------------------------------------------------------------------------
// Voces FM
// ---------------------------------------------------------------------------

const cacheOndas = new WeakMap<BaseAudioContext, Map<string, PeriodicWave>>();

export function ondaPeriodica(ctx: BaseAudioContext, onda: OndaOPL, feedback = 0): PeriodicWave {
  let m = cacheOndas.get(ctx);
  if (!m) {
    m = new Map();
    cacheOndas.set(ctx, m);
  }
  const clave = `${onda}|${feedback}`;
  let w = m.get(clave);
  if (!w) {
    const { real, imag } = coeficientes(periodoConFeedback(onda, feedback));
    w = ctx.createPeriodicWave(real, imag, { disableNormalization: false });
    m.set(clave, w);
  }
  return w;
}

function envolvente(p: AudioParam, t0: number, dur: number, op: Operador, pico: number): number {
  const a = Math.max(0.002, op.ataque);
  const fin = t0 + dur;
  p.setValueAtTime(0, t0);
  p.linearRampToValueAtTime(pico, t0 + a);
  p.setTargetAtTime(pico * op.sostenido, t0 + a, Math.max(0.005, op.decaimiento / 3));
  const r = Math.max(0.01, op.relajacion);
  p.setTargetAtTime(0, Math.max(fin, t0 + a), r / 4);
  return fin + r * 1.5;
}

/** Toca una nota FM. Devuelve el instante en que se apaga del todo. */
export function tocarNota(
  ctx: BaseAudioContext,
  destino: AudioNode,
  patch: Patch,
  frecuencia: number,
  t0: number,
  dur: number,
  velocidad = 1,
): number {
  const m = patch.moduladora;
  const c = patch.portadora;
  const mod = ctx.createOscillator();
  mod.setPeriodicWave(ondaPeriodica(ctx, m.onda, m.feedback));
  mod.frequency.value = frecuencia * m.mult;
  const prof = ctx.createGain();
  envolvente(prof.gain, t0, dur, m, m.indice * frecuencia * m.mult);
  const por = ctx.createOscillator();
  por.setPeriodicWave(ondaPeriodica(ctx, c.onda));
  por.frequency.value = frecuencia * c.mult;
  const amp = ctx.createGain();
  const apagado = envolvente(amp.gain, t0, dur, c, c.nivel * velocidad);
  mod.connect(prof);
  prof.connect(por.frequency);
  por.connect(amp);
  amp.connect(destino);
  mod.start(t0);
  por.start(t0);
  mod.stop(apagado + 0.05);
  por.stop(apagado + 0.05);
  por.onended = () => {
    amp.disconnect();
    prof.disconnect();
  };
  return apagado;
}

export function frecuenciaDeNota(nombre: string): number {
  const m = nombre.match(/^([A-Ga-g])([#b]?)(-?\d)$/);
  if (!m) throw new Error(`Nota no válida: ${nombre}`);
  const base: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  let semitono = base[m[1].toUpperCase()];
  if (m[2] === '#') semitono++;
  if (m[2] === 'b') semitono--;
  const octava = Number(m[3]);
  const midi = (octava + 1) * 12 + semitono;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// ---------------------------------------------------------------------------
// Instrumentos (patches) al estilo de los bancos de AdLib, hechos a mano.
// ---------------------------------------------------------------------------

const op = (
  mult: number,
  onda: OndaOPL,
  ataque: number,
  decaimiento: number,
  sostenido: number,
  relajacion: number,
): Operador => ({ mult, onda, ataque, decaimiento, sostenido, relajacion });

export const PATCHES = {
  trompeta: {
    nombre: 'trompeta',
    portadora: { ...op(1, 0, 0.03, 0.2, 0.75, 0.12), nivel: 0.22 },
    moduladora: { ...op(1, 0, 0.05, 0.3, 0.7, 0.1), indice: 2.2, feedback: 5 },
  },
  clarinete: {
    nombre: 'clarinete',
    portadora: { ...op(1, 0, 0.02, 0.15, 0.8, 0.08), nivel: 0.2 },
    moduladora: { ...op(2, 0, 0.02, 0.2, 0.6, 0.08), indice: 1.3, feedback: 2 },
  },
  guitarra: {
    nombre: 'guitarra',
    portadora: { ...op(1, 1, 0.003, 0.5, 0.0, 0.2), nivel: 0.2 },
    moduladora: { ...op(3, 0, 0.002, 0.25, 0.0, 0.15), indice: 2.5, feedback: 3 },
  },
  bajo: {
    nombre: 'bajo',
    portadora: { ...op(0.5, 0, 0.004, 0.35, 0.3, 0.1), nivel: 0.3 },
    moduladora: { ...op(0.5, 0, 0.003, 0.2, 0.2, 0.1), indice: 1.6, feedback: 1 },
  },
  tuba: {
    nombre: 'tuba',
    portadora: { ...op(0.5, 0, 0.02, 0.25, 0.6, 0.1), nivel: 0.3 },
    moduladora: { ...op(0.5, 0, 0.02, 0.2, 0.6, 0.1), indice: 1.5, feedback: 4 },
  },
  acordeon: {
    nombre: 'acordeon',
    portadora: { ...op(1, 0, 0.04, 0.2, 0.85, 0.12), nivel: 0.13 },
    moduladora: { ...op(2, 1, 0.04, 0.2, 0.8, 0.12), indice: 1.1, feedback: 4 },
  },
  campanilla: {
    nombre: 'campanilla',
    portadora: { ...op(1, 0, 0.002, 0.8, 0.0, 0.6), nivel: 0.18 },
    moduladora: { ...op(3.5, 0, 0.002, 0.6, 0.0, 0.5), indice: 3, feedback: 0 },
  },
  organo: {
    nombre: 'organo',
    portadora: { ...op(1, 2, 0.02, 0.1, 0.9, 0.08), nivel: 0.12 },
    moduladora: { ...op(2, 0, 0.02, 0.1, 0.9, 0.08), indice: 0.8, feedback: 0 },
  },
} satisfies Record<string, Patch>;

export type NombrePatch = keyof typeof PATCHES;
