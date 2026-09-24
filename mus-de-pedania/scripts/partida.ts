// Partida completa IA contra IA con registro legible en consola.
//   npm run partida -- [--seed 7] [--dificultad normal] [--companero anselmo] [--rivales canijo,rufi] [--motivos]

import { crearJugador } from '../src/ai/fabrica';
import type { JugadorMus } from '../src/ai/jugadorMus';
import type { Dificultad } from '../src/ai/personalities';
import { jugarMano } from '../src/ai/arena';
import { mulberry32, derivarSemilla } from '../src/core/rng';
import { IDS_PERSONAJES, PERSONAJES, type IdPersonaje } from '../src/data/characters';
import { describirMano, NOMBRE_ASIENTO, narrar } from '../src/data/narrador.es';
import { crearConfig, type Seat } from '../src/mus/config';
import { PartidaMus } from '../src/mus/match';
import { argumentos } from './args';

const args = argumentos(process.argv.slice(2));
const semilla = Number(args.seed ?? 7);
const dificultad = (String(args.dificultad ?? 'normal') as Dificultad) || 'normal';
const verMotivos = Boolean(args.motivos);
const rng = mulberry32(semilla);

// Sur (el «humano», aquí también IA), Este, Norte (compañero), Oeste.
const libres = [...IDS_PERSONAJES];
const tomar = (id?: string): IdPersonaje => {
  const elegido = (
    id && libres.includes(id as IdPersonaje) ? id : libres[Math.floor(rng() * libres.length)]
  ) as IdPersonaje;
  libres.splice(libres.indexOf(elegido), 1);
  return elegido;
};
const sur = tomar(args.yo as string | undefined);
const norte = tomar(args.companero as string | undefined);
const [r1, r2] = String(args.rivales ?? '').split(',');
const este = tomar(r1);
const oeste = tomar(r2);
const ids: IdPersonaje[] = [sur, este, norte, oeste];
const nombres = ids.map((id) => PERSONAJES[id].corto);

const config = crearConfig({ juegosPartida: Number(args.juegos ?? 1) === 3 ? 3 : 1 });
const jugadores: JugadorMus[] = ids.map((id) =>
  crearJugador(
    { personalidad: PERSONAJES[id].stats, dificultad, nombre: PERSONAJES[id].corto, estilo: PERSONAJES[id].estilo },
    mulberry32(derivarSemilla(rng)),
  ),
);

console.log(`MUS DE PEDANÍA · Bar El Envite, Villaenvite · semilla ${semilla} · dificultad ${dificultad}`);
console.log(
  `Nosotros: ${nombres[0]} (Sur) y ${nombres[2]} (Norte)   ·   Ellos: ${nombres[1]} (Este) y ${nombres[3]} (Oeste)`,
);
console.log('');

const partida = new PartidaMus(config, rng);
while (!partida.terminada) {
  const m = partida.nuevaMano();
  console.log(
    `══ Juego ${partida.numeroJuego + 1} · mano ${partida.numeroMano + 1} ══════════════════════════════════════`,
  );
  let repartoMostrado = -1;
  const volcar = (decisor?: Seat) => {
    let motivoPendiente = decisor !== undefined && verMotivos;
    for (const e of m.sacarEventos()) {
      if (e.tipo === 'fase_mus' && repartoMostrado < e.ronda) {
        repartoMostrado = e.ronda;
        console.log(e.ronda === 0 ? 'Cartas:' : `Tras el descarte ${e.ronda}:`);
        for (const s of m.orden) {
          console.log(
            `   ${NOMBRE_ASIENTO[s].padEnd(6)}${nombres[s].padEnd(9)}${describirMano(m.manos[s], config.reyes)}`,
          );
        }
        continue;
      }
      const texto = narrar(e, nombres);
      if (texto) console.log(texto);
      if (motivoPendiente && e.tipo === 'habla' && e.jugador === decisor) {
        console.log(`      (${jugadores[decisor].ultimoMotivo})`);
        motivoPendiente = false;
      }
    }
  };
  volcar();
  jugarMano(m, jugadores, (_m, decisor) => volcar(decisor), [partida.juegos[0], partida.juegos[1]]);
  volcar();
  partida.cerrarMano();
  console.log('');
}
console.log(
  `FIN: gana la partida ${partida.ganador === 0 ? `Nosotros (${nombres[0]} y ${nombres[2]})` : `Ellos (${nombres[1]} y ${nombres[3]})`} en ${partida.numeroMano} manos.`,
);
