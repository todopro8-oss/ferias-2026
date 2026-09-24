// Efectos de sonido generados por código como muestras (Float32Array) a 22 050 Hz.
// Sin archivos externos: barajar, repartir, cartas, piedras, golpe de órdago, campanas,
// aplausos, murmullo de bar, cafetera, vasos, tragaperras, ladrido, grillos…

import { mulberry32 } from '../core/rng';

export const FRECUENCIA_SFX = 22050;

export type NombreSfx =
  | 'barajar'
  | 'carta'
  | 'descarte'
  | 'piedra'
  | 'monton'
  | 'clic'
  | 'hover'
  | 'turno'
  | 'golpe'
  | 'campana'
  | 'aplauso'
  | 'murmullo'
  | 'grillos'
  | 'cafetera'
  | 'vasos'
  | 'tragaperras'
  | 'ladrido'
  | 'ambiente'
  | 'perc_b'
  | 'perc_s'
  | 'perc_h'
  | 'perc_c'
  | 'perc_p'
  | 'perc_t'
  | 'perc_pl';

type Gen = (sr: number) => Float32Array;

function buffer(seg: number, sr: number): Float32Array {
  return new Float32Array(Math.max(1, Math.floor(seg * sr)));
}

/** Ruido filtrado por un paso banda sencillo (biquad RBJ) aplicado sobre un array. */
function pasoBanda(x: Float32Array, sr: number, f0: number, q: number): Float32Array {
  const w0 = (2 * Math.PI * f0) / sr;
  const alfa = Math.sin(w0) / (2 * q);
  const b0 = alfa;
  const b2 = -alfa;
  const a0 = 1 + alfa;
  const a1 = -2 * Math.cos(w0);
  const a2 = 1 - alfa;
  const y = new Float32Array(x.length);
  let x1 = 0;
  let x2 = 0;
  let y1 = 0;
  let y2 = 0;
  for (let i = 0; i < x.length; i++) {
    const v = (b0 * x[i] + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1;
    x1 = x[i];
    y2 = y1;
    y1 = v;
    y[i] = v;
  }
  return y;
}

function pasoAlto(x: Float32Array, k = 0.95): Float32Array {
  const y = new Float32Array(x.length);
  let prevX = 0;
  let prevY = 0;
  for (let i = 0; i < x.length; i++) {
    prevY = k * (prevY + x[i] - prevX);
    prevX = x[i];
    y[i] = prevY;
  }
  return y;
}

function ruido(n: number, semilla: number): Float32Array {
  const r = mulberry32(semilla);
  const x = new Float32Array(n);
  for (let i = 0; i < n; i++) x[i] = r() * 2 - 1;
  return x;
}

function mezclarEn(dest: Float32Array, src: Float32Array, desde: number, ganancia = 1): void {
  for (let i = 0; i < src.length && desde + i < dest.length; i++)
    if (desde + i >= 0) dest[desde + i] += src[i] * ganancia;
}

function envolvente(x: Float32Array, sr: number, ataque: number, caida: number): Float32Array {
  const a = Math.max(1, Math.floor(ataque * sr));
  for (let i = 0; i < x.length; i++) {
    const t = i / sr;
    const e = i < a ? i / a : Math.exp(-(t - ataque) / caida);
    x[i] *= e;
  }
  return x;
}

function normalizar(x: Float32Array, pico = 0.9): Float32Array {
  let m = 0;
  for (let i = 0; i < x.length; i++) m = Math.max(m, Math.abs(x[i]));
  if (m > 0) for (let i = 0; i < x.length; i++) x[i] = (x[i] / m) * pico;
  return x;
}

/** Chasquido de carta: ráfaga corta de ruido brillante. */
function chasquido(sr: number, semilla: number, dur = 0.05, f = 3200): Float32Array {
  const x = pasoBanda(ruido(Math.floor(dur * sr), semilla), sr, f, 1.2);
  return envolvente(x, sr, 0.002, dur / 4);
}

function tono(
  sr: number,
  dur: number,
  f: (t: number) => number,
  onda: (fase: number) => number = Math.sin,
): Float32Array {
  const x = buffer(dur, sr);
  let fase = 0;
  for (let i = 0; i < x.length; i++) {
    fase += (2 * Math.PI * f(i / sr)) / sr;
    x[i] = onda(fase);
  }
  return x;
}

const GENERADORES: Record<NombreSfx, Gen> = {
  barajar: (sr) => {
    // Riffle: muchos chasquidos que se aceleran y un «brrr» final.
    const x = buffer(0.9, sr);
    let t = 0.02;
    let k = 0;
    while (t < 0.75) {
      mezclarEn(x, chasquido(sr, 11 + k, 0.025, 2500 + (k % 5) * 300), Math.floor(t * sr), 0.6);
      t += 0.035 - Math.min(0.02, k * 0.0006);
      k++;
    }
    mezclarEn(
      x,
      envolvente(pasoBanda(ruido(Math.floor(0.15 * sr), 99), sr, 1200, 0.8), sr, 0.01, 0.05),
      Math.floor(0.75 * sr),
    );
    return normalizar(x, 0.7);
  },
  carta: (sr) => normalizar(chasquido(sr, 3, 0.06, 2800), 0.6),
  descarte: (sr) => {
    const x = envolvente(pasoBanda(ruido(Math.floor(0.14 * sr), 5), sr, 1800, 0.7), sr, 0.02, 0.05);
    return normalizar(x, 0.55);
  },
  piedra: (sr) => {
    // Clac de piedrecita: tono corto inarmónico + chasquido.
    const x = tono(sr, 0.08, () => 1900);
    mezclarEn(
      x,
      tono(sr, 0.08, () => 3100),
      0,
      0.5,
    );
    envolvente(x, sr, 0.001, 0.012);
    mezclarEn(x, chasquido(sr, 7, 0.02, 4000), 0, 0.6);
    return normalizar(x, 0.6);
  },
  monton: (sr) => {
    const x = buffer(0.35, sr);
    const p = GENERADORES.piedra(sr);
    for (let k = 0; k < 6; k++) mezclarEn(x, p, Math.floor((0.02 + k * 0.045 + (k % 2) * 0.01) * sr), 0.7 - k * 0.07);
    return normalizar(x, 0.7);
  },
  clic: (sr) =>
    normalizar(
      envolvente(
        tono(sr, 0.03, () => 1400),
        sr,
        0.001,
        0.006,
      ),
      0.4,
    ),
  hover: (sr) =>
    normalizar(
      envolvente(
        tono(sr, 0.025, () => 2200),
        sr,
        0.001,
        0.004,
      ),
      0.25,
    ),
  turno: (sr) => {
    const x = envolvente(
      tono(sr, 0.25, () => 880),
      sr,
      0.005,
      0.08,
    );
    mezclarEn(
      x,
      envolvente(
        tono(sr, 0.25, () => 1318),
        sr,
        0.005,
        0.07,
      ),
      Math.floor(0.07 * sr),
      0.7,
    );
    return normalizar(x, 0.35);
  },
  golpe: (sr) => {
    // Puñetazo en la mesa al cantar órdago: caída de tono grave + madera.
    const x = envolvente(
      tono(sr, 0.35, (t) => 110 * Math.exp(-t * 6) + 45),
      sr,
      0.002,
      0.09,
    );
    mezclarEn(x, envolvente(pasoBanda(ruido(Math.floor(0.12 * sr), 21), sr, 600, 0.9), sr, 0.001, 0.03), 0, 0.9);
    mezclarEn(x, GENERADORES.monton(sr), Math.floor(0.04 * sr), 0.25);
    return normalizar(x, 0.95);
  },
  campana: (sr) => {
    // Campana de iglesia: parciales inarmónicos que decaen despacio.
    const dur = 2.4;
    const x = buffer(dur, sr);
    const parciales: [number, number, number][] = [
      [196, 1, 1.4],
      [392 * 1.19, 0.6, 1.0],
      [196 * 2.4, 0.5, 0.8],
      [196 * 3.9, 0.3, 0.5],
      [196 * 5.4, 0.2, 0.35],
    ];
    for (const [f, a, d] of parciales)
      mezclarEn(
        x,
        envolvente(
          tono(sr, dur, () => f),
          sr,
          0.003,
          d,
        ),
        0,
        a,
      );
    return normalizar(x, 0.8);
  },
  aplauso: (sr) => {
    const dur = 2.6;
    const x = buffer(dur, sr);
    const r = mulberry32(77);
    for (let k = 0; k < 110; k++) {
      const t = r() * (dur - 0.3) * (0.4 + 0.6 * r());
      const palma = envolvente(
        pasoBanda(ruido(Math.floor(0.03 * sr), 100 + k), sr, 900 + r() * 1400, 1.4),
        sr,
        0.001,
        0.008,
      );
      mezclarEn(x, palma, Math.floor(t * sr), 0.4 + r() * 0.6);
    }
    for (let i = 0; i < x.length; i++) x[i] *= Math.min(1, (x.length - i) / (0.8 * sr));
    return normalizar(x, 0.7);
  },
  murmullo: (sr) => {
    // Murmullo de bar: ruido con formantes de voz que se mueven despacio.
    const dur = 5;
    const base = ruido(Math.floor(dur * sr), 404);
    const a = pasoBanda(base, sr, 500, 1.2);
    const b = pasoBanda(base, sr, 1300, 1.5);
    const x = new Float32Array(base.length);
    for (let i = 0; i < x.length; i++) {
      const t = i / sr;
      const m1 = 0.5 + 0.5 * Math.sin(t * 4.1) * Math.sin(t * 1.3);
      const m2 = 0.5 + 0.5 * Math.sin(t * 3.3 + 1) * Math.sin(t * 0.7);
      x[i] = a[i] * m1 + b[i] * m2 * 0.6;
    }
    // Fundido en los bordes para que el bucle no haga clic.
    const f = Math.floor(0.2 * sr);
    for (let i = 0; i < f; i++) {
      x[i] *= i / f;
      x[x.length - 1 - i] *= i / f;
    }
    return normalizar(x, 0.5);
  },
  grillos: (sr) => {
    const dur = 2;
    const x = buffer(dur, sr);
    for (let k = 0; k < 8; k++) {
      const chirp = envolvente(
        tono(sr, 0.12, () => 4400),
        sr,
        0.005,
        0.02,
      );
      for (let i = 0; i < chirp.length; i++) chirp[i] *= 0.5 + 0.5 * Math.sin((i / sr) * 2 * Math.PI * 60);
      mezclarEn(x, chirp, Math.floor((0.1 + k * 0.23) * sr), 0.5);
    }
    return normalizar(x, 0.35);
  },
  cafetera: (sr) => {
    const x = pasoAlto(ruido(Math.floor(1.6 * sr), 55), 0.98);
    for (let i = 0; i < x.length; i++) {
      const t = i / sr;
      x[i] *= Math.min(1, t * 6) * Math.min(1, (1.6 - t) * 3) * (0.6 + 0.4 * Math.sin(t * 40));
    }
    return normalizar(x, 0.4);
  },
  vasos: (sr) => {
    const x = buffer(0.6, sr);
    for (const [t, f] of [
      [0, 2637],
      [0.15, 3136],
      [0.32, 2349],
    ]) {
      const v = envolvente(
        tono(sr, 0.3, () => f),
        sr,
        0.001,
        0.08,
      );
      mezclarEn(
        v,
        envolvente(
          tono(sr, 0.3, () => f * 2.7),
          sr,
          0.001,
          0.04,
        ),
        0,
        0.4,
      );
      mezclarEn(x, v, Math.floor(t * sr), 0.6);
    }
    return normalizar(x, 0.4);
  },
  tragaperras: (sr) => {
    // Pitidos de una tragaperras cualquiera, a lo lejos.
    const x = buffer(1.1, sr);
    const notas = [1047, 1319, 1568, 2093, 1568, 2093];
    notas.forEach((f, k) => {
      const v = envolvente(
        tono(
          sr,
          0.12,
          () => f,
          (p) => (Math.sin(p) > 0 ? 0.6 : -0.6),
        ),
        sr,
        0.002,
        0.04,
      );
      mezclarEn(x, v, Math.floor(k * 0.16 * sr), 0.5);
    });
    return normalizar(x, 0.3);
  },
  ladrido: (sr) => {
    const x = buffer(0.7, sr);
    for (const t of [0, 0.3]) {
      const v = tono(
        sr,
        0.18,
        (tt) => 520 - tt * 900,
        (p) => Math.sin(p) + 0.4 * Math.sin(2 * p),
      );
      mezclarEn(v, pasoBanda(ruido(v.length, 8), sr, 1200, 1), 0, 0.5);
      envolvente(v, sr, 0.01, 0.05);
      mezclarEn(x, v, Math.floor(t * sr), 0.8);
    }
    return normalizar(x, 0.7);
  },
  ambiente: (sr) => GENERADORES.murmullo(sr),
  // Percusión del secuenciador
  perc_b: (sr) =>
    normalizar(
      envolvente(
        tono(sr, 0.25, (t) => 140 * Math.exp(-t * 18) + 45),
        sr,
        0.001,
        0.07,
      ),
      0.9,
    ),
  perc_s: (sr) => {
    const x = envolvente(pasoBanda(ruido(Math.floor(0.18 * sr), 31), sr, 2500, 0.6), sr, 0.001, 0.04);
    mezclarEn(
      x,
      envolvente(
        tono(sr, 0.1, () => 190),
        sr,
        0.001,
        0.03,
      ),
      0,
      0.5,
    );
    return normalizar(x, 0.6);
  },
  perc_h: (sr) => normalizar(envolvente(pasoAlto(ruido(Math.floor(0.05 * sr), 41), 0.9), sr, 0.001, 0.012), 0.35),
  perc_c: (sr) => {
    // Castañuela: dos chasquidos de madera muy seguidos.
    const x = buffer(0.06, sr);
    const golpe = envolvente(pasoBanda(ruido(Math.floor(0.03 * sr), 51), sr, 2800, 3), sr, 0.0005, 0.006);
    mezclarEn(x, golpe, 0, 1);
    mezclarEn(x, golpe, Math.floor(0.012 * sr), 0.7);
    return normalizar(x, 0.6);
  },
  perc_p: (sr) => {
    // Palmas: tres ráfagas casi juntas.
    const x = buffer(0.12, sr);
    for (let k = 0; k < 3; k++) {
      mezclarEn(
        x,
        envolvente(pasoBanda(ruido(Math.floor(0.04 * sr), 61 + k), sr, 1400, 1.2), sr, 0.0005, 0.012),
        Math.floor(k * 0.008 * sr),
      );
    }
    return normalizar(x, 0.55);
  },
  perc_t: (sr) => {
    const x = envolvente(pasoAlto(ruido(Math.floor(0.2 * sr), 71), 0.97), sr, 0.001, 0.05);
    for (let i = 0; i < x.length; i++) x[i] *= 0.6 + 0.4 * Math.sin((i / sr) * 2 * Math.PI * 7000);
    return normalizar(x, 0.35);
  },
  perc_pl: (sr) => normalizar(envolvente(pasoAlto(ruido(Math.floor(0.8 * sr), 81), 0.96), sr, 0.002, 0.25), 0.4),
};

export function generarSfx(nombre: NombreSfx, sr = FRECUENCIA_SFX): Float32Array {
  return GENERADORES[nombre](sr);
}

export const NOMBRES_SFX = Object.keys(GENERADORES) as NombreSfx[];
