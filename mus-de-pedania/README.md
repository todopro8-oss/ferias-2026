# Mus de Pedanía

Remake-homenaje jugable de los simuladores de mus de bar de mediados de los 90. Se juega por
parejas: tú y tu compañero (IA) contra dos rivales (IA), en el **Bar El Envite** de **Villaenvite**,
pedanía de 212 habitantes, durante el **I Campeonato Comarcal de Mus**.

Todo es original: personajes inventados, arte en pixel generado por código, baraja española dibujada
desde cero, música FM compuesta para el juego, efectos y voces sintéticas. No hay personas reales ni
material del juego de referencia.

## Cómo jugar

```bash
npm install
npm run dev      # abre http://localhost:5173
```

- **Partida**: eliges compañero y rivales (o «que decida la suerte») y se juega a 40 (configurable).
- **Torneo comarcal**: te inscribes con tu nombre, eliges compañero y juegas cuartos, semifinal y
  final. El progreso se guarda. Si ganas, te llevas un jamón y una placa.
- **Cómo se juega**: reglas por páginas con manos de ejemplo y una **mano guiada** con pistas.

| Acción                   | Ratón         | Teclado         |
| ------------------------ | ------------- | --------------- |
| Mus / No hay mus         | Botones       | M / N           |
| Elegir descarte          | Clic en carta | 1-4             |
| Descartar                | Botón         | D               |
| Paso / Envido / Órdago   | Botones       | P / E / O       |
| Cantidad del envite      | − / +         | ← / →           |
| Quiero / No quiero / Más | Botones       | Q / X / +       |
| Señas al compañero       | Botón SEÑAS   | S, luego 1-5    |
| Continuar                | Clic          | Espacio / Intro |
| Lo que se ha dicho       | —             | L               |
| Ayuda                    | —             | H               |
| Pausa                    | —             | Esc             |
| Pantalla completa        | —             | F               |

## Qué hay dentro

- **Reglas completas del mus** (8 o 4 reyes, a 40 o 30, 1 o 3 juegos, mus corrido): grande, chica,
  pares, juego y punto; envites, subidas, dejes y órdagos; recuento con victoria comprobada tras cada
  suma. Motor puro y determinista con 17 tests obligatorios y muchos más (`src/mus`).
- **IA con personalidad**: Monte Carlo sobre repartos coherentes con declaraciones, señas y apuestas;
  siete personajes que se distinguen jugando (el Canijo echa órdagos, la Rufi farolea, Doña Pura sólo
  va con cartas…); Fácil («Clásico 96», se achanta ante los órdagos), Normal y Difícil (aprende tus
  faroles). `src/ai`
- **Señas** tradicionales (labio, lengua, boca torcida, cejas, guiño; y las «de la casa»), en modo
  clásico (cantosas) o discreto, con rivales que las cazan y «¡Te he visto!».
- **Pantalla VGA** de 320×200 con escalado entero y corrección 4:3, fuente bitmap propia, caricaturas
  procedurales con 26 fotogramas cada una, Nicanor trajinando, cameos, intro de 25 s y menú del día.
- **Audio**: sintetizador FM de 2 operadores al estilo OPL2, popurrí original (pasodoble, jota y
  rumba), sintonías, charanga, efectos procedurales, murmullo de bar y balbuceo con la voz de cada
  personaje (con filtro «Sound Blaster» opcional). Si grabas voces de verdad, se usan en su lugar: ver
  [`VOICES.md`](VOICES.md).

## Comandos

```bash
npm run dev                                 # desarrollo
npm test                                    # tests (Vitest)
npm run build                               # comprobación de tipos + build de producción en dist/
npm run lint                                # ESLint
npm run sim -- --hands 10000 --seed 1       # simulador de manos IA contra IA
npm run partida -- --seed 7 --motivos       # una partida IA contra IA, narrada en consola
npm run personalidades                      # tabla del estilo de juego de cada personaje
npm run voices:manifest                     # manifiestos de voces/sprites y VOICES.md
```

Pruebas en navegador (Playwright + Chromium):

```bash
npx tsx scripts/jugar-humano.ts --partidas 2   # partidas completas pulsando teclas como un humano
npx tsx scripts/torneo-e2e.ts                  # torneo entero, con recarga a mitad
npx tsx scripts/estres.ts --manos 200          # 200 manos IA contra IA a x10 midiendo fps
npx tsx scripts/audio-check.ts                 # renderiza el audio y mide pico y clics
npx tsx scripts/captura.ts --url "?menu"       # capturas de pantalla
```

Parámetros de URL útiles en desarrollo: `?menu` (salta intro), `?mesa&semilla=5` (directo a la mesa),
`?demo` (la IA juega también por ti), `?turbo=10`, `?senas=discreto`, `?chivato`, `?dificultad=dificil`,
`?galeria=cartas|minis|personajes|expresiones|fuente`.

## Arte final

Mientras no haya arte dibujado a mano, todo sale del generador procedural. Para sustituir un
personaje, deja `assets/sprites/<id>.png` y su `.json` (exportación de Aseprite, frames
`frontal:<fotograma>` y `tresCuartos:<fotograma>`) y ejecuta `npm run voices:manifest`. Los fotogramas
que falten se completan con el placeholder.

## Documentación del proyecto

- [`PROMPT.md`](PROMPT.md): la especificación original.
- [`CLAUDE.md`](CLAUDE.md): resumen operativo y estructura.
- [`DECISIONES.md`](DECISIONES.md): interpretaciones de reglas y decisiones de diseño.
- [`VOICES.md`](VOICES.md): guion completo de voces y guía de grabación.
