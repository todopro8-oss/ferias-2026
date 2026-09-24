// Textos de «Cómo se juega» y de la mano guiada.

export interface PaginaReglas {
  titulo: string;
  lineas: string[];
  /** Cartas de ejemplo en forma corta («Ro 3c Ae 2b»), con un rótulo. */
  ejemplos?: { cartas: string; rotulo: string }[];
}

export const PAGINAS_REGLAS: PaginaReglas[] = [
  {
    titulo: 'El mus, en pocas palabras',
    lineas: [
      'Se juega por parejas: tú (abajo) y tu',
      'compañero (enfrente), contra los otros dos.',
      '',
      'Gana el juego la pareja que llega antes a',
      '40 piedras. Cinco piedras hacen un amarraco:',
      'en la pizarra se apuntan como palotes.',
      '',
      'Cada mano se juega en cuatro lances:',
      'Grande, Chica, Pares y Juego (o Punto).',
    ],
  },
  {
    titulo: 'Las cartas',
    lineas: [
      'Baraja española de 40 cartas. Con 8 reyes,',
      'el tres cuenta como rey y el dos como as.',
      'Sota, caballo y rey valen 10 para el juego;',
      'el as, 1; el resto, lo que marcan.',
    ],
    ejemplos: [
      { cartas: 'Ro 3c', rotulo: 'reyes' },
      { cartas: 'Ae 2b', rotulo: 'ases' },
      { cartas: 'So Cc', rotulo: 'valen 10' },
    ],
  },
  {
    titulo: 'Mus y descartes',
    lineas: [
      'Empezando por la mano (ficha M), cada uno',
      'dice «Mus» si quiere cambiar cartas, o',
      '«No hay mus» si se queda con las que tiene.',
      '',
      'Si los cuatro piden mus, cada uno tira de 1',
      'a 4 cartas y el postre (ficha P) reparte',
      'otras tantas. El primer «No hay mus» corta',
      'y empiezan los lances.',
    ],
  },
  {
    titulo: 'Grande y Chica',
    lineas: [
      'A la GRANDE gana la mano más alta: se',
      'comparan las cartas de mayor a menor.',
      'A la CHICA gana la más baja.',
      'Si hay empate exacto, gana el que esté más',
      'cerca de la mano.',
    ],
    ejemplos: [
      { cartas: 'Ro Rc 3e 7b', rotulo: 'grande' },
      { cartas: 'Ao 2c Ae 4b', rotulo: 'chica' },
    ],
  },
  {
    titulo: 'Pares',
    lineas: [
      'Pareja (dos iguales) vale 1 piedra; medias',
      '(tres iguales), 2; duples (dos parejas, o',
      'cuatro iguales), 3. Sólo juegan los que',
      'tienen pares: antes se declara «sí» o «no».',
    ],
    ejemplos: [
      { cartas: 'Ro Rc 7e 4b', rotulo: 'pareja' },
      { cartas: '7o 7c 7e So', rotulo: 'medias' },
      { cartas: 'Ro Rc Ao Ac', rotulo: 'duples' },
    ],
  },
  {
    titulo: 'Juego y Punto',
    lineas: [
      'Hay JUEGO si tus cartas suman 31 o más.',
      'El orden es raro: 31, 32, 40, 37, 36, 35,',
      '34 y 33. La 31 vale 3 piedras; el resto, 2.',
      '',
      'Si nadie tiene juego, se juega al PUNTO:',
      'gana la suma más alta y vale 1 piedra.',
    ],
    ejemplos: [
      { cartas: 'Ro Cc So Ab', rotulo: '31' },
      { cartas: 'Ro 3c 7e 5b', rotulo: '32' },
    ],
  },
  {
    titulo: 'Envites y órdagos',
    lineas: [
      'Paso: no apuestas. Envido: apuestas 2 (o',
      'más). Al envite se contesta Quiero, No',
      'quiero, o subiendo («cinco más»).',
      'Si no te quieren, cobras en el acto el deje:',
      '1 piedra, o lo que ya estaba aceptado.',
      '',
      'ÓRDAGO es apostarlo todo: si lo quieren,',
      'se destapan las cartas y ese lance decide',
      'el juego entero.',
    ],
  },
  {
    titulo: 'El recuento',
    lineas: [
      'Al final se destapan las cartas y se cuenta',
      'lance a lance: lo querido; 1 piedra a quien',
      'gane la grande o la chica en paso; y las',
      'jugadas de pares y juego de la pareja que',
      'gana ese lance. Se comprueba tras cada suma:',
      'quien llega antes a 40, gana, aunque el otro',
      'fuera a llegar después.',
    ],
  },
  {
    titulo: 'Las señas',
    lineas: [
      'Durante el mus y hasta los pares puedes',
      'hacer señas a tu compañero (botón SEÑAS o',
      'tecla S). Ojo: los rivales pueden cazarlas.',
      '',
      'Labio mordido: dos reyes · Lengua: dos ases',
      'Boca torcida: medias · Cejas: duples',
      'Guiño: 31 (o 30 al punto)',
    ],
  },
  {
    titulo: 'Controles',
    lineas: [
      'M / N: mus / no hay mus · 1-4 y D: descarte',
      'P / E / O: paso / envido / órdago',
      '← →: cantidad del envite',
      'Q / X / +: quiero / no quiero / más',
      'S: señas · L: lo que se ha dicho',
      'H: ayuda · Esc: pausa · F: pantalla completa',
      'Espacio o Intro: continuar',
    ],
  },
];

/** Mano guiada: cartas fijadas (asiento 0 = tú, eres mano). */
export const MANOS_TUTORIAL = ['Ro Rc 3e Sb', 'Co Cc 7o 5o', 'Ae 2c 6e 4b', '7c 6c 5b Ab'] as const;

export const PISTAS_TUTORIAL = {
  inicio: 'Mano guiada: sigue las pistas de este papel. Eres mano (ficha M): hablas el primero.',
  mus: 'Tienes rey, rey, tres (que cuenta como rey) y sota: ¡medias de reyes y 40! Corta: «No hay mus» (N).',
  descarte: 'Toca las cartas que quieras tirar (o 1-4) y pulsa DESCARTAR (D).',
  grandeAbrir: 'A la grande, tres reyes y sota son muy buenos: envida (E). Con ← → cambias la cantidad.',
  grandeResponder: 'Te han envidado a la grande: con tres reyes, quiere (Q) o sube (+).',
  chicaAbrir: 'A la chica gana la mano más baja; las tuyas son altísimas: pasa (P).',
  chicaResponder: 'Envite a la chica: con cartas altas, mejor «No quiero» (X).',
  paresAbrir: 'Tienes medias de reyes: envida sin miedo (E).',
  paresResponder: 'Con medias de reyes, quiere (Q).',
  juegoAbrir: 'Tu 40 es juego, pero la 31 le gana. Pasa o envida poco.',
  juegoResponder: 'Con 40 al juego, piensa: la 31 y la 32 te ganan.',
  puntoAbrir: 'Nadie tiene juego: se juega al punto. Gana la suma más alta.',
  espera: 'Mira las caras: a veces se escapa una seña…',
  fin: 'Así se cuenta: cada lance suma piedras. Pulsa CONTINUAR para volver. ¡Ya sabes jugar al mus!',
};
