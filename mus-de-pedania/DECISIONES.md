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
- **Rebarajar descartes.** Si el mazo no alcanza, se barajan *todos* los descartes acumulados, también
  los de la ronda en curso, como dice la spec. En teoría uno puede recuperar una carta que acaba de tirar.
- **Fin de juego por deje.** Si un deje hace llegar a los puntos, el juego termina sin destape: no queda
  nada por resolver. (La escena puede enseñar las cartas igualmente.)
- **Órdago ganado.** El marcador no se toca: el juego lo gana directamente la pareja ganadora del lance.
- **«¡Adentro!».** Se canta cuando un equipo *cruza* el umbral de `puntosJuego − 5` (35 a 40, 25 a 30) al
  terminar una mano, y no en cada mano siguiente, para no repetirlo.
- **Límites del envite.** Cada envite o subida es de 2 a 40 piedras; el total no tiene tope (en la
  práctica, lo que pase de lo que falta para ganar se decide con órdago).
- **Rotación entre juegos.** Al empezar un juego nuevo, el postre sigue rotando: la mano del último
  juego pasa a ser postre del primero del siguiente.
- **Declaraciones.** «Pares sí/no» y «Juego sí/no» son automáticas y siempre verdaderas: las dicta la mano.
- **Estadísticas públicas.** El motor lleva, además, cuántas cartas descartó cada uno en cada ronda
  (`descartesPorRonda`), si se han rebarajado los descartes y el historial de todo lo dicho. La vista de
  la IA se construye sólo a partir de eso y de sus propias cartas (`src/ai/view.ts`).
