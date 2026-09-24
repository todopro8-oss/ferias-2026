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
