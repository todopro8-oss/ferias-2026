// Estimación por Monte Carlo (sección 6.2): genera `n` repartos de las cartas desconocidas
// coherentes con lo que se sabe (declaraciones de pares y juego, señas vistas) y cuenta
// cuántas veces gana cada lance mi pareja. Además pondera cada reparto por lo verosímil
// que hace el comportamiento de la mesa en el lance actual (quien envida suele llevar cartas).

import { randInt, type Rng } from '../core/rng';
import { tablaRangos, type Carta } from '../mus/cards';
import { companero, equipoDe, ordenDesde, type Seat } from '../mus/config';
import {
  claveChica,
  claveGrande,
  claveJuego,
  clavePares,
  clavePunto,
  pares,
  sumaJuego,
  type Lance,
} from '../mus/evaluate';
import { cartasDesconocidas } from './discard';
import type { Estimacion, Estimador } from './estimacion';
import { percentilEnLance, tablas } from './handValue';
import type { SignificadoSena, VistaJugador } from './view';

type Restriccion = (mano: Carta[]) => boolean;

/** Traduce una seña a una condición sobre la mano de quien la hizo. */
export function restriccionSena(s: SignificadoSena, reyes: 8 | 4): Restriccion {
  const t = tablaRangos(reyes);
  const cuenta = (m: Carta[], r: number) => m.reduce((a, c) => a + (t[c] === r ? 1 : 0), 0);
  switch (s) {
    case 'reyes':
      return (m) => cuenta(m, 12) >= 2;
    case 'tresReyes':
      return (m) => cuenta(m, 12) >= 3;
    case 'ases':
      return (m) => cuenta(m, 1) >= 2;
    case 'medias':
      return (m) => pares(m, reyes).tipo === 2;
    case 'duples':
      return (m) => pares(m, reyes).tipo === 3;
    case 'treintayuna':
      return (m) => {
        const x = sumaJuego(m, reyes);
        return x === 31 || x === 30;
      };
    case 'ciego':
      return (m) => pares(m, reyes).tipo === 0 && sumaJuego(m, reyes) < 31;
  }
}

function sigmoide(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

export interface ResultadoMonteCarlo extends Estimacion {
  muestras: number;
  /** Muestras en las que hubo que relajar alguna restricción. */
  relajadas: number;
  ms: number;
}

export class EstimadorMonteCarlo implements Estimador {
  /** Pondera los repartos según las apuestas vistas en el lance actual. */
  usarVerosimilitud = true;

  constructor(
    readonly n: number,
    private readonly rng: Rng,
  ) {}

  estimar(vista: VistaJugador): ResultadoMonteCarlo {
    const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const reyes = vista.config.reyes;
    const yo = vista.yo;
    const miEquipo = equipoDe(yo);
    const otros = ordenDesde(vista.mano).filter((s) => s !== yo);
    const pool = cartasDesconocidas(vista);

    // Restricciones duras por asiento: declaraciones (seguras) y señas (relajables).
    const duras: Record<number, Restriccion[]> = {};
    const blandas: Record<number, Restriccion[]> = {};
    for (const s of otros) {
      duras[s] = [];
      blandas[s] = [];
      const dp = vista.declaraciones.pares;
      const dj = vista.declaraciones.juego;
      if (dp) duras[s].push((m) => pares(m, reyes).tipo > 0 === dp[s]);
      if (dj) duras[s].push((m) => sumaJuego(m, reyes) >= 31 === dj[s]);
    }
    for (const sena of vista.senas) {
      if (sena.de === yo || !blandas[sena.de]) continue;
      blandas[sena.de].push(restriccionSena(sena.significado, reyes));
    }

    // Comportamiento en el lance actual (para ponderar).
    const lanceActual = vista.apuesta?.lance ?? null;
    const t = tablas(reyes);
    const apuestas: { s: Seat; fuerte: boolean }[] = [];
    if (this.usarVerosimilitud && lanceActual) {
      for (const h of vista.historial) {
        if (h.lance !== lanceActual || h.jugador === yo) continue;
        if (h.voz === 'envido' || h.voz === 'envidoMas' || h.voz === 'ordago')
          apuestas.push({ s: h.jugador, fuerte: true });
        else if (h.voz === 'paso') apuestas.push({ s: h.jugador, fuerte: false });
      }
    }

    const ganadas: Record<Lance, number> = { grande: 0, chica: 0, pares: 0, juego: 0, punto: 0 };
    const jugadas: Record<Lance, number> = { grande: 0, chica: 0, pares: 0, juego: 0, punto: 0 };
    let piedras = 0;
    let pesoTotal = 0;
    let relajadas = 0;

    const manos: Carta[][] = [[], [], [], []];
    manos[yo] = vista.cartas;
    const bolsa = pool.slice();
    const usado = new Uint8Array(40);

    for (let k = 0; k < this.n; k++) {
      usado.fill(0);
      let relajada = false;
      for (const s of otros) {
        let intentos = 0;
        let nivel = 0; // 0 = todo; 1 = sin señas; 2 = sin nada
        for (;;) {
          const m = this.robar(bolsa, usado, 4);
          const ok = (nivel >= 2 || duras[s].every((f) => f(m))) && (nivel >= 1 || blandas[s].every((f) => f(m)));
          if (ok) {
            for (const c of m) usado[c] = 1;
            manos[s] = m;
            break;
          }
          if (++intentos >= 50) {
            intentos = 0;
            nivel++;
            relajada = true;
          }
        }
      }
      if (relajada) relajadas++;

      // Verosimilitud de lo que han hecho en este lance según las manos simuladas.
      let peso = 1;
      if (lanceActual && apuestas.length > 0) {
        for (const a of apuestas) {
          const pct = percentilEnLance(t, lanceActual, manos[a.s]);
          const deseo = sigmoide((pct - 0.5) / 0.15);
          // Quien envida suele llevar mano (o confía en su compañero, o farolea): efecto moderado.
          peso *= a.fuerte ? 0.3 + 0.7 * deseo : 1 - 0.35 * deseo;
        }
      }
      pesoTotal += peso;

      // Ganador de cada lance en este reparto.
      const mano = vista.mano;
      const orden = ordenDesde(mano);
      let mejorG = -1;
      let gG: Seat = orden[0];
      let mejorC = -1;
      let gC: Seat = orden[0];
      let mejorP = 0;
      let gP: Seat | null = null;
      let mejorJ = 0;
      let gJ: Seat | null = null;
      let mejorPt = -1;
      let gPt: Seat = orden[0];
      for (const s of orden) {
        const m = manos[s];
        const kg = claveGrande(m, reyes);
        if (kg > mejorG) {
          mejorG = kg;
          gG = s;
        }
        const kc = claveChica(m, reyes);
        if (kc > mejorC) {
          mejorC = kc;
          gC = s;
        }
        const kp = clavePares(m, reyes);
        if (kp > mejorP) {
          mejorP = kp;
          gP = s;
        }
        const kj = claveJuego(m, reyes);
        if (kj > mejorJ) {
          mejorJ = kj;
          gJ = s;
        }
        const kpt = clavePunto(m, reyes);
        if (kpt > mejorPt) {
          mejorPt = kpt;
          gPt = s;
        }
      }
      const nuestro = (s: Seat | null) => (s !== null && equipoDe(s) === miEquipo ? 1 : 0);
      ganadas.grande += peso * nuestro(gG);
      jugadas.grande += peso;
      ganadas.chica += peso * nuestro(gC);
      jugadas.chica += peso;
      if (gP !== null) {
        ganadas.pares += peso * nuestro(gP);
        jugadas.pares += peso;
      }
      if (gJ !== null) {
        ganadas.juego += peso * nuestro(gJ);
        jugadas.juego += peso;
      } else {
        ganadas.punto += peso * nuestro(gPt);
        jugadas.punto += peso;
      }
      // Piedras esperadas (en paso): grande y chica 1, jugadas del equipo ganador.
      let pz = nuestro(gG) + nuestro(gC);
      if (gP !== null && nuestro(gP)) {
        for (const s of [yo, companero(yo)]) pz += pares(manos[s], reyes).tipo;
      }
      if (gJ !== null && nuestro(gJ)) {
        for (const s of [yo, companero(yo)]) {
          const x = sumaJuego(manos[s], reyes);
          pz += x === 31 ? 3 : x > 31 ? 2 : 0;
        }
      } else if (gJ === null) pz += nuestro(gPt);
      piedras += peso * pz;
    }

    const p = (l: Lance) => (jugadas[l] > 0 ? ganadas[l] / jugadas[l] : 0.5);
    const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now();
    return {
      p: { grande: p('grande'), chica: p('chica'), pares: p('pares'), juego: p('juego'), punto: p('punto') },
      piedras: pesoTotal > 0 ? piedras / pesoTotal : 0,
      condicionada: this.usarVerosimilitud,
      muestras: this.n,
      relajadas,
      ms: t1 - t0,
    };
  }

  /** Roba `n` cartas no usadas de la bolsa (Fisher-Yates parcial, sin tocar las usadas). */
  private robar(bolsa: Carta[], usado: Uint8Array, n: number): Carta[] {
    const res: Carta[] = [];
    let intentos = 0;
    while (res.length < n && intentos < 400) {
      intentos++;
      const c = bolsa[randInt(this.rng, bolsa.length)];
      if (usado[c] || res.includes(c)) continue;
      res.push(c);
    }
    return res;
  }
}
