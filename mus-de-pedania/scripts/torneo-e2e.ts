/* eslint-disable @typescript-eslint/no-explicit-any */
// Prueba de extremo a extremo del torneo: inscripción, selección, cuadro, partidas (jugadas
// con teclas), fin de partida, guardado en localStorage y recarga a mitad de torneo.
//   npx tsx scripts/torneo-e2e.ts [--turbo 8]

import { chromium, type Page } from 'playwright';
import { createServer } from 'vite';
import { argumentos } from './args';

const args = argumentos(process.argv.slice(2));
const turbo = Number(args.turbo ?? 8);

const servidor = await createServer({ server: { port: 5302 }, logLevel: 'error' });
await servidor.listen();
const puerto = servidor.config.server.port;
const navegador = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const pagina = await navegador.newPage({ viewport: { width: 640, height: 400 } });
const errores: string[] = [];
pagina.on('pageerror', (e) => errores.push(String(e.stack ?? e)));
pagina.on('console', (m) => m.type() === 'error' && errores.push(m.text()));

const url = `http://localhost:${puerto}/?menu&turbo=${turbo}`;
await pagina.goto(url);
await pagina.waitForTimeout(800);
await pagina.evaluate(() => localStorage.clear());

const escena = (p: Page) => p.evaluate(() => (window as any).__mus.escenas.actual?.nombre as string);

// Para recorrer el torneo entero, cada partida la gana tu pareja (el resultado de las manos se juega igual).
await pagina.evaluate(() => {
  (window as any).__mus.flujo.forzarGanador = 0;
  (window as any).__mus.flujo.nuevoTorneo();
});
await pagina.waitForTimeout(200);
await pagina.keyboard.type('Prueba');
await pagina.keyboard.press('Enter');
await pagina.waitForTimeout(300);
console.log('Tras el nombre:', await escena(pagina));
await pagina.keyboard.press('1'); // Don Anselmo de compañero
await pagina.waitForTimeout(300);
console.log('Tras elegir compañero:', await escena(pagina));

let recargado = false;
let partidas = 0;
const t0 = Date.now();
while (Date.now() - t0 < 900_000) {
  const nombre = await escena(pagina);
  if (nombre === 'Cuadro') {
    const estado = await pagina.evaluate(() => {
      const t = (window as any).__mus.flujo.torneo;
      return { ronda: t?.rondaActual, campeon: t?.campeon, eliminado: t?.eliminado };
    });
    if (estado.campeon || estado.eliminado) {
      console.log('Fin del torneo:', JSON.stringify(estado));
      break;
    }
    // A mitad de torneo, recargar la página: el progreso debe seguir ahí.
    if (!recargado && estado.ronda >= 1) {
      recargado = true;
      await pagina.goto(url);
      await pagina.waitForTimeout(800);
      const tras = await pagina.evaluate(() => (window as any).__mus.flujo.torneo?.rondaActual);
      console.log(`Recarga a mitad de torneo: ronda guardada = ${tras}`);
      if (tras !== estado.ronda) errores.push('El torneo no se recuperó tras recargar');
      await pagina.evaluate(() => {
        (window as any).__mus.flujo.forzarGanador = 0;
        (window as any).__mus.flujo.torneoComarcal();
      });
      await pagina.waitForTimeout(300);
      continue;
    }
    await pagina.keyboard.press('Enter');
  } else if (nombre === 'FinPartida') {
    partidas++;
    console.log(`Partida ${partidas} terminada`);
    await pagina.keyboard.press('Enter');
  } else if (nombre === 'Campeon') {
    console.log('¡Campeones!');
    await pagina.waitForTimeout(1500);
    const { mkdirSync } = await import('node:fs');
    mkdirSync('screenshots', { recursive: true });
    await pagina.locator('#pantalla').screenshot({ path: 'screenshots/campeon.png' });
    break;
  } else if (nombre === 'Mesa') {
    const dep = await pagina.evaluate(() => (window as any).__mus.escenas.actual.depuracion);
    if (dep.estado === 'continuar') await pagina.keyboard.press('Space');
    else if (dep.estado === 'humano' && dep.decision) {
      const d = dep.decision;
      if (d.tipo === 'mus') await pagina.keyboard.press('n');
      else if (d.tipo === 'descarte') {
        await pagina.keyboard.press('1');
        await pagina.keyboard.press('d');
      } else if (d.opciones.includes('paso')) await pagina.keyboard.press(Math.random() < 0.6 ? 'e' : 'p');
      else await pagina.keyboard.press(Math.random() < 0.6 ? 'q' : 'x');
    }
  }
  await pagina.waitForTimeout(50);
}
const guardado = await pagina.evaluate(() => ({
  torneo: localStorage.getItem('musped.torneo')?.slice(0, 60),
  estadisticas: localStorage.getItem('musped.estadisticas'),
}));
console.log('Guardado:', JSON.stringify(guardado));
if (errores.length) {
  console.log('ERRORES:');
  for (const e of errores) console.log(e);
  process.exitCode = 1;
}
await navegador.close();
await servidor.close();
