// Genera:
//  - assets/voices/manifest.json con las voces grabadas que existan (assets/voices/<personaje>/<evento>_<n>.ogg)
//  - assets/sprites/manifest.json con el arte final que exista (assets/sprites/<id>.png + .json)
//  - VOICES.md con todas las líneas, su ruta de archivo y la guía de grabación.
//   npm run voices:manifest

import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { IDS_PERSONAJES, PERSONAJES } from '../src/data/characters';
import { CAMEOS, EVENTOS_VOZ, LINEAS, LINEAS_NICANOR } from '../src/data/lines.es';

const RAIZ = join(import.meta.dirname, '..');
const VOCES = join(RAIZ, 'assets', 'voices');
const SPRITES = join(RAIZ, 'assets', 'sprites');
mkdirSync(VOCES, { recursive: true });
mkdirSync(SPRITES, { recursive: true });

// --- Manifiesto de voces --------------------------------------------------------
const voces: Record<string, string[]> = {};
let totalGrabadas = 0;
for (const dir of readdirSync(VOCES, { withFileTypes: true })) {
  if (!dir.isDirectory()) continue;
  for (const f of readdirSync(join(VOCES, dir.name))) {
    const m = f.match(/^([a-zA-Z]+)_(\d+)\.(ogg|mp3|wav)$/);
    if (!m) continue;
    const clave = `${dir.name}/${m[1]}`;
    (voces[clave] ??= []).push(`voices/${dir.name}/${f}`);
    totalGrabadas++;
  }
}
writeFileSync(join(VOCES, 'manifest.json'), `${JSON.stringify({ voces }, null, 2)}\n`);

// --- Manifiesto de sprites -------------------------------------------------------
const sprites = readdirSync(SPRITES)
  .filter((f) => f.endsWith('.png') && existsSync(join(SPRITES, f.replace(/\.png$/, '.json'))))
  .map((f) => f.replace(/\.png$/, ''));
writeFileSync(join(SPRITES, 'manifest.json'), `${JSON.stringify({ sprites }, null, 2)}\n`);

// --- VOICES.md -------------------------------------------------------------------
const md: string[] = [];
md.push('# VOICES.md — guion de voces de Mus de Pedanía');
md.push('');
md.push('Todas las líneas que dicen los personajes, con el archivo que hay que grabar para cada una.');
md.push('Mientras falte un archivo, el juego usa el balbuceo sintético (`src/audio/babble.ts`).');
md.push(
  'Este archivo se genera con `npm run voices:manifest` a partir de `src/data/lines.es.ts`: no lo edites a mano.',
);
md.push('');
md.push('## Guía de grabación');
md.push('');
md.push('- **Formato:** mono, 22 050 Hz, exportado a Ogg Vorbis (`.ogg`). También valen `.wav` y `.mp3`.');
md.push('- **Nivel:** normalizado a **−3 dBFS** de pico. Sin compresión exagerada.');
md.push('- **Silencio:** 0,2 s de silencio al principio y al final de cada toma.');
md.push('- **Ruta:** `assets/voices/<personaje>/<evento>_<n>.ogg`, con `n` = número de la variante (1, 2, 3…).');
md.push('- **Cantidades:** las líneas con `{n}` se graban diciendo «dos» (o «Dos» si es `{N}`). El juego sólo');
md.push('  usa esa toma cuando la cantidad es dos; con otras cantidades, balbucea.');
md.push('- **Actuación:** cada personaje tiene su voz (abajo). Retranca y costumbrismo, sin imitar a nadie real.');
md.push('- **Después de grabar:** ejecuta `npm run voices:manifest` para que el juego encuentre los archivos.');
md.push('');
md.push(`Voces grabadas encontradas: **${totalGrabadas}**.`);
md.push('');
let totalLineas = 0;
for (const id of IDS_PERSONAJES) {
  const p = PERSONAJES[id];
  md.push(`## ${p.nombre} (\`${id}\`)`);
  md.push('');
  md.push(`${p.oficio}. Voz: ${p.vozDescripcion.toLowerCase()}.`);
  md.push('');
  md.push('| Evento | Archivo | Línea | Grabada |');
  md.push('|---|---|---|---|');
  for (const ev of EVENTOS_VOZ) {
    LINEAS[id][ev].forEach((l, i) => {
      const ruta = `voices/${id}/${ev}_${i + 1}.ogg`;
      const hecha = (voces[`${id}/${ev}`] ?? []).some((r) => r.replace(/\.(mp3|wav)$/, '.ogg') === ruta) ? 'sí' : '—';
      md.push(`| ${ev} | \`assets/${ruta}\` | ${l.replaceAll('|', '\\|')} | ${hecha} |`);
      totalLineas++;
    });
  }
  md.push('');
}
md.push('## Nicanor (`nicanor`)');
md.push('');
md.push('El camarero. Voz campechana, de barra de bar.');
md.push('');
md.push('| Archivo | Línea |');
md.push('|---|---|');
LINEAS_NICANOR.forEach((l, i) => md.push(`| \`assets/voices/nicanor/idle_${i + 1}.ogg\` | ${l} |`));
md.push('');
md.push('## Cameos');
md.push('');
md.push('| Personaje | Archivo | Línea |');
md.push('|---|---|---|');
for (const c of CAMEOS)
  c.lineas.forEach((l, i) => md.push(`| ${c.nombre} | \`assets/voices/${c.id}/cameo_${i + 1}.ogg\` | ${l} |`));
md.push('');
md.push(`Total de líneas de los siete personajes: ${totalLineas}.`);
md.push('');
writeFileSync(join(RAIZ, 'VOICES.md'), md.join('\n'));
console.log(
  `Voces grabadas: ${totalGrabadas} · sprites finales: ${sprites.length} · líneas en VOICES.md: ${totalLineas}`,
);
