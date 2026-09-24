// Tabla del estilo de juego de cada personaje (para comprobar que se nota).
//   npm run personalidades -- [--manos 400] [--dificultad normal]

import { medirPerfil } from '../src/ai/perfilado';
import type { Dificultad } from '../src/ai/personalities';
import { IDS_PERSONAJES, PERSONAJES } from '../src/data/characters';
import { argumentos } from './args';

const args = argumentos(process.argv.slice(2));
const manos = Number(args.manos ?? 400);
const dificultad = String(args.dificultad ?? 'normal') as Dificultad;
const pct = (x: number) => `${(x * 100).toFixed(0)} %`.padStart(7);

console.log(`Estilo de juego medido en ${manos} manos por personaje (dificultad ${dificultad})`);
console.log('Personaje     corta mus  envida  farolea  órdagos/100  quiere');
for (const id of IDS_PERSONAJES) {
  const p = PERSONAJES[id];
  const m = medirPerfil(p.stats, p.estilo, manos, 77, dificultad);
  console.log(
    `${p.corto.padEnd(12)}${pct(m.corteMus)}   ${pct(m.envida)} ${pct(m.farolea)}   ${(m.ordagos * 100).toFixed(1).padStart(8)}   ${pct(m.quiere)}`,
  );
}
