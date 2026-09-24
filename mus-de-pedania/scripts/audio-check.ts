/* eslint-disable @typescript-eslint/no-explicit-any */
// Comprueba el audio en un navegador real (Chromium sin pantalla): renderiza offline la
// música, los SFX y las voces, y mide pico, nivel y saltos (clics). También arranca el
// motor en tiempo real y comprueba que no hay errores.
//   npx tsx scripts/audio-check.ts

import { chromium } from 'playwright';
import { createServer } from 'vite';

const servidor = await createServer({ server: { port: 5303 }, logLevel: 'error' });
await servidor.listen();
const puerto = servidor.config.server.port;
const navegador = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--autoplay-policy=no-user-gesture-required'],
});
const pagina = await navegador.newPage();
const errores: string[] = [];
pagina.on('pageerror', (e) => errores.push(String(e.stack ?? e)));
pagina.on('console', (m) => m.type() === 'error' && errores.push(m.text()));
await pagina.goto(`http://localhost:${puerto}/?menu`);
await pagina.waitForTimeout(800);

const resultado = await pagina.evaluate(async () => {
  const render = await import('/src/audio/render.ts' as string);
  const canciones = (await import('/src/audio/songs/index.ts' as string)).CANCIONES;
  const sfx = await import('/src/audio/sfx.ts' as string);
  const voces = await import('/src/audio/voices.ts' as string);
  const res: Record<string, any> = {};
  for (const nombre of ['popurri', 'victoria', 'derrota', 'charanga']) {
    const b = await render.renderizarCancion(canciones[nombre], nombre === 'popurri' ? 20 : 6);
    res[`música ${nombre}`] = render.medir(b);
  }
  for (const n of sfx.NOMBRES_SFX) {
    const d = sfx.generarSfx(n);
    let pico = 0;
    for (const v of d) pico = Math.max(pico, Math.abs(v));
    res[`sfx ${n}`] = { pico, duracion: d.length / sfx.FRECUENCIA_SFX };
  }
  for (const quien of ['anselmo', 'rufi', 'canijo', 'julian', 'humano']) {
    const b = await render.renderizarVoz('¡Órdago, y luego me lo contáis!', voces.vozDe(quien));
    res[`voz ${quien}`] = render.medir(b);
  }
  // Motor en tiempo real
  const m = (window as any).__mus;
  m.juego.audio.desbloquear();
  m.juego.audio.musica('popurri');
  m.juego.audio.sfx('barajar');
  m.juego.audio.voz('rufi', 'mus', '¡Mus, cariño!', 0);
  await new Promise((r) => setTimeout(r, 1500));
  res['motor activo'] = m.juego.audio.activo;
  return res;
});

let mal = 0;
for (const [k, v] of Object.entries(resultado)) {
  if (typeof v !== 'object') {
    console.log(`${k}: ${v}`);
    continue;
  }
  const r = v as { pico: number; rms?: number; saltoMax?: number; duracion: number };
  const avisos: string[] = [];
  if (!(r.pico > 0.01)) avisos.push('SILENCIO');
  if (r.pico > 1.0) avisos.push('SATURA');
  // Las voces llevan ruido de consonantes: se les permite más salto entre muestras.
  if (r.saltoMax !== undefined && r.saltoMax > (k.startsWith('voz') ? 0.9 : 0.6)) avisos.push('CLIC');
  if (avisos.length) mal++;
  console.log(
    `${k.padEnd(18)} pico ${r.pico.toFixed(2)}${r.rms !== undefined ? ` · rms ${r.rms.toFixed(3)}` : ''}${
      r.saltoMax !== undefined ? ` · salto ${r.saltoMax.toFixed(2)}` : ''
    } · ${r.duracion.toFixed(1)} s ${avisos.join(' ')}`,
  );
}
if (errores.length) {
  console.log('ERRORES:');
  for (const e of errores) console.log(e);
  process.exitCode = 1;
}
if (mal) process.exitCode = 1;
await navegador.close();
await servidor.close();
