# DECISIONES.md

Decisiones de diseño y de interpretación de reglas que no están en `PROMPT.md` o que la matizan.
Cada entrada: qué se decidió y por qué.

## Proyecto

- **Subcarpeta `mus-de-pedania/`.** La spec pide un repo vacío, pero el repositorio ya tenía un
  `index.html` ajeno al juego. Para no tocarlo, el proyecto vive en su propia carpeta con su propio
  `package.json`.
- **TypeScript 6.0 en vez de 7.x.** `typescript-eslint` sólo soporta TypeScript < 6.1, así que se fija
  la última 6.0 para que el lint funcione.
- **`publicDir: 'assets'`.** Así `assets/sprites` y `assets/voices` se sirven tal cual: el juego los pide
  con rutas relativas `sprites/…` y `voices/…`. `base: './'` para poder publicarlo en cualquier subruta.

## Reglas (H1)

- **El «ack» de la escena.** El motor (`ManoMus`) avanza de forma síncrona hasta la siguiente decisión y
  deja los eventos en una cola (`sacarEventos()`). La escena los reproduce uno a uno y sólo pide la
  siguiente decisión cuando la cola está vacía. Para el jugador es lo mismo que un motor que espera el
  ack de cada evento, y así el motor sigue siendo puro y fácil de testear.
- **Punto rechazado.** Si nadie quiere el envite al punto, el equipo que envidó cobra el deje en el acto
  y, en el recuento, también el +1 del punto. Es lo mismo que pasa en pares y juego, donde quien gana por
  «no quiero» cobra además el valor de sus jugadas.
- **Rebarajar descartes.** Si el mazo no alcanza, se barajan _todos_ los descartes acumulados, también
  los de la ronda en curso, como dice la spec. En teoría uno puede recuperar una carta que acaba de tirar.
- **Fin de juego por deje.** Si un deje hace llegar a los puntos, el juego termina sin destape: no queda
  nada por resolver. (La escena puede enseñar las cartas igualmente.)
- **Órdago ganado.** El marcador no se toca: el juego lo gana directamente la pareja ganadora del lance.
- **«¡Adentro!».** Se canta cuando un equipo _cruza_ el umbral de `puntosJuego − 5` (35 a 40, 25 a 30) al
  terminar una mano, y no en cada mano siguiente, para no repetirlo.
- **Límites del envite.** Cada envite o subida es de 2 a 40 piedras; el total no tiene tope (en la
  práctica, lo que pase de lo que falta para ganar se decide con órdago).
- **Rotación entre juegos.** Al empezar un juego nuevo, el postre sigue rotando: la mano del último
  juego pasa a ser postre del primero del siguiente.
- **Declaraciones.** «Pares sí/no» y «Juego sí/no» son automáticas y siempre verdaderas: las dicta la mano.
- **Estadísticas públicas.** El motor lleva, además, cuántas cartas descartó cada uno en cada ronda
  (`descartesPorRonda`), si se han rebarajado los descartes y el historial de todo lo dicho. La vista de
  la IA se construye sólo a partir de eso y de sus propias cartas (`src/ai/view.ts`).

## IA (H2)

- **Tablas de percentiles.** Al primer uso se recorren las 91.390 manos posibles (unos 50 ms) y se guarda,
  para cada lance, el percentil de cada clave. La IA «Fácil» decide sólo con eso; las demás lo usan
  también para el mus y el descarte.
- **Probabilidad de la pareja sin Monte Carlo.** Con mi mano en el percentil F y la de mi compañero
  desconocida, P(ganar) = P(max(F, U) > max(R1, R2)) = F³ + (1 − F³)/3.
- **Valor de mus.** «Corta si supera `cor`» se aplica sobre el percentil del valor esperado de la mano
  elevado a 1,5. Sin esa curva, los umbrales de la tabla (0,45–0,75) hacían cortar casi siempre al
  primero: con ella, en torno a un 20 % de las manos tiene al menos una ronda de mus, más parecido a
  una mesa de verdad.
- **Respeto a las apuestas rivales.** Cada envite rival en el lance es información: la `p` estimada se
  eleva a `1 + 0,7·apuestas (+0,5 si es órdago)`. Sin esto la IA quería casi todo.
- **Tope de subidas.** A partir de la tercera subida en un lance, o si lo que ya se juega supera lo que
  falta para ganar, la IA sólo quiere, no quiere o va al órdago. Evita subastas infinitas entre dos
  manos buenas.
- **Umbral de «quiero».** Sale de la esperanza: querer una apuesta V cuando rechazarla cuesta A compensa
  si (2p − 1)·V > −A, o sea p > ½ − A/(2V). Encima se suma un margen que baja con la agresividad.
- **Compañero del humano.** Si le toca contestar antes que el humano, sólo quiere con p claramente alta.
  Si no, dice «no quiero» para que conteste el humano. Así nunca decide por él.

## Mesa y arte (H3)

- **Coordenadas.** Se respetan las de la sección 10 salvo: la puerta llega hasta la mesa (26×74) para que
  los cameos entren de cuerpo entero; los bustos laterales bajan 4 px (y = 54) para que el corte inferior
  quede tapado por los paneles; los montones de piedras van a (84,124) y (214,124) para no chocar con
  los bustos, y la ficha de mano/postre del humano va sobre la mesa (126,127).
- **Fuente bitmap.** Celda de 5×11: las tildes de las mayúsculas usan dos filas por encima de la altura
  de las mayúsculas y los descendentes, dos por debajo. Así un botón de 11 px de alto encaja una línea
  exacta. La variante de título es la negrita (avance 7) y el logo usa escala ×2.
- **Recuento.** `HandSummary` es un componente que la mesa dibuja encima, no una escena aparte: las
  piedras que vuelan y el marcador pertenecen a la mesa, y así no hace falta sincronizar dos escenas.
- **Parloteo.** La probabilidad de la sección 8.1 decide si el personaje dice su línea con gracia o la
  forma neutra («Envido dos.»). Las acciones siempre se anuncian: si no, el humano no sabría qué ha
  pasado. Las declaraciones de pares y juego son siempre cortas.
- **Bocadillos.** Las líneas de mesa caben en 2×22 caracteres (lo comprueba un test). Presentación,
  victoria y derrota se ven en pantallas con más sitio (4×30).
- **Pulgares.** Dos pulgares sujetan tus cartas, como en la vista en primera persona del original.
- **Orden de tus cartas.** Se muestran ordenadas por rango efectivo (de rey a as), como las ordenaría
  cualquiera en la mano. Las teclas 1-4 se refieren a ese orden.

## IA completa (H4)

- **Muestreo con restricciones.** El Monte Carlo reparte las cartas desconocidas jugador a jugador
  (4 cada uno) y rechaza las manos que contradicen lo que se sabe: declaraciones de pares y juego
  (restricciones duras) y señas vistas (blandas). Tras 50 intentos fallidos se relajan las señas y,
  si hiciera falta, las declaraciones. Muestrear jugador a jugador no da exactamente la distribución
  conjunta condicionada, pero se acerca mucho y es mucho más rápido que rechazar repartos enteros.
- **Verosimilitud de las apuestas.** Cada reparto simulado se pondera por lo creíble que hace el
  comportamiento del lance en curso. Quien envida pesa `0,3 + 0,7·σ((pct − 0,5)/0,15)`, porque suele
  llevar mano, confía en su compañero o farolea. Quien pasa pesa `1 − 0,35·σ(…)`. Con esa `p` ya
  condicionada, el «respeto» extra de `bet.ts` se reduce de 0,7 a 0,15 por apuesta.
- **Sin Web Worker.** 800 muestras cuestan unos 2 ms por decisión en Node (máximo medido de unos 4 ms),
  muy por debajo de los 30 ms del presupuesto. Hay un test que lo vigila. Si en algún navegador lento
  no llegara, `EstimadorMonteCarlo` es puro y se puede mover a un worker sin tocar nada más.
- **Umbrales por personalidad.** Envidar si `p > 0,74 − 0,34·agr`. Farol si `p < 0,35` y
  `rand < far·factorFarol`. Así se nota la diferencia entre la Rufi (53 % de aperturas envidadas, 9 % de
  faroles) y don Anselmo (33 % y 2 %). `npm run personalidades` saca la tabla completa.
- **«Difícil» aprende del humano.** Tras cada destape se mira si los envites del humano eran farol
  (percentil de su mano en ese lance < 0,4). La tasa suavizada `(faroles + 1)/(envites + 5)` hace que
  los rivales le quieran más a menudo cuando es él quien apuesta.

## Señas (H5)

- **Ventana de señas.** Abierta mientras el motor está en la fase de mus o de descarte, o en los lances
  de grande y chica. Se cierra en cuanto llegan las declaraciones de pares.
- **Señas caducadas.** Tras cada descarte (nueva ronda de mus) se olvidan las señas vistas: describían
  una mano que ya no existe.
- **Qué seña hace la IA.** Siempre dice la verdad y enseña su jugada más valiosa: duples, 31 (o 30),
  medias, tres reyes (de la casa), dos reyes, dos ases, ciego (de la casa). La hace con probabilidad
  `franqueza`, una vez por ventana, al abrirse ésta.
- **Probabilidad de caza.** `min(0,95; vista × factor de dificultad)`, multiplicado en modo discreto por
  `0,45 · (1,2 − disimulo del que la hace)`. La spec no decía dónde entraba el disimulo, y así una
  Marisa teatral (0,10) se deja ver mucho más que don Anselmo (0,80).
- **Señas del humano.** Como la vista es en primera persona, tu gesto se ve como un bocadillo gris
  («(te muerdes el labio)»). El compañero la recibe y se la cree, aunque sea falsa, y la usa en su
  Monte Carlo y en su decisión de mus. Los rivales pueden cazarla.
- **«¡Te he visto!».** Sólo en modo discreto, con la opción activada: clic en la cara de un rival
  mientras hace una seña. Queda en el historial y el rival «se pica», con +0,08 de agresividad para el
  resto de la partida.
- **Chivato.** Apunta en el historial (tecla L) todas las señas de la IA, con su significado.

## Flujo, torneo y guardado (H6)

- **Rivales del torneo.** La spec habla de «los 5 personajes restantes», pero de 7 personajes, quitando
  a tu compañero, quedan 6 (tú no eres ninguno). Se usan los 6: la final la juegan los dos de más nivel,
  y cuartos y semifinal, parejas formadas con los otros cuatro, sin repetir a nadie. Así se cumple
  «pareja nueva cada ronda» y salen todos.
- **Cuadro.** Los personajes rivales siempre ganan sus partidos contra parejas de relleno, para que
  aparezcan donde toca; los partidos de relleno se simulan con marcadores verosímiles (40 a 12-37).
  Si te eliminan, se simula el resto del cuadro para que el cartel quede completo.
- **Opciones durante la partida.** Desde la pausa se pueden cambiar opciones. La velocidad, el
  parloteo, el chivato, el historial y el audio se aplican al momento. Las reglas y la dificultad no:
  valen para la próxima partida, porque cambiar a 4 reyes en mitad de un juego no tiene sentido.
- **Salir.** En el navegador no se puede cerrar la pestaña desde el juego: «Café: Salir» se despide.
- **Tu nombre.** Se pide al inscribirse en el torneo (máx. 10 caracteres; por defecto «Forastero») y
  sale en la placa del campeón.
- **Guardado.** `musped.opciones` guarda las opciones, completadas con las de por defecto si aparecen
  claves nuevas. `musped.torneo` guarda el cuadro en curso y `musped.estadisticas` los totales. Cada
  valor va envuelto con su número de versión; si no coincide y no hay migración, se usa el valor por
  defecto. Si localStorage no está disponible (modo privado), se guarda en memoria durante la sesión.
