// Capturas automáticas con Playwright (sección 16: revisar la mesa a 1x y 3x).
//   npx tsx scripts/captura.ts --url "?galeria=cartas" --escala 3 --salida screenshots/cartas.png [--esperar 800]
// Con --pasos "clic:120,150;espera:500;tecla:m" se pueden encadenar acciones antes de la captura.

import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';
import { argumentos } from './args';

const args = argumentos(process.argv.slice(2));
const escala = Number(args.escala ?? 3);
const url = String(args.url ?? '');
const salida = String(args.salida ?? 'screenshots/captura.png');
const esperar = Number(args.esperar ?? 800);
const pasos = String(args.pasos ?? '')
  .split(';')
  .map((s) => s.trim())
  .filter(Boolean);
const capturasIntermedias = Boolean(args.intermedias);

const servidor = await createServer({ server: { port: 5299, strictPort: false }, logLevel: 'error' });
await servidor.listen();
const puerto = servidor.config.server.port ?? 5299;
const navegador = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});
try {
  const pagina = await navegador.newPage({ viewport: { width: 320 * escala, height: 200 * escala } });
  const errores: string[] = [];
  pagina.on('pageerror', (e) => errores.push(String(e)));
  pagina.on('console', (m) => {
    if (m.type() === 'error') errores.push(m.text());
  });
  await pagina.goto(`http://localhost:${puerto}/${url}`);
  await pagina.waitForTimeout(esperar);
  const canvas = pagina.locator('#pantalla');
  const caja = await canvas.boundingBox();
  let n = 0;
  for (const paso of pasos) {
    const [tipo, ...resto] = paso.split(':');
    const valor = resto.join(':');
    if (tipo === 'clic') {
      const [x, y] = valor.split(',').map(Number);
      await pagina.mouse.click(caja!.x + (x + 0.5) * (caja!.width / 320), caja!.y + (y + 0.5) * (caja!.height / 200));
    } else if (tipo === 'mover') {
      const [x, y] = valor.split(',').map(Number);
      await pagina.mouse.move(caja!.x + (x + 0.5) * (caja!.width / 320), caja!.y + (y + 0.5) * (caja!.height / 200));
    } else if (tipo === 'tecla') {
      await pagina.keyboard.press(valor);
    } else if (tipo === 'espera') {
      await pagina.waitForTimeout(Number(valor));
    } else if (tipo === 'eval') {
      await pagina.evaluate(valor);
    } else if (tipo === 'foto') {
      const ruta = salida.replace(/\.png$/, `-${valor || ++n}.png`);
      mkdirSync(dirname(ruta), { recursive: true });
      await canvas.screenshot({ path: ruta });
      console.log(`Captura: ${ruta}`);
    }
    if (capturasIntermedias) {
      const ruta = salida.replace(/\.png$/, `-paso${++n}.png`);
      await canvas.screenshot({ path: ruta });
    }
  }
  mkdirSync(dirname(salida), { recursive: true });
  await canvas.screenshot({ path: salida });
  console.log(`Captura: ${salida}`);
  if (errores.length) {
    console.log('Errores en la página:');
    for (const e of errores) console.log(`  ${e}`);
    process.exitCode = 1;
  }
} finally {
  await navegador.close();
  await servidor.close();
}
