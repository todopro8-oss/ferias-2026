// Simulador de manos IA contra IA.
//   npm run sim -- --hands 10000 --seed 1 [--ia aleatoria|heuristica] [--reyes 4] [--puntos 30] [--juegos 3]

import { JugadorAleatorio } from '../src/ai/aleatoria';
import { simular } from '../src/ai/arena';
import { crearJugadorPorDefecto } from '../src/ai/fabrica';
import type { JugadorIA } from '../src/ai/jugador';
import { mulberry32 } from '../src/core/rng';
import { crearConfig, type Seat } from '../src/mus/config';
import { argumentos } from './args';

const args = argumentos(process.argv.slice(2));
const manos = Number(args.hands ?? args.manos ?? 10000);
const semilla = Number(args.seed ?? args.semilla ?? 1);
const tipoIA = String(args.ia ?? 'aleatoria');
const config = crearConfig({
  reyes: Number(args.reyes ?? 8) === 4 ? 4 : 8,
  puntosJuego: Number(args.puntos ?? 40) === 30 ? 30 : 40,
  juegosPartida: Number(args.juegos ?? 1) === 3 ? 3 : 1,
  musCorrido: Boolean(args.corrido),
});

const rng = mulberry32(semilla);
const t0 = performance.now();
const st = simular({
  manos,
  config,
  rng,
  crearJugadores: (partida) =>
    [0, 1, 2, 3].map((s): JugadorIA =>
      tipoIA === 'aleatoria'
        ? new JugadorAleatorio(rng)
        : crearJugadorPorDefecto(s as Seat, mulberry32(semilla * 7919 + partida * 4 + s)),
    ),
});
const ms = performance.now() - t0;

const pct = (a: number, b: number) => (b === 0 ? '—' : `${((100 * a) / b).toFixed(1)} %`);
console.log(`Mus de Pedanía · simulador (IA ${tipoIA}, semilla ${semilla})`);
console.log(`Reglas: ${config.reyes} reyes, a ${config.puntosJuego}, ${config.juegosPartida} juego(s)`);
console.log('');
console.log(`Manos:        ${st.manos}`);
console.log(
  `Juegos:       ${st.juegos}   (por deje ${st.finJuego.deje}, órdago ${st.finJuego.ordago}, recuento ${st.finJuego.recuento})`,
);
console.log(`Partidas:     ${st.partidas}   (Nosotros ${st.partidasGanadas[0]} · Ellos ${st.partidasGanadas[1]})`);
console.log(`Decisiones:   ${st.decisiones}   (${(st.decisiones / st.manos).toFixed(1)} por mano)`);
console.log(
  `Rondas de mus por mano: ${(st.rondasMus / st.manos).toFixed(2)}   · manos con descartes rebarajados: ${st.rebarajados}`,
);
console.log(`Piedras por mano: ${(st.piedras / st.manos).toFixed(2)}`);
console.log(
  `Órdagos: ${st.ordagos.lanzados} lanzados, ${st.ordagos.aceptados} aceptados (${pct(st.ordagos.aceptados, st.ordagos.lanzados)})`,
);
console.log('');
console.log('Lance     paso   querido  rechazado  solo   nadie');
for (const [lance, r] of Object.entries(st.lances)) {
  const col = (k: string) => String(r[k] ?? 0).padStart(7);
  console.log(`${lance.padEnd(8)}${col('paso')}${col('querido')}${col('rechazado')}  ${col('solo')}${col('nadie')}`);
}
console.log('');
console.log(`Sin errores. ${ms.toFixed(0)} ms (${((1000 * ms) / st.manos).toFixed(0)} µs por mano).`);
