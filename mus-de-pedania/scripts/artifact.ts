// Empaqueta el juego en una sola página HTML (el JS del build va en línea) para
// publicarlo y jugarlo en el navegador sin instalar nada.
//   npm run build && npx tsx scripts/artifact.ts [--salida ruta.html]

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { argumentos } from './args';

const RAIZ = join(import.meta.dirname, '..');
const args = argumentos(process.argv.slice(2));
const salida = String(args.salida ?? join(RAIZ, 'dist', 'mus-de-pedania.html'));

const js = readdirSync(join(RAIZ, 'dist', 'assets')).find((f) => f.endsWith('.js'));
if (!js) throw new Error('No hay build: ejecuta antes «npm run build».');
const codigo = readFileSync(join(RAIZ, 'dist', 'assets', js), 'utf8').replaceAll('</script', '<\\/script');

const pagina = `<title>Mus de Pedanía</title>
<style>
  :root {
    --fondo: #0d0a08;
    --marco: #3a2415;
    --canto: #a86c3a;
    color-scheme: dark;
  }
  html,
  body {
    height: 100%;
  }
  body {
    background: var(--fondo);
    overflow: hidden;
  }
  #marco {
    box-sizing: border-box;
    height: 100%;
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  #pantalla {
    display: block;
    max-width: 100%;
    image-rendering: pixelated;
    image-rendering: crisp-edges;
    box-shadow: 0 0 0 3px var(--marco), 0 0 0 4px var(--canto);
    outline: none;
    touch-action: manipulation;
  }
  #pantalla:focus-visible {
    box-shadow: 0 0 0 3px var(--marco), 0 0 0 5px #e2b227;
  }
</style>
<div id="marco">
  <canvas id="pantalla" tabindex="0" aria-label="Mus de Pedanía: toca o haz clic para jugar"></canvas>
</div>
<script type="module">
${codigo}
</script>
`;
writeFileSync(salida, pagina);
console.log(`Página del juego: ${salida} (${(pagina.length / 1024).toFixed(0)} KB)`);
