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
