// Líneas de voz (sección 8.1). Al menos 4 variantes por evento y personaje.
// {n} = cantidad en letra («dos»), {N} = con mayúscula («Dos»).
// En la mesa, cada línea cabe en un bocadillo de 2 líneas de 22 caracteres
// (lo comprueba tests/textos.test.ts); la presentación se ve en la selección y puede ser más larga.

import type { IdPersonaje } from './characters';

export type EventoVoz =
  | 'presentacion'
  | 'mus'
  | 'noHayMus'
  | 'descarte'
  | 'paso'
  | 'envido'
  | 'envidoMas'
  | 'quiero'
  | 'noQuiero'
  | 'ordago'
  | 'quieroOrdago'
  | 'paresSi'
  | 'paresNo'
  | 'juegoSi'
  | 'juegoNo'
  | 'ganaLance'
  | 'pierdeLance'
  | 'senaCazada'
  | 'lePillanSena'
  | 'adentro'
  | 'victoria'
  | 'derrota'
  | 'idle';

export const EVENTOS_VOZ: readonly EventoVoz[] = [
  'presentacion',
  'mus',
  'noHayMus',
  'descarte',
  'paso',
  'envido',
  'envidoMas',
  'quiero',
  'noQuiero',
  'ordago',
  'quieroOrdago',
  'paresSi',
  'paresNo',
  'juegoSi',
  'juegoNo',
  'ganaLance',
  'pierdeLance',
  'senaCazada',
  'lePillanSena',
  'adentro',
  'victoria',
  'derrota',
  'idle',
];

export type LineasPersonaje = Record<EventoVoz, string[]>;

export const LINEAS: Record<IdPersonaje, LineasPersonaje> = {
  anselmo: {
    presentacion: [
      'Anselmo, boticario. Aquí se juega con receta.',
      'Don Anselmo, cuarenta años de farmacia. Sé leer letra de médico y caras de tahúr.',
      'Boticario jubilado. Si pierden, tengo algo para el disgusto.',
      'Anselmo. Vengo a dispensar piedras, con posología estricta.',
    ],
    mus: [
      'Mus, si no es molestia.',
      'Mus. Hay que cambiar el tratamiento.',
      'Mus. Esto no hay quien lo trague.',
      'Mus, por prescripción facultativa.',
    ],
    noHayMus: [
      'Me quedo como estoy. Posología correcta.',
      'No hay mus. El paciente está estable.',
      'No hay mus. Dosis ajustada.',
      'Así se queda. No se toca la fórmula.',
    ],
    descarte: [
      'Me descarto de {n}. Sin receta.',
      '{N}, por favor.',
      'Retiro {n}. Caducadas.',
      'Deme {n}, genéricas si puede.',
    ],
    paso: ['Paso. En ayunas.', 'Paso, con cautela.', 'Paso. Reposo relativo.', 'Paso. Ya veremos en la revisión.'],
    envido: [
      'Dos piedras. Dosis mínima.',
      'Envido. Una toma.',
      'Envido, sin efectos secundarios.',
      'Envido {n}. Cada ocho horas.',
    ],
    envidoMas: [
      '{N} más. Refuerzo la dosis.',
      'Subo {n}. Tratamiento de choque.',
      '{N} más, en jarabe.',
      '{N} más. Lo dice el prospecto.',
    ],
    quiero: [
      'Quiero. Bajo mi responsabilidad.',
      'Quiero. Diagnóstico claro.',
      'Quiero, con receta.',
      'Lo quiero. Me lo apunto en la ficha.',
    ],
    noQuiero: [
      'No quiero. Contraindicado.',
      'No quiero. Alérgico a eso.',
      'No. Me produce ardores.',
      'No quiero. Consulte a su médico.',
    ],
    ordago: [
      'Órdago. Y sin prospecto.',
      'Órdago. Dosis letal.',
      'Órdago. Esto ya es cirugía.',
      'Órdago, y que Dios reparta suerte.',
    ],
    quieroOrdago: [
      'Lo quiero. Que se abran los frascos.',
      'Quiero. Sale la verdad clínica.',
      'Quiero. A ver ese análisis.',
      'Veamos esas radiografías.',
    ],
    paresSi: [
      'Pares sí, con prescripción.',
      'Sí, pares. Positivo.',
      'Tengo pares, confirmado.',
      'Pares, según la analítica.',
    ],
    paresNo: [
      'Pares no. Negativo.',
      'No, nada. Limpio.',
      'Sin pares. Resultado normal.',
      'Nada de pares, por desgracia.',
    ],
    juegoSi: [
      'Juego sí. Tensión alta.',
      'Tengo juego, confirmado.',
      'Juego, según la báscula.',
      'Sí hay juego. Fiebre.',
    ],
    juegoNo: [
      'Juego no. Glucosa baja.',
      'No llego. Anemia.',
      'Sin juego. Hay que reforzar.',
      'Juego no. Me falta hierro.',
    ],
    ganaLance: ['Lo que yo decía: dosis justa.', 'Tratamiento eficaz.', 'Mano de santo.', 'Remedio de rebotica.'],
    pierdeLance: [
      'Efecto secundario imprevisto.',
      'Mal diagnóstico, lo reconozco.',
      'Hay que cambiar de pastillas.',
      'Esto no venía en el prospecto.',
    ],
    senaCazada: [
      'Eso ha sido seña, caballero.',
      'Le he visto el tic. Anotado.',
      'Esa mueca la tengo fichada.',
      'Seña vista. No soy ciego.',
    ],
    lePillanSena: [
      'Era un tic nervioso, nada más.',
      'Es la dentadura, que me baila.',
      'Un leve espasmo, sin importancia.',
      'No era nada. Una alergia.',
    ],
    adentro: [
      '¡Adentro! Ya huele a victoria.',
      'Adentro. El paciente mejora.',
      '¡Adentro, señores!',
      'Adentro. Alta médica cerca.',
    ],
    victoria: [
      'Una cucharada cada ocho horas, lo que yo decía.',
      'Curados. Pasen por caja.',
      'Tratamiento completado con éxito.',
      'Esto se lo receto a cualquiera.',
    ],
    derrota: [
      'Habrá que pedir segunda opinión.',
      'El tratamiento ha fracasado.',
      'Me voy a tomar una tila.',
      'Ni el mejor jarabe arregla esto.',
    ],
    idle: [
      'Aquí antes había botica, ¿saben?',
      'Nicanor, un descafeinado de sobre.',
      'Esta tos no me gusta nada.',
      'Con calma, que no hay prisa.',
    ],
  },
  rufi: {
    presentacion: [
      'Soy la Rufi, y a mí no me peina nadie dos veces.',
      'La Rufi, peluquería Rufi. Corto, marco y gano.',
      'Rufi, para servirte. Luego en la pelu me contáis cómo perdisteis.',
      'Rufi. Traigo la laca puesta y la lengua suelta.',
    ],
    mus: [
      '¡Mus, que tienen las puntas abiertas!',
      '¡Mus! Esto hay que lavarlo y marcarlo.',
      'Mus, cariño, que vengo de rulos.',
      '¡Mus! Estas cartas pide tinte.',
    ],
    noHayMus: [
      '¡Quieto todo el mundo, que me quedo!',
      '¡No hay mus! Peinado perfecto.',
      'Ni lo toques, que está de peluquería.',
      'No hay mus, bonito. Como el secador.',
    ],
    descarte: ['Fuera {n}, a la basura.', '{N}, rapidito.', 'Me corto {n}. Las puntas.', 'Dame {n} bonitas.'],
    paso: ['Paso, de momento.', 'Paso, pero te estoy mirando.', 'Paso, cariño.', 'Paso. Que hable el de al lado.'],
    envido: [
      'Envido, y no me mires así.',
      '¡Envido, que me aburro!',
      'Envido {n}, con permanente.',
      'Envido, y tú a callar.',
    ],
    envidoMas: [
      '¡{N} más! Toma mechas.',
      '{N} más, y no me repliques.',
      '¡Pues {n} más, hombre ya!',
      '{N} más. Te lo marco a cepillo.',
    ],
    quiero: ['¡Quiero! Y sin rechistar.', 'Quiero, bonito.', 'Quiero. Que te veo venir.', '¡Anda, quiero!'],
    noQuiero: [
      'Ni loca, bonito.',
      'No quiero. Hoy no me peino.',
      '¡Quita, quita! No quiero.',
      'No quiero, que me estropeas el tinte.',
    ],
    ordago: [
      '¡Órdago, y luego me lo contáis en la pelu!',
      '¡Órdago! Y a secador.',
      '¡Órdago, que se me rizan las pestañas!',
      '¡ÓRDAGO! ¿Qué pasa?',
    ],
    quieroOrdago: [
      '¡Lo quiero! Destapad.',
      '¡Quiero! Que se vea ya.',
      'Quiero, y como me engañes…',
      '¡Venga, a ver esas cartas!',
    ],
    paresSi: ['¡Pares sí!', 'Pares, cariño.', 'Sí, sí, pares.', 'Pares tengo, como los pendientes.'],
    paresNo: ['Pares no. Qué rabia.', 'No, nada.', 'Pares no, bonito.', 'Ni una pareja. Como mi prima.'],
    juegoSi: ['¡Juego sí!', 'Juego, y bien peinado.', 'Tengo juego, sí.', 'Juego sí, ¿algún problema?'],
    juegoNo: ['Juego no. Qué asco.', 'No llego, no.', 'Juego no, cariño.', 'Sin juego. Hoy no es mi día.'],
    ganaLance: [
      '¡Toma ya! Lavar y marcar.',
      '¡Ja! ¿Quién es la mejor?',
      '¡Para la saca!',
      'Eso me lo apunto en la pelu.',
    ],
    pierdeLance: ['¡Hala! Qué mala suerte.', 'Esto no me lo creo.', '¡Tramposos!', 'Pues vaya pelo me ha quedado.'],
    senaCazada: [
      '¡Eso ha sido seña! Te he visto.',
      '¡Uy, esa ceja! Seña.',
      '¡Ay, que se hacen señas!',
      'A mí no me la pegas, guapo.',
    ],
    lePillanSena: [
      '¿Yo? Es el chicle.',
      '¡Qué va! Tengo un pelo en el ojo.',
      'Era un tic, bonito.',
      'Estaba bostezando, ¿vale?',
    ],
    adentro: [
      '¡Adentro, que nos vamos!',
      '¡Adentro! ¡Que corra la voz!',
      '¡Adentro, chicos!',
      'Adentro, y ya casi al tinte.',
    ],
    victoria: [
      'Lavar, marcar y ganar.',
      '¡Os he dejado como una permanente!',
      '¡Esto lo cuento mañana en la pelu!',
      '¡Ganamos! ¡Invito a laca!',
    ],
    derrota: [
      '¡Me voy a quejar a la comarca!',
      'Qué rabia me da…',
      'Esto ha sido un robo.',
      'Pues a mí no me peina nadie más.',
    ],
    idle: [
      '¿Os habéis enterado de lo de la Puri?',
      'Esta semana, mechas a mitad de precio.',
      'Nicanor, un cortado, ¡y con prisa!',
      'Uf, qué calor hace aquí.',
    ],
  },
  canijo: {
    presentacion: [
      'Me llaman el Canijo. Pregúntame por qué.',
      'El Canijo. Dos metros de camionero y cero paciencia.',
      'Canijo. Mañana tengo ruta, así que rapidito.',
      'Soy el Canijo. Aquí se descarga y se cobra.',
    ],
    mus: ['Mus. Y rapidito, que tengo ruta.', 'Mus. Cambio de marcha.', 'Mus, y sin paradas.', 'Mus. Esto no tira.'],
    noHayMus: [
      'Aquí no se cambia nada.',
      'No hay mus. Carga completa.',
      'Quieto. Así va bien.',
      'No hay mus. En cuarta.',
    ],
    descarte: ['{N}.', 'Fuera {n}.', 'Descargo {n}.', '{N}, y arreando.'],
    paso: ['Paso.', 'Paso. Por ahora.', 'Paso, en punto muerto.', 'Paso. Pisa tú.'],
    envido: ['Envido. Tres. Cuatro. Lo que sea.', 'Envido.', 'Envido {n}. Sin frenos.', 'Envido, y pisa.'],
    envidoMas: ['{N} más.', '{N} más. Y acelero.', 'Subo {n}. A tope.', '{N} más, que no hay radar.'],
    quiero: ['Quiero.', 'Venga. Quiero.', 'Quiero. A ver qué tienes.', 'Quiero, claro.'],
    noQuiero: ['…Hoy no.', 'No quiero.', 'No. Paso de curvas.', 'Nah. No quiero.'],
    ordago: ['¡ÓRDAGO! Y a la cama.', '¡Órdago! ¡A tope!', '¡ÓRDAGO, hombre!', '¡Órdago! Sin frenos.'],
    quieroOrdago: ['¡Quiero! ¡Vamos!', '¡A por ello! Quiero.', 'Quiero. Al carajo.', '¡Venga ese órdago!'],
    paresSi: ['Pares.', 'Pares sí.', 'Tengo, sí.', 'Pares, y buenos.'],
    paresNo: ['No.', 'Pares no.', 'Nada.', 'Ni una.'],
    juegoSi: ['Juego.', 'Juego sí.', 'Tengo juego.', 'Juego, y cargado.'],
    juegoNo: ['No.', 'Juego no.', 'No llego.', 'Nada de juego.'],
    ganaLance: ['¡Toma!', '¡Ahí va!', 'Descargado.', '¡Pa dentro!'],
    pierdeLance: ['Me cago en…', 'Mecachis.', 'Pinchazo.', 'Bah.'],
    senaCazada: ['¡Eh! ¡Eso es seña!', 'Te he visto, listo.', '¡Señitas no, eh!', 'Vaya careto has puesto.'],
    lePillanSena: ['¿Qué? Me pica.', 'Estoy cansado, es eso.', 'Es el sueño, hombre.', 'Me he tragado un mosquito.'],
    adentro: ['¡Adentro!', '¡ADENTRO, coño!', '¡Adentro, a puerto!', 'Adentro. Ya se ve la meta.'],
    victoria: [
      'Descargado y entregado.',
      '¡A la cama con la victoria!',
      'Otra ruta completada.',
      '¡Ganamos, hombre ya!',
    ],
    derrota: ['Bah. Mañana, más.', 'Me voy a la ruta.', 'Qué mal. Otra vez será.', 'Hoy no era el día.'],
    idle: ['Nicanor, una caña.', 'Mañana salgo a las cinco.', '¿Queda tortilla?', 'Venga, que se enfría.'],
  },
  pura: {
    presentacion: [
      'Pura, del estanco. Aquí no se fía.',
      'Doña Pura. Sellos, tabaco y piedras. Todo al contado.',
      'Pura, la del estanco. Veinte años de mus y ni un euro regalado.',
      'Soy Pura. Hoy cierro pronto: vengo a ganar.',
    ],
    mus: [
      'Mus. Pero cartas nuevas, ¿eh?',
      'Mus. Estas no valen ni un sello.',
      'Mus. Devuélvame el cambio.',
      'Mus, y cuéntelas bien.',
    ],
    noHayMus: [
      'No hay mus. Cerrado por inventario.',
      'Me quedo. Mercancía buena.',
      'No hay mus. Caja cerrada.',
      'No se toca nada.',
    ],
    descarte: ['{N}. Y no me dé las de antes.', 'Me descarto de {n}.', '{N}, justas.', 'Cambio {n}. Con recibo.'],
    paso: ['Paso.', 'Paso. Ni un céntimo.', 'Paso, de momento.', 'Paso. Esto no lo pago.'],
    envido: ['Dos. Ni una más.', 'Envido. Lo justo.', 'Envido {n}. Al contado.', 'Envido, con timbre.'],
    envidoMas: ['{N} más. Y se acabó.', '{N} más, sin descuento.', 'Subo {n}. Al contado.', '{N} más. Firme aquí.'],
    quiero: ['Quiero. Pague usted.', 'Quiero. Hágame el cambio.', 'Quiero, pero cuente bien.', 'Lo quiero.'],
    noQuiero: [
      'No quiero. Aquí se paga al contado.',
      'No. No hay fianza.',
      'No quiero. Aquí no se fía.',
      'No. Otro día.',
    ],
    ordago: [
      'Órdago. Primera vez en veinte años.',
      'Órdago. Se cierra la caja.',
      'Órdago. Todo a una carta.',
      'Órdago. Y no se hable más.',
    ],
    quieroOrdago: [
      'Quiero. Enseñe la mercancía.',
      'Lo quiero. A ver ese género.',
      'Quiero. Cuentas claras.',
      'Veamos esas cartas.',
    ],
    paresSi: ['Pares sí.', 'Tengo pares.', 'Sí.', 'Pares, contados.'],
    paresNo: ['Pares no.', 'No.', 'Nada.', 'Sin pares.'],
    juegoSi: ['Juego sí.', 'Tengo juego.', 'Sí.', 'Juego, sí señor.'],
    juegoNo: ['Juego no.', 'No.', 'No llego.', 'Sin juego.'],
    ganaLance: ['A caja.', 'Cobrado.', 'Anotado en el libro.', 'Esto es mío.'],
    pierdeLance: ['Qué mala pata.', 'Mal negocio.', 'Pérdidas.', 'Ya lo recuperaré.'],
    senaCazada: [
      'Seña. La he visto.',
      'Esa cara me la conozco.',
      'Aquí no se hacen trampas.',
      'Menos muecas, que le veo.',
    ],
    lePillanSena: ['Son las gafas, que me aprietan.', 'Estaba contando.', 'Tengo un orzuelo.', 'Nada, el humo.'],
    adentro: ['Adentro.', 'Adentro. A cerrar caja.', 'Adentro, sin prisas.', 'Adentro. Ya se ve el final.'],
    victoria: [
      'Firme aquí, que le hago el recibo.',
      'Cobrado. Hasta otra.',
      'Buen género, mejor cobro.',
      'Caja cerrada. Ganamos.',
    ],
    derrota: ['Mal día para el negocio.', 'Pérdidas. A cerrar.', 'Esto no vuelve a pasar.', 'Me voy al estanco.'],
    idle: [
      'Nicanor, que el café lo pago yo, no usted.',
      'Me he dejado la persiana a medias.',
      'Hoy han llegado sellos nuevos.',
      'Hay que ver cómo está todo.',
    ],
  },
  tomasin: {
    presentacion: [
      'Tomasín. Estudio Estadística, así que ya habéis perdido.',
      'Tomasín, tercero de Estadística. Esto es un problema de probabilidad.',
      'Tomasín. He simulado este torneo diez mil veces en el ordenador.',
      'Soy Tomasín. Vuestra suerte es sólo varianza.',
    ],
    mus: [
      'Mus. Probabilidad de mejora favorable.',
      'Mus. Muestra insuficiente.',
      'Mus. Toca remuestrear.',
      'Mus. Esto es ruido.',
    ],
    noHayMus: [
      'No hay mus. Varianza controlada.',
      'No hay mus. Óptimo local.',
      'Me quedo. El modelo es claro.',
      'No hay mus. Significativo.',
    ],
    descarte: ['{N}. Es lo óptimo.', 'Descarto {n}.', '{N}. Lo dice la tabla.', 'Fuera {n}, por esperanza.'],
    paso: ['Paso. Falta información.', 'Paso. Hipótesis nula.', 'Paso, por ahora.', 'Paso. Espero datos.'],
    envido: [
      'Envido. Lo dicen los números.',
      'Envido. Esperanza positiva.',
      'Envido {n}. Calculado.',
      'Envido. P mayor que un medio.',
    ],
    envidoMas: [
      '{N} más. Es racional.',
      'Subo {n}. Teoría de juegos.',
      '{N} más. Lo he calculado.',
      '{N} más. Dominante.',
    ],
    quiero: ['Quiero. Esperanza positiva.', 'Quiero. Ajustado a modelo.', 'Quiero, con un 60 %.', 'Quiero. Es óptimo.'],
    noQuiero: [
      'No quiero. No es significativo.',
      'No quiero. P-valor alto.',
      'No. Esperanza negativa.',
      'No quiero. Riesgo excesivo.',
    ],
    ordago: [
      'Órdago. Confianza del 95 por ciento.',
      'Órdago. Óptimo global.',
      'Órdago. Ganamos, estadísticamente.',
      'Órdago. Sin intervalo.',
    ],
    quieroOrdago: [
      'Quiero. Veamos la muestra.',
      'Quiero. Que decida el azar.',
      'Quiero. Contraste final.',
      'Quiero. Distribución a la vista.',
    ],
    paresSi: ['Pares sí. Evento probable.', 'Pares, sí.', 'Tengo pares.', 'Sí. Cincuenta y siete por ciento.'],
    paresNo: ['Pares no.', 'No. Mala muestra.', 'Pares no. Estaba en la cola.', 'Sin pares.'],
    juegoSi: ['Juego sí.', 'Juego. Veintisiete por ciento.', 'Tengo juego.', 'Juego sí. Poco probable, pero sí.'],
    juegoNo: ['Juego no.', 'No llego. Esperable.', 'Sin juego.', 'Juego no. Lo más probable.'],
    ganaLance: ['Como predijo el modelo.', 'Estadísticamente inevitable.', 'Esperanza cumplida.', 'Q.E.D.'],
    pierdeLance: ['Un outlier. No cuenta.', 'Varianza, sólo varianza.', 'Muestra sesgada.', 'Error de tipo dos.'],
    senaCazada: [
      'Seña detectada. Correlación clara.',
      'Eso es una seña. Lo he visto.',
      'Patrón detectado.',
      'Esa mueca no es aleatoria.',
    ],
    lePillanSena: [
      'Era un gesto aleatorio.',
      'Pura coincidencia.',
      'Correlación no implica seña.',
      'Estaba pensando en una integral.',
    ],
    adentro: [
      'Adentro. Convergemos.',
      '¡Adentro! Tendencia al alza.',
      'Adentro. Intervalo favorable.',
      'Adentro. Lo previsto.',
    ],
    victoria: [
      'Como predijo el modelo.',
      'Resultado significativo.',
      'Victoria con un p menor de 0,05.',
      'Hipótesis confirmada.',
    ],
    derrota: [
      'Muestra demasiado pequeña.',
      'El modelo necesita ajustes.',
      'Esto es un outlier.',
      'Mala semilla aleatoria.',
    ],
    idle: [
      '¿Sabíais que hay 91.390 manos posibles?',
      'Nicanor, ¿tienes wifi? Ah, no.',
      'Esto lo voy a meter en mi trabajo.',
      'Interesante distribución.',
    ],
  },
  marisa: {
    presentacion: [
      'Marisa Lentejuela, de gira por todas las fiestas… ¡y por vuestras piedras!',
      'Marisa Lentejuela, voz de la orquesta Los Luceros. ¡Y hoy, a cartas!',
      'Soy Marisa. Canto en verbenas y gano en bares.',
      'Marisa Lentejuela. ¡Que suene la música, que empieza el espectáculo!',
    ],
    mus: [
      '¡Mus, cariño, que esta canción no me gusta!',
      '¡Mus! Cambio de repertorio.',
      'Mus, que desafina.',
      '¡Mus! Otra canción, maestro.',
    ],
    noHayMus: [
      '¡Me quedo con este repertorio!',
      '¡No hay mus! Éxito asegurado.',
      '¡Quietos, que esta la canto yo!',
      'No hay mus. Esto es un bis.',
    ],
    descarte: ['{N}, cariño.', 'Fuera {n}, que desafinan.', 'Me cambio {n} notas.', '¡{N} nuevas, por favor!'],
    paso: ['Paso, cielo.', 'Paso. Pausa dramática.', 'Paso… por ahora.', 'Paso, que me reservo.'],
    envido: [
      'Envido… ¡y que suene la orquesta!',
      '¡Envido, cariño!',
      'Envido {n}, con estribillo.',
      'Envido, y a bailar.',
    ],
    envidoMas: [
      '¡{N} más! ¡Y subimos el tono!',
      '{N} más, con vibrato.',
      '¡{N} más, bravo!',
      '{N} más, y otra vuelta.',
    ],
    quiero: ['¡Quiero! ¡Que suene!', 'Quiero, mi amor.', '¡Lo quiero, olé!', 'Quiero, y con aplausos.'],
    noQuiero: [
      'Paso de este bolero.',
      'No quiero, cariño.',
      'Ay, no. Esta no me la sé.',
      'No quiero. Me duele la garganta.',
    ],
    ordago: [
      '¡Órdago! ¡Y el que no quiera, que baile!',
      '¡ÓRDAGO! ¡Gran final!',
      '¡Órdago, y fuegos artificiales!',
      '¡Órdago! ¡Telón!',
    ],
    quieroOrdago: [
      '¡Quiero! ¡Que se encienda el escenario!',
      '¡Lo quiero, cariño!',
      '¡Quiero! ¡Momento cumbre!',
      '¡Quiero, y redoble!',
    ],
    paresSi: ['¡Pares sí!', 'Pares, en armonía.', '¡Sí, pares!', 'Pares, a dúo.'],
    paresNo: ['Pares no, ay.', 'No, cielo.', 'Pares no. Canto sola.', 'Ni un dúo.'],
    juegoSi: ['¡Juego sí!', 'Juego, cariño.', '¡Tengo juego!', 'Juego sí, y afinado.'],
    juegoNo: ['Juego no.', 'No llego, cielo.', 'Juego no, qué pena.', 'Sin juego. Desafino.'],
    ganaLance: ['¡Bravo, bravo!', '¡Olé!', '¡Aplausos, por favor!', '¡Qué exitazo!'],
    pierdeLance: ['Ay, qué gallo.', 'Se me ha ido la voz.', 'Desafinado.', 'Esto no estaba en el ensayo.'],
    senaCazada: [
      '¡Uy, uy, uy! Eso es seña.',
      '¡Te he visto, pillín!',
      '¡Menudo teatro haces!',
      '¡Seña! Y mal actuada.',
    ],
    lePillanSena: [
      '¡Es mi gesto artístico!',
      'Estaba calentando la voz.',
      '¡Ensayaba una mueca!',
      'Es que me emociono.',
    ],
    adentro: [
      '¡Adentro! ¡Que suene la charanga!',
      '¡Adentro, y a por el bis!',
      '¡Adentro, cariño!',
      '¡Adentro! ¡Último estribillo!',
    ],
    victoria: [
      '¡Gracias, sois un público maravilloso!',
      '¡Bravo! ¡Otra, otra!',
      '¡Éxito total de la gira!',
      '¡Esta noche, fiesta!',
    ],
    derrota: [
      'Mi público no me merece.',
      'Ay, qué mal final.',
      'Suspendida la función.',
      'Mañana, mejor. Hoy no tenía voz.',
    ],
    idle: [
      'Tarareo mientras piensan…',
      'El sábado canto en la verbena.',
      '¡Nicanor, un agua con limón!',
      'Esta laca me tiene loca.',
    ],
  },
  julian: {
    presentacion: [
      'Julián, alguacil. Se hace saber que esta partida es mía.',
      'Julián, alguacil de Villaenvite. Aquí se juega según el reglamento.',
      'Se hace saber: Julián, alguacil, se presenta al campeonato.',
      'Julián. Pregonero, alguacil y jugador con licencia.',
    ],
    mus: ['Mus, conforme al reglamento.', 'Mus. Artículo tercero.', 'Mus, según bando.', 'Mus, que conste en acta.'],
    noHayMus: [
      'No hay mus. Queda cerrada la ventanilla.',
      'No hay mus. Por orden.',
      'Se corta el mus. Que conste.',
      'No hay mus. Resolución firme.',
    ],
    descarte: ['{N}. Que conste.', 'Me descarto de {n}.', '{N}, según reglamento.', 'Deposito {n}.'],
    paso: ['Paso. Que conste.', 'Paso, por ahora.', 'Paso, en tiempo y forma.', 'Paso. Sin alegaciones.'],
    envido: [
      'Se envidan dos piedras. Que conste.',
      'Envido, por orden.',
      'Envido {n}. Así se hace saber.',
      'Envido, según bando.',
    ],
    envidoMas: [
      '{N} más. Por la autoridad.',
      '{N} más. Recurso de alzada.',
      'Subo {n}. Que conste.',
      '{N} más, en firme.',
    ],
    quiero: ['Quiero. Se admite a trámite.', 'Quiero. Que conste.', 'Quiero, conforme.', 'Se acepta. Quiero.'],
    noQuiero: [
      'No quiero. Recurriré.',
      'No quiero. Presento alegación.',
      'Desestimado. No quiero.',
      'No quiero. Fuera de plazo.',
    ],
    ordago: [
      '¡Órdago, por orden de la autoridad!',
      '¡Órdago! ¡Se hace saber!',
      '¡Órdago, con sello municipal!',
      '¡Órdago! ¡Y que suene la corneta!',
    ],
    quieroOrdago: [
      'Quiero. Se levanta acta.',
      'Quiero. Que se destape.',
      'Quiero. Sentencia firme.',
      'Quiero. Proceda.',
    ],
    paresSi: ['Pares sí, que conste.', 'Declaro pares.', 'Pares, en regla.', 'Sí, pares.'],
    paresNo: ['Pares no.', 'Declaro que no.', 'Sin pares. Que conste.', 'Pares no, lamentablemente.'],
    juegoSi: ['Juego sí, que conste.', 'Declaro juego.', 'Tengo juego, en regla.', 'Juego sí.'],
    juegoNo: ['Juego no.', 'Declaro que no llego.', 'Sin juego.', 'Juego no. Que conste.'],
    ganaLance: ['Se hace saber: ganado.', 'Ganado en buena ley.', 'Queda registrado.', 'Conforme al reglamento.'],
    pierdeLance: ['Protesto.', 'Esto va al juzgado.', 'Irregularidad manifiesta.', 'Recurriré.'],
    senaCazada: [
      '¡Seña! Queda anotada.',
      'Eso es seña. Multa.',
      'Seña vista. Consta en acta.',
      '¡Alto! Eso ha sido seña.',
    ],
    lePillanSena: ['Protesto. No era seña.', 'Era un gesto oficial.', 'Me picaba el bigote.', 'Exijo pruebas.'],
    adentro: [
      '¡Adentro, por orden!',
      'Adentro. Se hace saber.',
      '¡Adentro, vecinos!',
      'Adentro. Que suene la corneta.',
    ],
    victoria: [
      'Se levanta acta: hemos ganado.',
      'Queda proclamado: ganamos.',
      'Victoria en firme.',
      'Se hace saber: campeones.',
    ],
    derrota: [
      'Presentaré recurso.',
      'Esto no ha terminado. Recurriré.',
      'Irregularidades por todas partes.',
      'Lo llevo al pleno.',
    ],
    idle: [
      'Mañana hay bando de las fiestas.',
      'Nicanor, esa terraza no tiene permiso.',
      'Aquí está prohibido fumar desde el 88.',
      'Silencio en la sala.',
    ],
  },
};

/** Nicanor, el camarero. */
export const LINEAS_NICANOR = [
  '¡Marchando dos cafés!',
  'Aquí se juega, pero se consume.',
  '¡Adentro, que se enfría la tortilla!',
  '¿Otra ronda? La casa no invita.',
  'Cuidado con el tapete, que es nuevo.',
  '¡Esa caña, que se calienta!',
  'Hoy hay callos, el que avisa…',
  'A ver si ponéis algo en la hucha.',
];

export const LINEAS_NICANOR_EVENTO = {
  victoria: ['¡Esto hay que celebrarlo! ¡Invita la casa!', '¡Ronda para la mesa!'],
  torneo: ['¡Campeones! ¡Un jamón y una placa!'],
};

export interface Cameo {
  id: 'cartero' | 'vecina' | 'turista' | 'chaval' | 'perro';
  nombre: string;
  lineas: string[];
}

export const CAMEOS: Cameo[] = [
  {
    id: 'cartero',
    nombre: 'El cartero',
    lineas: [
      '¿Don Anselmo? Traigo un certificado… bueno, luego vuelvo.',
      'Carta para el bar… ¡ah, no, que es de la otra calle!',
      '¡Nicanor, la factura de la luz! Te la dejo aquí.',
    ],
  },
  {
    id: 'vecina',
    nombre: 'La vecina',
    lineas: [
      '¿Alguien ha visto a mi Paco? …Ya veo que aquí no.',
      '¡Como esté aquí mi marido…! Ah, no está.',
      'Que digo yo que si habéis visto al gato.',
    ],
  },
  {
    id: 'turista',
    nombre: 'Un turista',
    lineas: [
      'Perdonen, ¿la ermita románica?',
      'Disculpen, ¿aquí se puede comer?',
      '¿Esto es Villaenvite? En el mapa parecía más grande.',
    ],
  },
  {
    id: 'chaval',
    nombre: 'Un chaval',
    lineas: [
      '¡Nicanor, un polo de limón!',
      '¿Me da un helado de corte?',
      '¡Un flash de fresa, que me lo ha dicho mi madre!',
    ],
  },
  { id: 'perro', nombre: 'El perro del bar', lineas: ['¡Guau!', '¡Guau, guau!', 'Grrr… ¡guau!'] },
];

/** Respuestas de la mesa a algunos cameos (el turista pregunta y alguien grita «¡Envido!»). */
export const RESPUESTAS_CAMEO: Partial<Record<Cameo['id'], string[]>> = {
  turista: ['¡Envido!', '¡Órdago!', '¡Mus!'],
};
export const DESPEDIDA_CAMEO: Partial<Record<Cameo['id'], string[]>> = {
  turista: ['…Vale, gracias.', '…Ya pregunto en otro sitio.'],
};
