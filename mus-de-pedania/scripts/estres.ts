/* eslint-disable @typescript-eslint/no-explicit-any */
// Prueba de resistencia (H8): 200 manos IA contra IA en la escena de mesa a velocidad x10,
// sin errores, midiendo los fotogramas por segundo.
//   npx tsx scripts/estres.ts [--manos 200] [--turbo 10]

import { chromium } from 'playwright';
import { createServer } from 'vite';
import { argumentos } from './args';

const args = argumentos(process.argv.slice(2));
const objetivo = Number(args.manos ?? 200);
const turbo = Number(args.turbo ?? 10);

const servidor = await createServer({ server: { port: 5304 }, logLevel: 'error' });
await servidor.listen();
const puerto = servidor.config.server.port;
const navegador = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const pagina = await navegador.newPage({ viewport: { width: 960, height: 600 } });
const errores: string[] = [];
pagina.on('pageerror', (e) => errores.push(String(e.stack ?? e)));
pagina.on('console', (m) => m.type() === 'error' && errores.push(m.text()));
await pagina.goto(`http://localhost:${puerto}/?mesa&auto&turbo=${turbo}&senas=discreto&chivato`);
await pagina.waitForTimeout(1000);
// Medidor de fotogramas: tiempos entre requestAnimationFrame.
// (Como cadena: tsx añade ayudantes que no existen dentro de la página.)
await pagina.evaluate(`(() => {
  window.__frames = [];
  let prev = performance.now();
  const f = (t) => { window.__frames.push(t - prev); prev = t; requestAnimationFrame(f); };
  requestAnimationFrame(f);
})()`);

const t0 = Date.now();
let ultimo = -1;
for (;;) {
  const estado = await pagina.evaluate(() => {
    const m = (window as any).__mus;
    const mesa = m.escenas.actual;
    return { manos: m.manosTerminadas + (mesa?.estadisticas?.manos ?? 0), partidas: m.partidasTerminadas };
  });
  if (estado.manos !== ultimo && estado.manos % 25 === 0) {
    console.log(`${estado.manos} manos, ${estado.partidas} partidas (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
    ultimo = estado.manos;
  }
  if (estado.manos >= objetivo) break;
  if (errores.length || Date.now() - t0 > 1_500_000) break;
  await pagina.waitForTimeout(1000);
}
const frames: number[] = await pagina.evaluate(() => (window as any).__frames);
const utiles = frames.slice(30);
const media = utiles.reduce((a, b) => a + b, 0) / utiles.length;
const lentos = utiles.filter((d) => d > 1000 / 45).length;
const ordenados = [...utiles].sort((a, b) => a - b);
const p99 = ordenados[Math.floor(ordenados.length * 0.99)];
console.log(
  `Fotogramas: ${utiles.length} · media ${(1000 / media).toFixed(1)} fps · p99 ${p99.toFixed(1)} ms · por debajo de 45 fps: ${((100 * lentos) / utiles.length).toFixed(2)} %`,
);
console.log(`Tiempo total: ${((Date.now() - t0) / 1000).toFixed(0)} s`);
if (errores.length) {
  console.log('ERRORES:');
  for (const e of errores) console.log(e);
  process.exitCode = 1;
}
await navegador.close();
await servidor.close();
