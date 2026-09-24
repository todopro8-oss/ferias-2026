/* eslint-disable @typescript-eslint/no-explicit-any */
// Juega partidas completas como humano (con teclas y clics reales) y comprueba que no hay errores.
//   npx tsx scripts/jugar-humano.ts [--partidas 1] [--turbo 6] [--semilla 3]

import { chromium } from 'playwright';
import { createServer } from 'vite';
import { argumentos } from './args';

const args = argumentos(process.argv.slice(2));
const partidas = Number(args.partidas ?? 1);
const turbo = Number(args.turbo ?? 6);
const semilla = Number(args.semilla ?? 3);
const url = String(args.url ?? '');

const servidor = await createServer({ server: { port: 5301 }, logLevel: 'error' });
await servidor.listen();
const puerto = servidor.config.server.port;
const navegador = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const pagina = await navegador.newPage({ viewport: { width: 640, height: 400 } });
const errores: string[] = [];
pagina.on('pageerror', (e) => errores.push(String(e.stack ?? e)));
pagina.on('console', (m) => m.type() === 'error' && errores.push(m.text()));
await pagina.goto(`http://localhost:${puerto}/?semilla=${semilla}&turbo=${turbo}${url}`);
await pagina.waitForTimeout(1000);

let decisiones = 0;
const t0 = Date.now();
while (Date.now() - t0 < 600_000) {
  const info = await pagina.evaluate(() => {
    const m = (window as any).__mus;
    const mesa = m.escenas.actual;
    return { terminadas: m.partidasTerminadas, nombre: mesa?.nombre, dep: mesa?.depuracion };
  });
  if (info.terminadas >= partidas) break;
  if (info.nombre !== 'Mesa' || !info.dep) {
    await pagina.waitForTimeout(100);
    continue;
  }
  const { estado, decision, misCartas } = info.dep;
  if (estado === 'continuar') {
    await pagina.keyboard.press('Space');
  } else if (estado === 'humano' && decision) {
    decisiones++;
    const r = Math.random();
    if (decision.tipo === 'mus') await pagina.keyboard.press(r < 0.5 ? 'm' : 'n');
    else if (decision.tipo === 'descarte') {
      const n = 1 + Math.floor(Math.random() * Math.min(4, misCartas.length));
      for (let i = 1; i <= n; i++) await pagina.keyboard.press(String(i));
      await pagina.keyboard.press('d');
    } else if (decision.opciones.includes('paso')) {
      if (r < 0.5) await pagina.keyboard.press('p');
      else if (r < 0.9) {
        await pagina.keyboard.press('ArrowRight');
        await pagina.keyboard.press('e');
      } else await pagina.keyboard.press('o');
    } else {
      if (r < 0.45) await pagina.keyboard.press('q');
      else if (r < 0.9) await pagina.keyboard.press('x');
      else if (decision.opciones.includes('envido')) await pagina.keyboard.press('+');
      else await pagina.keyboard.press('x');
    }
  }
  await pagina.waitForTimeout(60);
}
const final = await pagina.evaluate(() => (window as any).__mus.partidasTerminadas);
const resultado = await pagina.evaluate(() => (window as any).__mus.ultimoResultado);
console.log(`Partidas terminadas: ${final} · decisiones del humano: ${decisiones} · ${(Date.now() - t0) / 1000}s`);
console.log('Último resultado:', JSON.stringify(resultado));
if (errores.length) {
  console.log('ERRORES:');
  for (const e of errores) console.log(e);
  process.exitCode = 1;
}
if (final < partidas) {
  console.log('No se terminaron todas las partidas');
  process.exitCode = 1;
}
await navegador.close();
await servidor.close();
