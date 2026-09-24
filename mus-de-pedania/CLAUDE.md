# CLAUDE.md — Mus de Pedanía

Remake-homenaje jugable de los simuladores de mus de bar de mediados de los 90 (referencia: _PC Mus_,
Círculo A.S.M., 1995-96). La especificación completa está en `PROMPT.md`; este archivo es el resumen
operativo. Las decisiones que no están en la spec, o que la interpretan, van en `DECISIONES.md`.

## Qué es

- Mus por parejas, 1 humano (asiento 0, sur) + 3 IA: compañero en el norte (2), rivales en el este (1)
  y el oeste (3). Sentido antihorario 0 → 1 → 2 → 3.
- Vista en primera persona en el **Bar El Envite** de **Villaenvite** (pedanía de 212 habitantes),
  durante el «I Campeonato Comarcal de Mus».
- Modos: Partida suelta y Torneo (cuartos, semifinal y final).
- Estética VGA: 320×200 lógicos, escalado entero, pixel art procedural, música FM tipo AdLib.

## Originalidad (sección 2 de la spec, no negociable)

- Nada de personas reales: ni nombres, ni caras, ni voces, ni coletillas.
- No se usa nada del juego original: ni gráficos, ni sonidos, ni música, ni textos, ni el título,
  ni los nombres del bar o del pueblo.
- Toda la música es nueva. La baraja se dibuja desde cero.
- Humor costumbrista y blanco.

## Stack

- TypeScript estricto + Vite. Sin frameworks. Canvas 2D a 320×200, `imageSmoothingEnabled = false`.
- Web Audio (FM de 2 operadores + secuenciador propio). Vitest. ESLint + Prettier.
- RNG con semilla (`mulberry32`) inyectado en el motor y en la IA.

## Estructura y regla de oro

```
src/core    bucle, escenas, input, fuente bitmap, tweens, rng, guardado
src/mus     reglas PURAS (sin DOM): cartas, evaluación, apuestas, estado de la mano, partida
src/ai      IA PURA: vista filtrada, Monte Carlo, decisiones, señas, personalidades
src/scenes  pantallas
src/render  dibujo de mesa, cartas, personajes, bocadillos, piedras, bar
src/audio   sintetizador, secuenciador, canciones, sfx, voces, balbuceo
src/data    personajes, líneas de texto, paleta, torneo, textos de UI
src/art     generador procedural de sprites (placeholders) y hojas de sprites
scripts     sim.ts (simulador), partida.ts (partida IA en consola), voices-manifest.ts
tests       Vitest
```

**`/mus` y `/ai` no importan nada de `/render`, `/audio`, `/scenes`, `/core` ni del DOM**
(lo vigila ESLint con `no-restricted-imports`). La escena `Table` orquesta:
estado → eventos → animaciones y voces → entrada.

## Comandos

```
npm run dev                             # servidor de desarrollo
npm test                                # Vitest
npm run build                           # tsc + vite build
npm run lint                            # ESLint
npm run sim -- --hands 10000 --seed 1   # simulador de manos IA contra IA
npm run partida -- --seed 7             # partida completa IA contra IA con registro legible
npm run voices:manifest                 # regenera assets/voices/manifest.json
```

## Hitos

| Hito | Contenido                                                                    |
| ---- | ---------------------------------------------------------------------------- |
| H0   | Vite + TS + Vitest + lint; este archivo                                      |
| H1   | Motor de reglas (sección 4) + simulador; los 17 tests obligatorios           |
| H2   | IA heurística + partida IA contra IA en consola                              |
| H3   | Mesa con placeholders jugable de principio a fin                             |
| H4   | IA completa: Monte Carlo, personalidades, dificultades, «Clásico 96»         |
| H5   | Señas: modos, caza, chivato                                                  |
| H6   | Flujo completo de pantallas, torneo, guardado                                |
| H7   | Audio: sintetizador, música original, SFX, voces, `VOICES.md`                |
| H8   | Pulido: Nicanor, cameos, huevos de pascua, ciclo de paleta, 4:3, rendimiento |

Al cerrar cada hito: tests en verde, `npm run build` correcto, lint limpio, commit descriptivo.

## Convenciones

- Identificadores y textos en español; nombres del dominio del mus tal cual (`envido`, `ordago`, `postre`…).
- Cartas como enteros 0..39 (`palo * 10 + índice`) para que el Monte Carlo vaya rápido.
- Todas las cadenas visibles van en `src/data/lines.es.ts` (voces) o `src/data/ui.es.ts` (interfaz).
- Si una regla es ambigua: reglamento estándar de mus a 8 reyes, se anota en `DECISIONES.md` y se sigue.
