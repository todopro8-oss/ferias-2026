# PROMPT PARA CLAUDE CODE — «Mus de Pedanía»

Remake-homenaje jugable de los simuladores de mus de bar de mediados de los 90.
Referencia principal: *PC Mus* (Círculo A.S.M., MS-DOS, 1995-96).

> Uso: guarda este archivo como `PROMPT.md` en la raíz de un repo vacío y dile a Claude Code:
> «Lee PROMPT.md completo y ejecuta el Hito 0».

---

## 0. Tu rol y la misión

Eres el desarrollador principal (programación, reglas, IA, herramientas de arte procedural y audio) de **Mus de Pedanía**, un juego de mus por parejas (1 humano + 3 IA) para navegador/escritorio.

Objetivo: recrear con la máxima fidelidad posible la **experiencia, la estructura, las reglas, el flujo de pantallas y el tipo de humor** de *PC Mus*, pero con **personajes, lugares, arte, textos, voces y música 100 % originales** (ver sección 2, obligatoria).

Prioridades, en este orden:
1. Reglas del mus correctas al 100 %: motor puro, determinista y testeado.
2. Sensación de «partida en el bar del pueblo en 1996»: vista en primera persona, caras grandes, señas, voces con retranca, camarero trajinando al fondo.
3. IA con personalidades que se distingan jugando.
4. Estética técnica de la época coherente (VGA 256 colores, pixel art, FM tipo AdLib).
5. Pulido: intro, torneo, cameos, recuento animado, huevos de pascua.

---

## 1. Qué se sabe del juego de referencia (y qué no)

Hechos documentados en reseñas retro y fichas (MobyGames, Computer Emuzone, blogs de retro):

- Juego español para MS-DOS (1995-96) de Círculo A.S.M.; distribuido por LIT en disquete y CD; reeditado en 1998 por Dinamic Multimedia en una colección de quiosco con instalador para Windows 95.
- Ambientación única: el bar de una pedanía (pueblo pequeño) donde se juega un campeonato. La intro muestra la llegada al pueblo y a un vecino que entra corriendo al bar a mirar.
- **Vista en primera persona**: se ve el bar y las caras de los otros tres jugadores (IA), sentados a la mesa.
- **7 personajes seleccionables**, caricaturas de famosos de la época con nombres supuestos. Cada uno tiene frase de presentación y **voces digitalizadas propias según la acción** (pedir cartas, descartar, lanzar órdago…).
- Antes de jugar **eliges compañero** (siempre controlado por la CPU); la pareja rival la asigna el juego.
- **Modos**: «Partida» (una sola, sin continuación) y «Torneo» (tres rondas eliminatorias).
- Reglas completas del mus: mus y descartes, envites, faroles, órdagos y **señas** (se pueden hacer al compañero y cazar las de los rivales).
- Se juega a **40**. Dificultad seleccionable.
- Críticas conocidas: las **señas eran tan evidentes** que siempre las veía todo el mundo; y la **IA se achantaba ante casi cualquier órdago**.
- Un **camarero** cocina y limpia al fondo; aparecen **cameos** de otros personajes que sueltan sus coletillas; hay **huevos de pascua al final** de la partida.
- Sonido: pocos efectos; **música sólo en intro y menú** (un popurrí de aire español muy recordado); las voces acaban repitiéndose demasiado.

NO documentado (aquí mandan las decisiones de esta especificación): resolución exacta, disposición exacta de la pantalla, número de niveles de dificultad, si usaba 4 u 8 reyes, número de juegos por partida y la lógica interna de la IA. Donde esta spec da un valor, úsalo: es una reconstrucción plausible, no una copia.

---

## 2. Límites de originalidad (OBLIGATORIO, no negociable)

- **Prohibido** usar nombres, caras, voces, coletillas o caricaturas de **personas reales** (ni las del original ni ninguna otra).
- **Prohibido** extraer, descargar, calcar o imitar gráficos, sonidos, música, textos, el título del original o los nombres de su bar y su pueblo.
- Toda melodía es **composición nueva**: no transcribas pasodobles, jotas ni canciones existentes.
- La baraja española se dibuja **desde cero** con la iconografía tradicional genérica; no copies ninguna baraja comercial concreta.
- **Sí replicas**: reglas, flujo de pantallas, modos, mesa en primera persona, sistema de señas (incluido su «defecto» como modo clásico), eventos de voz por acción, humor costumbrista, camarero y cameos (con personajes inventados), estética técnica de la época.
- Humor: costumbrista y blanco. Sin chistes sobre grupos protegidos ni referencias a políticos o famosos reales.

---

## 3. Stack y arquitectura

- **TypeScript estricto + Vite**. Sin frameworks de UI ni motores (nada de Phaser/Pixi/React) salvo justificación escrita en `DECISIONES.md`.
- **Canvas 2D** a resolución lógica **320×200**, escalado entero (x2…x6) con `imageSmoothingEnabled = false`, bandas negras. Opción «Corrección 4:3» que estira verticalmente a 320×240 como en un monitor CRT (píxel no cuadrado).
- Bucle lógico a 60 Hz; animaciones de sprites a 10-12 fps para el look de época.
- **Web Audio API**: sintetizador FM de 2 operadores estilo OPL2 + secuenciador propio para música; muestras para SFX y voces.
- **Vitest** para tests. ESLint + Prettier.
- RNG con semilla (mulberry32 o similar) inyectable en todo el motor → partidas reproducibles y tests deterministas.
- Opcional al final: empaquetado de escritorio con Tauri (no bloquea nada).

Estructura de carpetas:

```
/src
  /core     loop.ts, sceneManager.ts, input.ts, assets.ts, bitmapFont.ts, tween.ts, rng.ts, save.ts
  /mus      cards.ts, config.ts, evaluate.ts, betting.ts, handState.ts, scoring.ts, match.ts   ← PURO, sin DOM
  /ai       view.ts, montecarlo.ts, handValue.ts, musDecision.ts, discard.ts, bet.ts, senas.ts, personalities.ts
  /scenes   Boot, Intro, MainMenu, Options, HowToPlay, CharacterSelect, TournamentBoard,
            Table, HandSummary, MatchEnd, Champion, Pause
  /render   tableLayout.ts, cardRenderer.ts, characterRenderer.ts, bubbles.ts, stones.ts, barScene.ts
  /audio    synth.ts, sequencer.ts, songs/, sfx.ts, voices.ts, babble.ts
  /data     characters.ts, lines.es.ts, palette.ts, tournament.ts
  /art      placeholderGen.ts, spriteSheet.ts
/assets     sprites/, voices/   (vacías al principio: todo tiene placeholder)
/scripts    sim.ts, voices-manifest.ts
/tests
CLAUDE.md  DECISIONES.md  VOICES.md
```

Regla de oro: `/mus` y `/ai` no importan nada de `/render`, `/audio` ni del DOM. La escena `Table` orquesta: estado → eventos → animaciones/voces → input.

---

## 4. Reglas del mus: especificación exacta

### 4.1 Configuración (`MusConfig`)

| Clave | Valores | Por defecto |
|---|---|---|
| `reyes` | 8 \| 4 | 8 |
| `puntosJuego` | 40 \| 30 | 40 |
| `juegosPartida` | 1 \| 3 (gana quien gane 2) | 1 |
| `musCorrido` | boolean | false |
| `senas` | `'clasico'` \| `'discreto'` \| `'off'` | `'clasico'` |
| `senasDeLaCasa` | boolean | false |
| `velocidadIA` | `'lenta'` \| `'normal'` \| `'rapida'` | `'normal'` |

### 4.2 Baraja y valores

- 40 cartas: palos oros, copas, espadas, bastos; números 1-7, sota (10), caballo (11), rey (12).
- Rango efectivo `r(c)`:
  - 8 reyes: el 3 cuenta como rey (12) y el 2 como as (1). Orden: R > C > S > 7 > 6 > 5 > 4 > A.
  - 4 reyes: sin cambios. Orden: R > C > S > 7 > 6 > 5 > 4 > 3 > 2 > A.
- Valor para juego `v(c)`: si `r ≥ 10` → 10; si `r = 1` → 1; resto → su número. (Con 8 reyes el 3 vale 10 y el 2 vale 1.)

### 4.3 Asientos, turno, mano y postre

- Asientos: 0 = humano (sur), 1 = rival derecha (este), 2 = compañero (norte), 3 = rival izquierda (oeste).
- Equipos: A = {0, 2} «Nosotros»; B = {1, 3} «Ellos».
- Sentido de juego antihorario: 0 → 1 → 2 → 3 → 0.
- Reparte el **postre**; la **mano** es el siguiente al postre en sentido de juego. Tras cada mano, la antigua mano pasa a ser postre.
- Primera mano de la partida: postre aleatorio (animación opcional de «cortar a ver quién da»).
- Siempre se habla empezando por la mano. Se reparte carta a carta, 4 vueltas, empezando por la mano.

### 4.4 Fase de mus

1. Desde la mano, cada jugador dice «Mus» o «No hay mus». El primer «No hay mus» corta y se pasa a los lances (los siguientes ya no hablan).
2. Si los cuatro piden mus: cada jugador, desde la mano, descarta de 1 a 4 cartas (mínimo 1). El postre repone en orden desde la mano.
3. Si el mazo no alcanza: se barajan todos los descartes acumulados (nunca las cartas en mano) y forman el nuevo mazo.
4. Vuelta al paso 1, sin límite de rondas.
5. `musCorrido` (opcional): en la primera mano de cada juego, cada vez que los cuatro piden mus, la mano avanza un puesto.

### 4.5 Lances y comparación

Orden: **Grande → Chica → Pares → Juego** (o **Punto** si nadie tiene juego).

- **Grande**: ordena los rangos efectivos de mayor a menor y compara lexicográficamente; gana el mayor.
- **Chica**: ordena de menor a mayor y compara; gana el menor.
- **Pares**: Duples (cuatro iguales o dos parejas) > Medias (tres iguales) > Pareja (dos iguales). Duples se comparan por la pareja alta y luego la baja; cuatro iguales = duples de esa carta con pareja alta y baja iguales. Medias y pareja, por rango.
- **Juego**: suma de `v ≥ 31`. Orden: **31 > 32 > 40 > 37 > 36 > 35 > 34 > 33**.
- **Punto**: sólo si nadie tiene juego; gana la suma más alta (máximo 30).
- **Empate exacto**: gana el jugador más cercano a la mano en orden de habla.
- Cada lance lo gana la pareja del mejor jugador individual. En Pares y Juego sólo compiten quienes tienen jugada.

### 4.6 Declaraciones antes de Pares y de Juego

Desde la mano, cada jugador declara «Pares sí/no» y, más tarde, «Juego sí/no». Es información pública.

- Si los dos equipos tienen al menos un jugador con jugada → hay apuestas; **sólo hablan los jugadores con jugada** (los demás se saltan).
- Si sólo un equipo tiene jugada → no hay apuestas; ese equipo cobra el valor de sus jugadas en el recuento.
- Si nadie tiene → en Pares no hay lance; en Juego se juega **Punto** y hablan los cuatro.

### 4.7 Apuestas dentro de un lance (`betting.ts`)

Estado del lance: `apuestaVigente` (total propuesto), `apuestaAnterior` (total ya aceptado implícitamente), `apostadoPor` (equipo), `turno`.

- **Sin apuesta**: el que habla elige Paso, Envido (2 por defecto; permitir 2..40) u Órdago. Si todos los que pueden hablar pasan → lance **en paso**.
- **Con apuesta del equipo X**: responde el primer jugador del equipo contrario que venga después en orden de habla. Opciones: Quiero, No quiero, Envido más (subir N ≥ 2 sobre el total: «cinco más»), Órdago.
  - Quiero → lance cerrado con `apuestaVigente` aceptada.
  - No quiero → contesta su compañero, si puede hablar en ese lance. Si ambos no quieren → apuesta rechazada.
  - Subida → `apuestaAnterior = apuestaVigente`; `apuestaVigente += N`; ahora responde el equipo X (primero el siguiente en orden; si no quiere, su compañero).
- **Rechazo**: el equipo que hizo la última apuesta cobra **en el acto**: 1 piedra si era la apertura (deje), o `apuestaAnterior` si era una subida. Si con eso alcanza `puntosJuego`, el juego termina inmediatamente.
- **Órdago**: es una subida «a todo». Rechazado → igual que un rechazo (1 o `apuestaAnterior`). Aceptado → se destapan las cartas en el acto, se resuelve **sólo ese lance** y la pareja ganadora gana el juego completo, ignorando marcador y demás apuestas.
- Nadie habla fuera de turno. El compañero IA nunca decide por el humano.

### 4.8 Recuento al final de la mano

Se destapan las cuatro manos. En orden Grande, Chica, Pares, Juego/Punto se suman puntos **comprobando la victoria tras cada suma** (quien llega primero en este orden gana, aunque el otro fuera a llegar después):

- **Grande / Chica**: aceptada → el ganador suma la apuesta; en paso → el ganador suma 1; rechazada → nada (el deje ya se cobró).
- **Pares**: el equipo ganador del lance (mejor jugada, o el que ganó por «no quiero», o el único con pares) suma la apuesta aceptada si la hubo, más por cada miembro con pares: pareja 1, medias 2, duples 3.
- **Juego**: igual; por cada miembro con juego: 31 → 3, cualquier otro → 2.
- **Punto**: el ganador suma la apuesta aceptada si la hubo, más 1.
- En paso en Pares o Juego → sólo el valor de las jugadas, sin piedra extra.

### 4.9 Marcador, juegos y partida

- Se cuenta en piedras y se muestra también en amarracos (1 amarraco = 5 piedras): 27 = 5 amarracos + 2 piedras.
- Cuando un equipo termina una mano con 35 o más, uno de sus jugadores canta «¡Adentro!» (sólo ambientación).
- Juego a `puntosJuego`; partida a `juegosPartida`.

### 4.10 Tests obligatorios (escríbelos ANTES de cualquier UI)

1. 8 reyes, [3♣, R♠, A♥, 2♦] → grande: dos reyes; chica: dos ases; pares: duples reyes-ases; suma 22 → sin juego, punto 22.
2. La misma mano con 4 reyes → sin pares; suma 16.
3. [7, 7, 7, S] → medias de sietes y juego de 31.
4. [R, C, S, A] → juego de 31.
5. Orden de juego 31 > 32 > 40 > 37 > 36 > 35 > 34 > 33.
6. Empate exacto a grande → gana el más cercano a la mano.
7. Envido de 2, los dos rivales no quieren → +1 inmediato al que envidó.
8. Envido 2 → «cinco más» (total 7) → no quiero → +2 a los que subieron.
9. 2 → +5 (7) → +10 (17) → no quiero → +7.
10. Órdago a la grande aceptado → decide sólo la grande; el ganador se lleva el juego aunque fuera 0-39.
11. Sólo el equipo A tiene pares → no hay apuestas; A cobra sus pares en el recuento.
12. A con 38, B con 39: B gana la grande en paso → B llega a 40 y gana aunque A tuviera 6 de pares.
13. Nadie tiene juego → Punto; en paso: +1; querido a 2: +3.
14. En Pares, envite rechazado → +1 inmediato y el equipo que envidó cobra además sus pares en el recuento.
15. Mazo agotado durante descartes → se rebarajan descartes sin duplicar cartas. Invariante: siempre 40 cartas únicas entre mazo, manos y descartes.
16. Duples [R, R, A, A] vence a duples de cuatro caballos (pareja alta rey > caballo); [R, R, R, R] vence a [R, R, A, A].
17. Propiedad: 10.000 manos aleatorias IA contra IA sin excepciones y con marcador coherente.

---

## 5. Máquina de estados de la mano

```
REPARTO → MUS ─┬─ (los 4 piden mus) → DESCARTE → REPOSICION → MUS …
               └─ (no hay mus) → GRANDE → CHICA → DECL_PARES → PARES? → DECL_JUEGO → JUEGO | PUNTO
                                                  → DESTAPE → RECUENTO → FIN_MANO
En cualquier lance: ORDAGO_ACEPTADO → DESTAPE_ORDAGO → FIN_JUEGO
En cualquier rechazo que alcance puntosJuego: FIN_JUEGO
```

- Cada transición emite eventos (`{tipo:'habla', jugador, voz:'envido', cantidad}`, `{tipo:'carta_repartida', a, carta}`, `{tipo:'deje', equipo, piedras}`…).
- El motor espera un `ack` de la escena antes de avanzar (cola de eventos): el ritmo lo marcan las animaciones y la `velocidadIA`.

---

## 6. Inteligencia artificial

### 6.1 Información disponible

Cada IA recibe una **vista filtrada** del estado (test obligatorio: la IA no puede acceder a cartas ajenas): sus cartas, declaraciones públicas, número de cartas descartadas por cada jugador en cada ronda, apuestas, señas que haya visto y marcador.

### 6.2 Estimación por Monte Carlo

`estimar(vista, n)` genera `n` repartos de las cartas desconocidas coherentes con la información (declaraciones de pares y juego, señas vistas) mediante muestreo por rechazo (máximo 50 intentos por muestra; después relaja la restricción más débil). Devuelve P(ganar) de su pareja en cada lance y las piedras esperadas.

`n` por dificultad: Fácil 0 (sólo heurística), Normal 200, Difícil 800. Presupuesto: menos de 30 ms por decisión en un portátil normal; si no llega, muévelo a un Web Worker.

### 6.3 Decisión de mus

- Puntúa la mano con `handValue` (pesos para grande, chica, pares y juego).
- Corta («No hay mus») si supera `umbralCorteMus` de su personalidad, ajustado por posición (la mano corta con menos), marcador (si el rival está cerca de ganar, corta antes) y señas del compañero.
- Con perfil normal, corta siempre con: 31 más alguna otra baza, duples, o medias de reyes.

### 6.4 Descarte

Evalúa los 15 subconjuntos posibles de cartas a conservar (descartando al menos una). Para cada uno, 40 simulaciones de reposición → `handValue` medio. Elige el mejor. La personalidad añade sesgo (el órdaguero guarda reyes, la prudente busca la 31).

### 6.5 Apuestas

Con `p` = P(ganar el lance) y `E` = piedras esperadas:

- **Abrir**: si `p > umbralEnvido` → envido de 2 (si `p > 0.8`, de 3 a 5 según agresividad). Si `p < 0.25` y `rand < farol` → envido de farol.
- **Responder**: Quiero si `p > umbralQuiero`; subir si `p > umbralSubir`; si no, No quiero. Cuanto más alta la apuesta, más `p` exige.
- **Lanzar órdago**: si `p > 0.85` y `rand < tendenciaOrdago`; o si el rival está a 5 o menos de ganar y `p > 0.6`; o farol desesperado.
- **Aceptar órdago**: umbral base 0.55; si el rival va a ganar casi seguro (35 o más), baja a 0.40; si vamos muy por delante, sube a 0.70.
- **Modo «Clásico 96»** (sólo en Fácil): los rivales rechazan SIEMPRE los órdagos salvo con jugada máxima, como homenaje al fallo de la IA original.
- **Compañero IA**: juega para la pareja; si el humano envida, no le pisa la apuesta salvo `p` muy alta.

### 6.6 Dificultad

| | Fácil («Clásico 96») | Normal | Difícil |
|---|---|---|---|
| Monte Carlo | No | 200 | 800 |
| Faroles de los rivales | Pocos | Los de su personalidad | Calibrados y adaptados al humano (si el humano farolea mucho, le piden más) |
| Cazar señas | 50 % de su `vista` | 100 % | 120 % (tope 0.95) |
| Órdagos | Se achantan | Normal | Normal |
| Tiene en cuenta el marcador | No | Sí | Sí |

---

## 7. Señas

### 7.1 Catálogo (señas tradicionales)

| Seña | Significado | Animación de cara |
|---|---|---|
| Morderse el labio inferior | Dos reyes (a grande) | `sena_labio` |
| Sacar la punta de la lengua | Dos ases (a chica) | `sena_lengua` |
| Torcer los labios apretados | Medias | `sena_torcer` |
| Subir las cejas | Duples | `sena_cejas` |
| Guiñar un ojo | 31 (o 30 a punto) | `sena_guino` |

Con 8 reyes, «dos reyes» incluye treses y «dos ases» incluye doses.
Señas de la casa (opción `senasDeLaCasa`, desactivada por defecto): «ciego» (nada) → cerrar los dos ojos; «tres reyes» → morderse el labio dos veces.

### 7.2 Mecánica

- **Ventanas de señas**: durante las rondas de mus (para coordinar cortar o seguir) y desde que se corta el mus hasta que empieza el lance de Pares.
- El humano abre el menú con el botón SEÑAS o la tecla S y elige una. Puede hacer **señas falsas** para engañar; el compañero IA confía en ellas.
- Cada seña reproduce su animación en la cara de quien la hace durante `dur`: **modo clásico 1200 ms** (cantosa, la ve toda la mesa, fiel al original); **modo discreto 350 ms**.
- Un rival IA la caza con probabilidad `vista(rival) × factorDificultad × (clasico ? 1 : 0.45)`. Si la caza: dice una línea tipo «¡Eso ha sido seña!» y usa la información en su Monte Carlo.
- El compañero IA hace señas con probabilidad `franqueza` cuando tiene la jugada, girando la cara un fotograma hacia el sur.
- Los rivales IA también se hacen señas entre ellos; el humano puede verlas en sus caras.
- Opción de accesibilidad «Chivato»: anota en el historial las señas que un jugador atento habría visto.
- Extra original de este remake (opcional, desactivado en modo clásico): hacer clic en la cara de un rival mientras hace una seña → «¡Te he visto!», queda registrada y el rival se pica.

---

## 8. Personajes (todos originales)

Pueblo: **Villaenvite**, pedanía de 212 habitantes. Bar: **Bar El Envite**. Se celebra el «I Campeonato Comarcal de Mus».

Estadísticas (0-1): `agr` agresividad, `far` farol, `ord` tendencia al órdago, `vis` vista para cazar señas, `dis` disimulo (lo que cuesta cazarle en modo discreto), `fra` franqueza (probabilidad de hacer señas a su pareja), `cor` umbral de corte de mus.

| Id | Personaje | Aspecto (para el pixel art) | Estilo de juego | Voz | agr | far | ord | vis | dis | fra | cor |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `anselmo` | Don Anselmo, boticario jubilado | Calvo con cerco blanco, gafas redondas de pasta, chaleco de punto granate, bolígrafo en el bolsillo | Prudente, cuenta cartas, casi nunca farolea, lee señas | Grave y lenta | .30 | .08 | .05 | .85 | .80 | .60 | .70 |
| `rufi` | La Rufi, peluquera | Permanente enorme color caoba, aros dorados, bata rosa, chicle | Habladora, farolera, se pica | Aguda y rápida | .70 | .40 | .15 | .55 | .30 | .80 | .50 |
| `canijo` | El Canijo, camionero de dos metros | Bigote poblado, gorra de cooperativa, camiseta de tirantes, ancla tatuada | Órdaguero | Ronca y fuerte | .85 | .30 | .40 | .25 | .15 | .90 | .45 |
| `pura` | Doña Pura, la del estanco | Moño gris, rebeca negra, gafas con cadenita, broche | Rácana, sólo va con cartas | Seca y nasal | .35 | .05 | .05 | .75 | .70 | .40 | .75 |
| `tomasin` | Tomasín, estudiante de Estadística | Flequillo cortinilla, gafas de alambre, sudadera universitaria, walkman al cuello | Calculador pero sobrado | Nasal, pedante | .50 | .20 | .10 | .60 | .50 | .50 | .60 |
| `marisa` | Marisa Lentejuela, cantante de orquesta de verbena | Tupé platino con laca, vestido de lentejuelas turquesa, uñas rojas | Teatral, señas exageradas, farolea con estilo | Impostada, cantarina | .60 | .35 | .20 | .40 | .10 | .85 | .50 |
| `julian` | Julián, alguacil del pueblo | Gorra de plato con escudo municipal inventado, bigotito, uniforme azul marino, corneta de pregonero | Reglamentista, protesta cualquier cosa, muy estable | De pregonero, alarga vocales | .45 | .15 | .10 | .70 | .60 | .60 | .60 |

No jugables:

- **Nicanor**, dueño y camarero del Bar El Envite: delantal, trapo al hombro, palillo en la boca. Bucles de fondo: secar vasos, tirar una caña, sacar tortilla, fregar, subir el volumen de la tele. Comenta de vez en cuando.
- **Cameos** (uno cada 3-6 manos, entran por la puerta del fondo, dicen una línea y se van): el cartero con la saca, la vecina que busca a su marido, un turista con mapa que pregunta por la ermita, un chaval a por un polo, el perro del bar que cruza.
- **Huevos de pascua**: al ganar una partida, el bar aplaude y Nicanor invita a una ronda; al ganar el torneo entra la charanga del pueblo (música original) y te dan «un jamón y una placa».

### 8.1 Líneas de voz

Eventos: `presentacion, mus, noHayMus, descarte(n), paso, envido, envidoMas, quiero, noQuiero, ordago, quieroOrdago, paresSi, paresNo, juegoSi, juegoNo, ganaLance, pierdeLance, senaCazada, lePillanSena, adentro, victoria, derrota, idle`.

Escribe **al menos 4 variantes por evento y personaje** en `lines.es.ts`, en la misma voz que estos ejemplos (el original se hacía repetitivo; aquí no):

| | Presentación | Mus | No hay mus | Envido | Órdago | No quiero | Victoria |
|---|---|---|---|---|---|---|---|
| Anselmo | «Anselmo, boticario. Aquí se juega con receta.» | «Mus, si no es molestia.» | «Me quedo como estoy. Posología correcta.» | «Dos piedras. Dosis mínima.» | «Órdago. Y sin prospecto.» | «No quiero. Contraindicado.» | «Una cucharada cada ocho horas, lo que yo decía.» |
| Rufi | «Soy la Rufi, y a mí no me peina nadie dos veces.» | «¡Mus, que estas cartas tienen las puntas abiertas!» | «¡Quieto todo el mundo, que me quedo!» | «Envido, y no me mires así.» | «¡Órdago, y luego me lo contáis en la pelu!» | «Ni loca, bonito.» | «Lavar, marcar y ganar.» |
| Canijo | «Me llaman el Canijo. Pregúntame por qué.» | «Mus. Y rapidito, que tengo ruta.» | «Aquí no se cambia nada.» | «Envido. Tres. Cuatro. Lo que sea.» | «¡ÓRDAGO! Y a la cama.» | «…Hoy no.» | «Descargado y entregado.» |
| Pura | «Pura, del estanco. Aquí no se fía.» | «Mus. Pero cartas nuevas, ¿eh?» | «No hay mus. Cerrado por inventario.» | «Dos. Ni una más.» | «Órdago. Primera vez en veinte años.» | «No quiero. Aquí se paga al contado.» | «Firme aquí, que le hago el recibo.» |
| Tomasín | «Tomasín. Estudio Estadística, así que ya habéis perdido.» | «Mus. Probabilidad de mejora favorable.» | «No hay mus. Varianza controlada.» | «Envido. Lo dicen los números.» | «Órdago. Confianza del noventa y cinco por ciento.» | «No quiero. No es significativo.» | «Como predijo el modelo.» |
| Marisa | «Marisa Lentejuela, de gira por todas las fiestas… ¡y por vuestras piedras!» | «¡Mus, cariño, que esta canción no me gusta!» | «¡Me quedo con este repertorio!» | «Envido… ¡y que suene la orquesta!» | «¡Órdago! ¡Y el que no quiera, que baile!» | «Paso de este bolero.» | «¡Gracias, sois un público maravilloso!» |
| Julián | «Julián, alguacil. Se hace saber que esta partida es mía.» | «Mus, conforme al reglamento.» | «No hay mus. Queda cerrada la ventanilla.» | «Se envidan dos piedras. Que conste.» | «¡Órdago, por orden de la autoridad!» | «No quiero. Recurriré.» | «Se levanta acta: hemos ganado.» |

Nicanor: «¡Marchando dos cafés!», «Aquí se juega, pero se consume.», «¡Adentro, que se enfría la tortilla!».
Cameos: cartero «¿Don Anselmo? Traigo un certificado… bueno, luego vuelvo.»; vecina «¿Alguien ha visto a mi Paco? …Ya veo que aquí no.»; turista «Perdonen, ¿la ermita románica?» (alguien grita «¡Envido!») «…Vale, gracias.»

Probabilidad de hablar por evento según la opción «Parloteo»: poco 30 %, normal 60 %, clásico 100 % (fiel al original). Nunca repetir ninguna de las 2 últimas líneas de ese personaje.

---

## 9. Pantallas y flujo

1. **Arranque retro** (desactivable): pantalla negra con texto de consola inventado: `C:\MUS> MUSPED.EXE`, «Comprobando memoria… 640K», «Sintetizador FM detectado». 2-3 s, salta con cualquier tecla.
2. **Intro** (unos 25 s, se salta con clic, Espacio o Esc):
   - Plano general del campo al atardecer, carretera, campanario. Rótulo: «Villaenvite, pedanía de 212 habitantes».
   - Una furgoneta destartalada con pancarta «I Campeonato Comarcal de Mus» entra en la plaza (scroll con parallax).
   - Julián pega el bando en el tablón; las vecinas se asoman a las ventanas; el perro ladra; las campanas dan las siete.
   - Interior del bar: Nicanor limpia la mesa del fondo, coloca la baraja y el cuenco de piedras; la cámara se sienta en tu silla y aparece el logo «MUS DE PEDANÍA» con ciclo de paleta.
   - Suena el popurrí original (sección 12).
3. **Menú principal** como pizarra de «Menú del día», escrita a tiza: Primero: Partida · Segundo: Torneo comarcal · Postre: Opciones / Cómo se juega · Café: Salir. Hover: la línea se subraya a tiza. Música del menú en bucle.
4. **Opciones** (libreta de apuntes del bar): ver sección 14.
5. **Cómo se juega**: reglas por páginas con ejemplos de manos dibujadas + «Mano guiada» (tutorial interactivo con cartas fijadas por semilla).
6. **Selección de personajes**: pared del bar con 7 fotos enmarcadas. Hover: la foto se ilumina, aparece una ficha tipo carné con barras de tiza (Agresivo, Farolero, Órdagos, Vista, Disimulo) y el personaje dice su presentación.
   - Paso 1: «Elige compañero».
   - Paso 2 (Partida): «Elige rivales» o «Que decida la suerte». En Torneo, los rivales salen por sorteo.
7. **Cuadro del torneo**: cartel de fiestas clavado en un corcho, 8 parejas → Cuartos, Semifinal, Final. Tu pareja más otras siete: las parejas a las que te enfrentas se forman con los 5 personajes restantes (pareja nueva cada ronda; en la Final, los dos de más nivel). El resto del cuadro son parejas de relleno con nombres locales («Los del Casino», «Hermanos Peña», «Club de Jubilados», «Los de la Cooperativa», «Los Forasteros»…) y resultados simulados. Pierdes una ronda → eliminado, opción de repetir torneo. El progreso se guarda.
8. **Mesa** (sección 10).
9. **Recuento de la mano** (overlay sobre la mesa): las cartas de los tres jugadores IA se voltean en su sitio (24×36); una pizarrita central lista lance a lance: «Grande: Ellos +2 (querido)», «Chica: Nosotros +1 (en paso)», «Pares: Nosotros +1 (deje) +3 (duples)», «Juego: Ellos +2 (32)». Las piedras vuelan una a una del cuenco al montón del equipo con su «clac». Clic para seguir.
10. **Fin de juego y de partida**: viñeta de victoria o derrota con reacciones de los cuatro, aplauso o silencio del bar, estadísticas (manos, órdagos lanzados y aceptados, señas hechas y cazadas).
11. **Campeón**: charanga, confeti de pixel, «un jamón y una placa» con tu nombre.
12. **Pausa** (Esc): Continuar, Opciones, Historial de la mano, Abandonar.

---

## 10. Pantalla de mesa (320×200)

Propuesta de disposición: la del original no está documentada con precisión; ajusta coordenadas en `tableLayout.ts` si hace falta, pero conserva la idea (primera persona, caras grandes arriba, tus cartas grandes abajo).

```
┌──────────────────────────────────────────────────────────────┐
│[Pizarra marcador]  [puerta]  [ COMPAÑERO ]  [barra+Nicanor][TV]│
│                               (busto norte)                  │
│ [RIVAL IZQ]                                      [RIVAL DCHA]│
│ (busto oeste)      ▓▓▓▓ mesa de madera ▓▓▓▓      (busto este)│
│              cartas ▯▯▯▯  [mazo][cuenco][descartes] ▯▯▯▯      │
│[Lances+Señas]    [carta][carta][carta][carta]    [Acciones]  │
└──────────────────────────────────────────────────────────────┘
```

| Zona | Posición (x, y, ancho, alto) | Contenido |
|---|---|---|
| Pizarra marcador | 4, 4, 76, 40 | «Nosotros» y «Ellos»: amarracos dibujados como palotes de tiza + piedras sueltas + cifra; puntos de juegos ganados |
| Puerta del fondo | 86, 14, 26, 56 | Entrada de cameos |
| Compañero (norte) | 128, 18, 64, 72 | Busto frontal; cara de unos 32×36 para las señas |
| Barra y Nicanor | 196, 24, 48, 46 | Bucles del camarero |
| Tele | 268, 4, 44, 30 | Ruido, carta de ajuste y partido borroso en bucle |
| Rival izquierda (oeste) | 6, 52, 60, 76 | Busto 3/4 mirando a la derecha |
| Rival derecha (este) | 254, 52, 60, 76 | Busto 3/4 mirando a la izquierda |
| Mesa | y de 96 a 200 | Madera en perspectiva (trapecio) |
| Dorsos de cartas | 12×14 delante de cada jugador IA | 4 dorsos; animan descartes y reposición |
| Mazo, cuenco de piedras, descartes | 146,104 · 158,118 · 172,104 | Centro de la mesa |
| Montones de piedras por equipo | Nosotros 60,128 · Ellos 250,128 | Físicos, para las animaciones del recuento |
| Tus cartas | y 138; x 81, 121, 161, 201; 38×58 | Clic para seleccionar el descarte (sube 8 px) |
| Panel de lances | 4, 132, 72, 64 | Grande / Chica / Pares / Juego (o Punto): estado («en paso», «envite 5», «querido 2», «deje +1», «órdago») y marca del lance actual; debajo, botón SEÑAS |
| Panel de acciones | 246, 132, 70, 64 | Hasta 5 botones de 70×11 con 2 px de separación; sólo los válidos en ese momento |
| Selector de envite | Encima del panel de acciones | «− 2 +» (2 a 10) y ÓRDAGO |
| Fichas de mano y postre | Junto al jugador correspondiente | Ficha «M» y ficha «P» |
| Bocadillos | Encima o al lado de cada hablante | Máximo 2 líneas de 22 caracteres, 2,5 s (escalado por `velocidadIA`); el del humano junto a sus cartas |
| Historial (tecla L) | Overlay de hoja de libreta | Todo lo dicho y hecho en la mano |

Botones según fase: MUS / NO HAY MUS → DESCARTAR (activo con 1-4 cartas elegidas) → PASO / ENVIDO / ÓRDAGO → QUIERO / NO QUIERO / MÁS / ÓRDAGO → PARES SÍ/NO y JUEGO SÍ/NO (automáticos, sólo se anuncian, porque la respuesta la dicta la mano) → CONTINUAR.

---

## 11. Dirección de arte

### 11.1 Paleta base (el juego completo no supera 256 colores; los sprites usan rampas derivadas de estos)

| Nombre | Hex | Uso |
|---|---|---|
| negro | #000000 | Contornos, bandas |
| tinta | #1A1410 | Sombras profundas |
| madera_osc | #3A2415 | Mesa, barra |
| madera | #6E4424 | Mesa |
| madera_clara | #A86C3A | Brillos de madera |
| barniz | #D9A05B | Reflejos de barniz |
| pared | #D8C48E | Pared del bar |
| pared_sombra | #9E8454 | Pared en sombra |
| azulejo_osc | #1F5C4A | Zócalo de azulejo |
| azulejo | #3E8C6E | Zócalo de azulejo |
| azulejo_brillo | #8FD0A8 | Brillo del azulejo |
| pizarra | #1F2E27 | Pizarras, menú |
| tiza | #EAEAE0 | Texto de pizarra |
| tiza_sombra | #9FA69B | Tiza borrada, deshabilitado |
| papel | #F1E6C8 | Cartas, libreta, bocadillos |
| piel_1 | #F0C49C | Pieles |
| piel_2 | #C98A5E | Pieles |
| piel_3 | #8C5634 | Pieles |
| oros | #E2B227 | Palo |
| copas | #B3262E | Palo, reverso granate |
| espadas | #2F58A8 | Palo |
| bastos | #3E7C2C | Palo |
| neon | #4FE0FF | Rótulo del bar (ciclo de paleta) |
| fluorescente | #F4FFE0 | Luz de tubo |
| atardecer | #F08A4B | Intro |
| violeta | #5B3A78 | Cielo de la intro |

Efectos de época: **ciclo de paleta** para el neón, la tele y el logo; parpadeo ocasional del tubo fluorescente; sin degradados suaves ni desenfoques.

### 11.2 Tipografía

Fuente bitmap propia definida en código (o una pixel font con licencia OFL): 8×8 para títulos, 5×7 con avance de 6 px para la UI. Obligatorio: ÁÉÍÓÚÜÑ áéíóúüñ ¡ ¿ « ». Tres variantes: tiza (blanca con 1 px de ruido), tinta (bocadillos) y dorada (logo).

### 11.3 Baraja española (dibujo propio)

- Carta 38×58: fondo papel, marco negro de 1 px con la «pinta» tradicional (interrupciones del marco según palo: oros ninguna, copas una, espadas dos, bastos tres). Índices en las esquinas superior izquierda e inferior derecha.
- Pips con la disposición tradicional de cada número: oros como monedas, copas como cálices, espadas y bastos cruzados.
- Figuras de diseño propio y sencillo (unos 26×40 dentro del marco): sota de pie, caballo montado, rey con corona, cada una con su palo.
- Reverso: rombos granate y crema con el escudo inventado del Bar El Envite.
- Versiones pequeñas: dorso 12×14 y cara 24×36 para el destape.

### 11.4 Sprites de personaje

- Bustos: 64×72 (frontal, compañero) y 60×76 (3/4, laterales). Cada personaje debe poder ocupar cualquier asiento: genera las dos orientaciones; la del oeste se puede espejar.
- Fotogramas mínimos: `idle` (2, respiración), `parpadeo`, `hablar` (3 visemas: A, O, cerrada), `pensar` (mano en la barbilla), `contento`, `cabreado`, `sorprendido`, `mirar_pareja`, y las 5 señas × 2 fotogramas (+2 señas de la casa).
- Formato: PNG + JSON compatible con la exportación de Aseprite (frames con x, y, w, h, duration y tags). Ruta: `assets/sprites/<id>.png` y `.json`.
- **Placeholders desde el día 1**: `placeholderGen.ts` genera cada personaje en píxeles a partir de `characters.ts` (colores de piel, pelo y ropa, y su rasgo distintivo: gafas, bigote, permanente, gorra, lentejuelas…), con todas las animaciones y señas y respetando la paleta. El cargador usa el PNG si existe y, si no, el placeholder. Así el juego es completo aunque falte arte final.

### 11.5 Animaciones de mesa

Reparto (carta que vuela desde el postre, 80 ms por carta), descarte (cartas al montón central), reposición, volteo en el destape, piedras al recuento, golpe en la mesa al cantar órdago (pequeño temblor de pantalla de 2 px), parpadeos aleatorios, reacciones al ganar o perder cada lance, bucles de Nicanor, entradas de cameos.

---

## 12. Audio

- **Música** (sólo intro, menú, jingles y campeón, como el original): sintetizador FM de 2 operadores por voz (portadora, moduladora, ADSR, feedback), 9 canales, timbre tipo AdLib. Canciones como datos de patrones en `songs/`:
  - `popurri` (60-90 s en bucle): tres secciones originales con aire de pasodoble (2/4), jota (3/4) y rumba.
  - `victoria` (5 s), `derrota` (4 s), `charanga` (20 s).
  - Todas son composición nueva.
- **Ambiente en partida** (volumen bajo, sin música): murmullo de bar, cafetera, vasos, pitidos lejanos de una máquina tragaperras genérica.
- **SFX**: barajar, repartir (uno por carta), carta en la mesa, descarte, piedra (varias muestras), montón de piedras, clic, hover, golpe de órdago, campanas (intro).
- **Voces**: `playLine(personaje, evento)` → bocadillo + audio.
  - Si existe `assets/voices/<personaje>/<evento>_<n>.ogg` → se reproduce (manifiesto generado con `npm run voices:manifest`).
  - Si no → **balbuceo sintético** en `babble.ts`: sílabas generadas a partir del texto (semilla = la línea), formantes simples, tono, velocidad y timbre propios de cada personaje. El ambiente baja de volumen mientras alguien habla.
  - Opción «Filtro Sound Blaster»: remuestreo a 11 025 Hz y 8 bits.
- Genera `VOICES.md` con la lista completa de líneas, su ruta de archivo y una guía de grabación (mono, 22 050 Hz, normalizado a −3 dBFS, 0,2 s de silencio al principio y al final) para poder grabarlas con actores de voz aficionados.

---

## 13. Controles

| Acción | Ratón | Teclado |
|---|---|---|
| Mus / No hay mus | Botones | M / N |
| Elegir cartas a descartar | Clic en carta | 1-4 |
| Descartar | Botón | D |
| Paso / Envido / Órdago | Botones | P / E / O |
| Subir o bajar cantidad | − / + | ← / → |
| Quiero / No quiero / Más | Botones | Q / X / + |
| Menú de señas | Botón SEÑAS | S, luego 1-5 |
| Continuar | Clic | Espacio / Intro |
| Historial de la mano | — | L |
| Pausa | — | Esc |
| Pantalla completa | — | F |
| Ayuda contextual | — | H |

Todo control tiene foco visible con teclado; ninguna acción está disponible fuera de turno.

---

## 14. Opciones y guardado

Opciones: Dificultad · Reglas (reyes, puntos por juego, juegos por partida, mus corrido) · Señas (clásico, discreto, off; señas de la casa) · Velocidad de la IA · Parloteo (poco, normal, clásico) · Volumen de música, efectos y voces · Voces sintéticas (sí/no) · Filtro Sound Blaster · Escalado (auto, 2x…6x) · Corrección 4:3 · Arranque retro (sí/no) · Chivato de señas (sí/no) · Historial siempre visible.

Guardado en `localStorage` con claves `musped.opciones`, `musped.torneo`, `musped.estadisticas` (versionadas, con migración si cambia el formato).

---

## 15. Hitos y criterios de aceptación

| Hito | Contenido | Hecho cuando… |
|---|---|---|
| H0 | Proyecto Vite + TS + Vitest + lint; `CLAUDE.md` con el resumen de esta spec y el plan | `npm run dev`, `npm test` y `npm run build` funcionan |
| H1 | Motor de reglas completo (sección 4) + simulador `npm run sim -- --hands 10000 --seed 1` | Los 17 tests pasan; el simulador termina sin errores |
| H2 | IA heurística + partida IA contra IA en consola con registro legible | Una partida completa se lee como una partida real de mus |
| H3 | Escena de mesa con placeholders: el humano juega una partida completa con ratón y teclado, bocadillos de texto, recuento animado | Partida jugable de principio a fin, aunque sea fea |
| H4 | IA completa: Monte Carlo, personalidades, dificultades, modo Clásico 96, Web Worker si hace falta | Cada personalidad se nota en 20 manos; menos de 30 ms por decisión |
| H5 | Sistema de señas completo (modos, caza, chivato) | Las señas del compañero cambian sus decisiones y las del humano |
| H6 | Flujo completo: arranque, intro, menú, opciones, cómo se juega, selección, torneo, fin de partida, campeón, pausa, guardado | Torneo de tres rondas completo con guardado y carga |
| H7 | Audio: sintetizador, música original, SFX, voces (balbuceo + ogg), `VOICES.md` | Todas las acciones tienen sonido; sin clics ni saturación |
| H8 | Pulido: Nicanor, cameos, huevos de pascua, ciclo de paleta, 4:3, rendimiento y bugs | Prueba de resistencia: 200 manos IA contra IA en la escena a velocidad x10 sin errores; 60 fps estables |

---

## 16. Forma de trabajar

- Antes de programar, crea `CLAUDE.md` con las decisiones clave y el orden de hitos.
- Trabaja hito a hito. Al cerrar cada uno: tests en verde, `npm run build` correcto, commit con mensaje descriptivo y un resumen breve de lo hecho y lo pendiente.
- Si alguna regla te parece ambigua, aplica la interpretación del reglamento estándar de mus a 8 reyes, anótala en `DECISIONES.md` y sigue sin bloquearte.
- Todas las cadenas visibles van en `lines.es.ts` o en un diccionario de UI (preparado para otros idiomas).
- Si puedes hacer capturas (por ejemplo con Playwright), revisa la mesa a escala 1x y 3x tras cada cambio visual y corrige solapes de bocadillos y botones.
- Recuerda la sección 2 en cada decisión de arte, texto y sonido.
