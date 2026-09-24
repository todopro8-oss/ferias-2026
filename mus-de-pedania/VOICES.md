# VOICES.md — guion de voces de Mus de Pedanía

Todas las líneas que dicen los personajes, con el archivo que hay que grabar para cada una.
Mientras falte un archivo, el juego usa el balbuceo sintético (`src/audio/babble.ts`).
Este archivo se genera con `npm run voices:manifest` a partir de `src/data/lines.es.ts`: no lo edites a mano.

## Guía de grabación

- **Formato:** mono, 22 050 Hz, exportado a Ogg Vorbis (`.ogg`). También valen `.wav` y `.mp3`.
- **Nivel:** normalizado a **−3 dBFS** de pico. Sin compresión exagerada.
- **Silencio:** 0,2 s de silencio al principio y al final de cada toma.
- **Ruta:** `assets/voices/<personaje>/<evento>_<n>.ogg`, con `n` = número de la variante (1, 2, 3…).
- **Cantidades:** las líneas con `{n}` se graban diciendo «dos» (o «Dos» si es `{N}`). El juego sólo
  usa esa toma cuando la cantidad es dos; con otras cantidades, balbucea.
- **Actuación:** cada personaje tiene su voz (abajo). Retranca y costumbrismo, sin imitar a nadie real.
- **Después de grabar:** ejecuta `npm run voices:manifest` para que el juego encuentre los archivos.

Voces grabadas encontradas: **0**.

## Don Anselmo (`anselmo`)

Boticario jubilado. Voz: grave y lenta.

| Evento | Archivo | Línea | Grabada |
|---|---|---|---|
| presentacion | `assets/voices/anselmo/presentacion_1.ogg` | Anselmo, boticario. Aquí se juega con receta. | — |
| presentacion | `assets/voices/anselmo/presentacion_2.ogg` | Don Anselmo, cuarenta años de farmacia. Sé leer letra de médico y caras de tahúr. | — |
| presentacion | `assets/voices/anselmo/presentacion_3.ogg` | Boticario jubilado. Si pierden, tengo algo para el disgusto. | — |
| presentacion | `assets/voices/anselmo/presentacion_4.ogg` | Anselmo. Vengo a dispensar piedras, con posología estricta. | — |
| mus | `assets/voices/anselmo/mus_1.ogg` | Mus, si no es molestia. | — |
| mus | `assets/voices/anselmo/mus_2.ogg` | Mus. Hay que cambiar el tratamiento. | — |
| mus | `assets/voices/anselmo/mus_3.ogg` | Mus. Esto no hay quien lo trague. | — |
| mus | `assets/voices/anselmo/mus_4.ogg` | Mus, por prescripción facultativa. | — |
| noHayMus | `assets/voices/anselmo/noHayMus_1.ogg` | Me quedo como estoy. Posología correcta. | — |
| noHayMus | `assets/voices/anselmo/noHayMus_2.ogg` | No hay mus. El paciente está estable. | — |
| noHayMus | `assets/voices/anselmo/noHayMus_3.ogg` | No hay mus. Dosis ajustada. | — |
| noHayMus | `assets/voices/anselmo/noHayMus_4.ogg` | Así se queda. No se toca la fórmula. | — |
| descarte | `assets/voices/anselmo/descarte_1.ogg` | Me descarto de {n}. Sin receta. | — |
| descarte | `assets/voices/anselmo/descarte_2.ogg` | {N}, por favor. | — |
| descarte | `assets/voices/anselmo/descarte_3.ogg` | Retiro {n}. Caducadas. | — |
| descarte | `assets/voices/anselmo/descarte_4.ogg` | Deme {n}, genéricas si puede. | — |
| paso | `assets/voices/anselmo/paso_1.ogg` | Paso. En ayunas. | — |
| paso | `assets/voices/anselmo/paso_2.ogg` | Paso, con cautela. | — |
| paso | `assets/voices/anselmo/paso_3.ogg` | Paso. Reposo relativo. | — |
| paso | `assets/voices/anselmo/paso_4.ogg` | Paso. Ya veremos en la revisión. | — |
| envido | `assets/voices/anselmo/envido_1.ogg` | Dos piedras. Dosis mínima. | — |
| envido | `assets/voices/anselmo/envido_2.ogg` | Envido. Una toma. | — |
| envido | `assets/voices/anselmo/envido_3.ogg` | Envido, sin efectos secundarios. | — |
| envido | `assets/voices/anselmo/envido_4.ogg` | Envido {n}. Cada ocho horas. | — |
| envidoMas | `assets/voices/anselmo/envidoMas_1.ogg` | {N} más. Refuerzo la dosis. | — |
| envidoMas | `assets/voices/anselmo/envidoMas_2.ogg` | Subo {n}. Tratamiento de choque. | — |
| envidoMas | `assets/voices/anselmo/envidoMas_3.ogg` | {N} más, en jarabe. | — |
| envidoMas | `assets/voices/anselmo/envidoMas_4.ogg` | {N} más. Lo dice el prospecto. | — |
| quiero | `assets/voices/anselmo/quiero_1.ogg` | Quiero. Bajo mi responsabilidad. | — |
| quiero | `assets/voices/anselmo/quiero_2.ogg` | Quiero. Diagnóstico claro. | — |
| quiero | `assets/voices/anselmo/quiero_3.ogg` | Quiero, con receta. | — |
| quiero | `assets/voices/anselmo/quiero_4.ogg` | Lo quiero. Me lo apunto en la ficha. | — |
| noQuiero | `assets/voices/anselmo/noQuiero_1.ogg` | No quiero. Contraindicado. | — |
| noQuiero | `assets/voices/anselmo/noQuiero_2.ogg` | No quiero. Alérgico a eso. | — |
| noQuiero | `assets/voices/anselmo/noQuiero_3.ogg` | No. Me produce ardores. | — |
| noQuiero | `assets/voices/anselmo/noQuiero_4.ogg` | No quiero. Consulte a su médico. | — |
| ordago | `assets/voices/anselmo/ordago_1.ogg` | Órdago. Y sin prospecto. | — |
| ordago | `assets/voices/anselmo/ordago_2.ogg` | Órdago. Dosis letal. | — |
| ordago | `assets/voices/anselmo/ordago_3.ogg` | Órdago. Esto ya es cirugía. | — |
| ordago | `assets/voices/anselmo/ordago_4.ogg` | Órdago, y que Dios reparta suerte. | — |
| quieroOrdago | `assets/voices/anselmo/quieroOrdago_1.ogg` | Lo quiero. Que se abran los frascos. | — |
| quieroOrdago | `assets/voices/anselmo/quieroOrdago_2.ogg` | Quiero. Sale la verdad clínica. | — |
| quieroOrdago | `assets/voices/anselmo/quieroOrdago_3.ogg` | Quiero. A ver ese análisis. | — |
| quieroOrdago | `assets/voices/anselmo/quieroOrdago_4.ogg` | Veamos esas radiografías. | — |
| paresSi | `assets/voices/anselmo/paresSi_1.ogg` | Pares sí, con prescripción. | — |
| paresSi | `assets/voices/anselmo/paresSi_2.ogg` | Sí, pares. Positivo. | — |
| paresSi | `assets/voices/anselmo/paresSi_3.ogg` | Tengo pares, confirmado. | — |
| paresSi | `assets/voices/anselmo/paresSi_4.ogg` | Pares, según la analítica. | — |
| paresNo | `assets/voices/anselmo/paresNo_1.ogg` | Pares no. Negativo. | — |
| paresNo | `assets/voices/anselmo/paresNo_2.ogg` | No, nada. Limpio. | — |
| paresNo | `assets/voices/anselmo/paresNo_3.ogg` | Sin pares. Resultado normal. | — |
| paresNo | `assets/voices/anselmo/paresNo_4.ogg` | Nada de pares, por desgracia. | — |
| juegoSi | `assets/voices/anselmo/juegoSi_1.ogg` | Juego sí. Tensión alta. | — |
| juegoSi | `assets/voices/anselmo/juegoSi_2.ogg` | Tengo juego, confirmado. | — |
| juegoSi | `assets/voices/anselmo/juegoSi_3.ogg` | Juego, según la báscula. | — |
| juegoSi | `assets/voices/anselmo/juegoSi_4.ogg` | Sí hay juego. Fiebre. | — |
| juegoNo | `assets/voices/anselmo/juegoNo_1.ogg` | Juego no. Glucosa baja. | — |
| juegoNo | `assets/voices/anselmo/juegoNo_2.ogg` | No llego. Anemia. | — |
| juegoNo | `assets/voices/anselmo/juegoNo_3.ogg` | Sin juego. Hay que reforzar. | — |
| juegoNo | `assets/voices/anselmo/juegoNo_4.ogg` | Juego no. Me falta hierro. | — |
| ganaLance | `assets/voices/anselmo/ganaLance_1.ogg` | Lo que yo decía: dosis justa. | — |
| ganaLance | `assets/voices/anselmo/ganaLance_2.ogg` | Tratamiento eficaz. | — |
| ganaLance | `assets/voices/anselmo/ganaLance_3.ogg` | Mano de santo. | — |
| ganaLance | `assets/voices/anselmo/ganaLance_4.ogg` | Remedio de rebotica. | — |
| pierdeLance | `assets/voices/anselmo/pierdeLance_1.ogg` | Efecto secundario imprevisto. | — |
| pierdeLance | `assets/voices/anselmo/pierdeLance_2.ogg` | Mal diagnóstico, lo reconozco. | — |
| pierdeLance | `assets/voices/anselmo/pierdeLance_3.ogg` | Hay que cambiar de pastillas. | — |
| pierdeLance | `assets/voices/anselmo/pierdeLance_4.ogg` | Esto no venía en el prospecto. | — |
| senaCazada | `assets/voices/anselmo/senaCazada_1.ogg` | Eso ha sido seña, caballero. | — |
| senaCazada | `assets/voices/anselmo/senaCazada_2.ogg` | Le he visto el tic. Anotado. | — |
| senaCazada | `assets/voices/anselmo/senaCazada_3.ogg` | Esa mueca la tengo fichada. | — |
| senaCazada | `assets/voices/anselmo/senaCazada_4.ogg` | Seña vista. No soy ciego. | — |
| lePillanSena | `assets/voices/anselmo/lePillanSena_1.ogg` | Era un tic nervioso, nada más. | — |
| lePillanSena | `assets/voices/anselmo/lePillanSena_2.ogg` | Es la dentadura, que me baila. | — |
| lePillanSena | `assets/voices/anselmo/lePillanSena_3.ogg` | Un leve espasmo, sin importancia. | — |
| lePillanSena | `assets/voices/anselmo/lePillanSena_4.ogg` | No era nada. Una alergia. | — |
| adentro | `assets/voices/anselmo/adentro_1.ogg` | ¡Adentro! Ya huele a victoria. | — |
| adentro | `assets/voices/anselmo/adentro_2.ogg` | Adentro. El paciente mejora. | — |
| adentro | `assets/voices/anselmo/adentro_3.ogg` | ¡Adentro, señores! | — |
| adentro | `assets/voices/anselmo/adentro_4.ogg` | Adentro. Alta médica cerca. | — |
| victoria | `assets/voices/anselmo/victoria_1.ogg` | Una cucharada cada ocho horas, lo que yo decía. | — |
| victoria | `assets/voices/anselmo/victoria_2.ogg` | Curados. Pasen por caja. | — |
| victoria | `assets/voices/anselmo/victoria_3.ogg` | Tratamiento completado con éxito. | — |
| victoria | `assets/voices/anselmo/victoria_4.ogg` | Esto se lo receto a cualquiera. | — |
| derrota | `assets/voices/anselmo/derrota_1.ogg` | Habrá que pedir segunda opinión. | — |
| derrota | `assets/voices/anselmo/derrota_2.ogg` | El tratamiento ha fracasado. | — |
| derrota | `assets/voices/anselmo/derrota_3.ogg` | Me voy a tomar una tila. | — |
| derrota | `assets/voices/anselmo/derrota_4.ogg` | Ni el mejor jarabe arregla esto. | — |
| idle | `assets/voices/anselmo/idle_1.ogg` | Aquí antes había botica, ¿saben? | — |
| idle | `assets/voices/anselmo/idle_2.ogg` | Nicanor, un descafeinado de sobre. | — |
| idle | `assets/voices/anselmo/idle_3.ogg` | Esta tos no me gusta nada. | — |
| idle | `assets/voices/anselmo/idle_4.ogg` | Con calma, que no hay prisa. | — |

## La Rufi (`rufi`)

Peluquera. Voz: aguda y rápida.

| Evento | Archivo | Línea | Grabada |
|---|---|---|---|
| presentacion | `assets/voices/rufi/presentacion_1.ogg` | Soy la Rufi, y a mí no me peina nadie dos veces. | — |
| presentacion | `assets/voices/rufi/presentacion_2.ogg` | La Rufi, peluquería Rufi. Corto, marco y gano. | — |
| presentacion | `assets/voices/rufi/presentacion_3.ogg` | Rufi, para servirte. Luego en la pelu me contáis cómo perdisteis. | — |
| presentacion | `assets/voices/rufi/presentacion_4.ogg` | Rufi. Traigo la laca puesta y la lengua suelta. | — |
| mus | `assets/voices/rufi/mus_1.ogg` | ¡Mus, que tienen las puntas abiertas! | — |
| mus | `assets/voices/rufi/mus_2.ogg` | ¡Mus! Esto hay que lavarlo y marcarlo. | — |
| mus | `assets/voices/rufi/mus_3.ogg` | Mus, cariño, que vengo de rulos. | — |
| mus | `assets/voices/rufi/mus_4.ogg` | ¡Mus! Estas cartas pide tinte. | — |
| noHayMus | `assets/voices/rufi/noHayMus_1.ogg` | ¡Quieto todo el mundo, que me quedo! | — |
| noHayMus | `assets/voices/rufi/noHayMus_2.ogg` | ¡No hay mus! Peinado perfecto. | — |
| noHayMus | `assets/voices/rufi/noHayMus_3.ogg` | Ni lo toques, que está de peluquería. | — |
| noHayMus | `assets/voices/rufi/noHayMus_4.ogg` | No hay mus, bonito. Como el secador. | — |
| descarte | `assets/voices/rufi/descarte_1.ogg` | Fuera {n}, a la basura. | — |
| descarte | `assets/voices/rufi/descarte_2.ogg` | {N}, rapidito. | — |
| descarte | `assets/voices/rufi/descarte_3.ogg` | Me corto {n}. Las puntas. | — |
| descarte | `assets/voices/rufi/descarte_4.ogg` | Dame {n} bonitas. | — |
| paso | `assets/voices/rufi/paso_1.ogg` | Paso, de momento. | — |
| paso | `assets/voices/rufi/paso_2.ogg` | Paso, pero te estoy mirando. | — |
| paso | `assets/voices/rufi/paso_3.ogg` | Paso, cariño. | — |
| paso | `assets/voices/rufi/paso_4.ogg` | Paso. Que hable el de al lado. | — |
| envido | `assets/voices/rufi/envido_1.ogg` | Envido, y no me mires así. | — |
| envido | `assets/voices/rufi/envido_2.ogg` | ¡Envido, que me aburro! | — |
| envido | `assets/voices/rufi/envido_3.ogg` | Envido {n}, con permanente. | — |
| envido | `assets/voices/rufi/envido_4.ogg` | Envido, y tú a callar. | — |
| envidoMas | `assets/voices/rufi/envidoMas_1.ogg` | ¡{N} más! Toma mechas. | — |
| envidoMas | `assets/voices/rufi/envidoMas_2.ogg` | {N} más, y no me repliques. | — |
| envidoMas | `assets/voices/rufi/envidoMas_3.ogg` | ¡Pues {n} más, hombre ya! | — |
| envidoMas | `assets/voices/rufi/envidoMas_4.ogg` | {N} más. Te lo marco a cepillo. | — |
| quiero | `assets/voices/rufi/quiero_1.ogg` | ¡Quiero! Y sin rechistar. | — |
| quiero | `assets/voices/rufi/quiero_2.ogg` | Quiero, bonito. | — |
| quiero | `assets/voices/rufi/quiero_3.ogg` | Quiero. Que te veo venir. | — |
| quiero | `assets/voices/rufi/quiero_4.ogg` | ¡Anda, quiero! | — |
| noQuiero | `assets/voices/rufi/noQuiero_1.ogg` | Ni loca, bonito. | — |
| noQuiero | `assets/voices/rufi/noQuiero_2.ogg` | No quiero. Hoy no me peino. | — |
| noQuiero | `assets/voices/rufi/noQuiero_3.ogg` | ¡Quita, quita! No quiero. | — |
| noQuiero | `assets/voices/rufi/noQuiero_4.ogg` | No quiero, que me estropeas el tinte. | — |
| ordago | `assets/voices/rufi/ordago_1.ogg` | ¡Órdago, y luego me lo contáis en la pelu! | — |
| ordago | `assets/voices/rufi/ordago_2.ogg` | ¡Órdago! Y a secador. | — |
| ordago | `assets/voices/rufi/ordago_3.ogg` | ¡Órdago, que se me rizan las pestañas! | — |
| ordago | `assets/voices/rufi/ordago_4.ogg` | ¡ÓRDAGO! ¿Qué pasa? | — |
| quieroOrdago | `assets/voices/rufi/quieroOrdago_1.ogg` | ¡Lo quiero! Destapad. | — |
| quieroOrdago | `assets/voices/rufi/quieroOrdago_2.ogg` | ¡Quiero! Que se vea ya. | — |
| quieroOrdago | `assets/voices/rufi/quieroOrdago_3.ogg` | Quiero, y como me engañes… | — |
| quieroOrdago | `assets/voices/rufi/quieroOrdago_4.ogg` | ¡Venga, a ver esas cartas! | — |
| paresSi | `assets/voices/rufi/paresSi_1.ogg` | ¡Pares sí! | — |
| paresSi | `assets/voices/rufi/paresSi_2.ogg` | Pares, cariño. | — |
| paresSi | `assets/voices/rufi/paresSi_3.ogg` | Sí, sí, pares. | — |
| paresSi | `assets/voices/rufi/paresSi_4.ogg` | Pares tengo, como los pendientes. | — |
| paresNo | `assets/voices/rufi/paresNo_1.ogg` | Pares no. Qué rabia. | — |
| paresNo | `assets/voices/rufi/paresNo_2.ogg` | No, nada. | — |
| paresNo | `assets/voices/rufi/paresNo_3.ogg` | Pares no, bonito. | — |
| paresNo | `assets/voices/rufi/paresNo_4.ogg` | Ni una pareja. Como mi prima. | — |
| juegoSi | `assets/voices/rufi/juegoSi_1.ogg` | ¡Juego sí! | — |
| juegoSi | `assets/voices/rufi/juegoSi_2.ogg` | Juego, y bien peinado. | — |
| juegoSi | `assets/voices/rufi/juegoSi_3.ogg` | Tengo juego, sí. | — |
| juegoSi | `assets/voices/rufi/juegoSi_4.ogg` | Juego sí, ¿algún problema? | — |
| juegoNo | `assets/voices/rufi/juegoNo_1.ogg` | Juego no. Qué asco. | — |
| juegoNo | `assets/voices/rufi/juegoNo_2.ogg` | No llego, no. | — |
| juegoNo | `assets/voices/rufi/juegoNo_3.ogg` | Juego no, cariño. | — |
| juegoNo | `assets/voices/rufi/juegoNo_4.ogg` | Sin juego. Hoy no es mi día. | — |
| ganaLance | `assets/voices/rufi/ganaLance_1.ogg` | ¡Toma ya! Lavar y marcar. | — |
| ganaLance | `assets/voices/rufi/ganaLance_2.ogg` | ¡Ja! ¿Quién es la mejor? | — |
| ganaLance | `assets/voices/rufi/ganaLance_3.ogg` | ¡Para la saca! | — |
| ganaLance | `assets/voices/rufi/ganaLance_4.ogg` | Eso me lo apunto en la pelu. | — |
| pierdeLance | `assets/voices/rufi/pierdeLance_1.ogg` | ¡Hala! Qué mala suerte. | — |
| pierdeLance | `assets/voices/rufi/pierdeLance_2.ogg` | Esto no me lo creo. | — |
| pierdeLance | `assets/voices/rufi/pierdeLance_3.ogg` | ¡Tramposos! | — |
| pierdeLance | `assets/voices/rufi/pierdeLance_4.ogg` | Pues vaya pelo me ha quedado. | — |
| senaCazada | `assets/voices/rufi/senaCazada_1.ogg` | ¡Eso ha sido seña! Te he visto. | — |
| senaCazada | `assets/voices/rufi/senaCazada_2.ogg` | ¡Uy, esa ceja! Seña. | — |
| senaCazada | `assets/voices/rufi/senaCazada_3.ogg` | ¡Ay, que se hacen señas! | — |
| senaCazada | `assets/voices/rufi/senaCazada_4.ogg` | A mí no me la pegas, guapo. | — |
| lePillanSena | `assets/voices/rufi/lePillanSena_1.ogg` | ¿Yo? Es el chicle. | — |
| lePillanSena | `assets/voices/rufi/lePillanSena_2.ogg` | ¡Qué va! Tengo un pelo en el ojo. | — |
| lePillanSena | `assets/voices/rufi/lePillanSena_3.ogg` | Era un tic, bonito. | — |
| lePillanSena | `assets/voices/rufi/lePillanSena_4.ogg` | Estaba bostezando, ¿vale? | — |
| adentro | `assets/voices/rufi/adentro_1.ogg` | ¡Adentro, que nos vamos! | — |
| adentro | `assets/voices/rufi/adentro_2.ogg` | ¡Adentro! ¡Que corra la voz! | — |
| adentro | `assets/voices/rufi/adentro_3.ogg` | ¡Adentro, chicos! | — |
| adentro | `assets/voices/rufi/adentro_4.ogg` | Adentro, y ya casi al tinte. | — |
| victoria | `assets/voices/rufi/victoria_1.ogg` | Lavar, marcar y ganar. | — |
| victoria | `assets/voices/rufi/victoria_2.ogg` | ¡Os he dejado como una permanente! | — |
| victoria | `assets/voices/rufi/victoria_3.ogg` | ¡Esto lo cuento mañana en la pelu! | — |
| victoria | `assets/voices/rufi/victoria_4.ogg` | ¡Ganamos! ¡Invito a laca! | — |
| derrota | `assets/voices/rufi/derrota_1.ogg` | ¡Me voy a quejar a la comarca! | — |
| derrota | `assets/voices/rufi/derrota_2.ogg` | Qué rabia me da… | — |
| derrota | `assets/voices/rufi/derrota_3.ogg` | Esto ha sido un robo. | — |
| derrota | `assets/voices/rufi/derrota_4.ogg` | Pues a mí no me peina nadie más. | — |
| idle | `assets/voices/rufi/idle_1.ogg` | ¿Os habéis enterado de lo de la Puri? | — |
| idle | `assets/voices/rufi/idle_2.ogg` | Esta semana, mechas a mitad de precio. | — |
| idle | `assets/voices/rufi/idle_3.ogg` | Nicanor, un cortado, ¡y con prisa! | — |
| idle | `assets/voices/rufi/idle_4.ogg` | Uf, qué calor hace aquí. | — |

## El Canijo (`canijo`)

Camionero de dos metros. Voz: ronca y fuerte.

| Evento | Archivo | Línea | Grabada |
|---|---|---|---|
| presentacion | `assets/voices/canijo/presentacion_1.ogg` | Me llaman el Canijo. Pregúntame por qué. | — |
| presentacion | `assets/voices/canijo/presentacion_2.ogg` | El Canijo. Dos metros de camionero y cero paciencia. | — |
| presentacion | `assets/voices/canijo/presentacion_3.ogg` | Canijo. Mañana tengo ruta, así que rapidito. | — |
| presentacion | `assets/voices/canijo/presentacion_4.ogg` | Soy el Canijo. Aquí se descarga y se cobra. | — |
| mus | `assets/voices/canijo/mus_1.ogg` | Mus. Y rapidito, que tengo ruta. | — |
| mus | `assets/voices/canijo/mus_2.ogg` | Mus. Cambio de marcha. | — |
| mus | `assets/voices/canijo/mus_3.ogg` | Mus, y sin paradas. | — |
| mus | `assets/voices/canijo/mus_4.ogg` | Mus. Esto no tira. | — |
| noHayMus | `assets/voices/canijo/noHayMus_1.ogg` | Aquí no se cambia nada. | — |
| noHayMus | `assets/voices/canijo/noHayMus_2.ogg` | No hay mus. Carga completa. | — |
| noHayMus | `assets/voices/canijo/noHayMus_3.ogg` | Quieto. Así va bien. | — |
| noHayMus | `assets/voices/canijo/noHayMus_4.ogg` | No hay mus. En cuarta. | — |
| descarte | `assets/voices/canijo/descarte_1.ogg` | {N}. | — |
| descarte | `assets/voices/canijo/descarte_2.ogg` | Fuera {n}. | — |
| descarte | `assets/voices/canijo/descarte_3.ogg` | Descargo {n}. | — |
| descarte | `assets/voices/canijo/descarte_4.ogg` | {N}, y arreando. | — |
| paso | `assets/voices/canijo/paso_1.ogg` | Paso. | — |
| paso | `assets/voices/canijo/paso_2.ogg` | Paso. Por ahora. | — |
| paso | `assets/voices/canijo/paso_3.ogg` | Paso, en punto muerto. | — |
| paso | `assets/voices/canijo/paso_4.ogg` | Paso. Pisa tú. | — |
| envido | `assets/voices/canijo/envido_1.ogg` | Envido. Tres. Cuatro. Lo que sea. | — |
| envido | `assets/voices/canijo/envido_2.ogg` | Envido. | — |
| envido | `assets/voices/canijo/envido_3.ogg` | Envido {n}. Sin frenos. | — |
| envido | `assets/voices/canijo/envido_4.ogg` | Envido, y pisa. | — |
| envidoMas | `assets/voices/canijo/envidoMas_1.ogg` | {N} más. | — |
| envidoMas | `assets/voices/canijo/envidoMas_2.ogg` | {N} más. Y acelero. | — |
| envidoMas | `assets/voices/canijo/envidoMas_3.ogg` | Subo {n}. A tope. | — |
| envidoMas | `assets/voices/canijo/envidoMas_4.ogg` | {N} más, que no hay radar. | — |
| quiero | `assets/voices/canijo/quiero_1.ogg` | Quiero. | — |
| quiero | `assets/voices/canijo/quiero_2.ogg` | Venga. Quiero. | — |
| quiero | `assets/voices/canijo/quiero_3.ogg` | Quiero. A ver qué tienes. | — |
| quiero | `assets/voices/canijo/quiero_4.ogg` | Quiero, claro. | — |
| noQuiero | `assets/voices/canijo/noQuiero_1.ogg` | …Hoy no. | — |
| noQuiero | `assets/voices/canijo/noQuiero_2.ogg` | No quiero. | — |
| noQuiero | `assets/voices/canijo/noQuiero_3.ogg` | No. Paso de curvas. | — |
| noQuiero | `assets/voices/canijo/noQuiero_4.ogg` | Nah. No quiero. | — |
| ordago | `assets/voices/canijo/ordago_1.ogg` | ¡ÓRDAGO! Y a la cama. | — |
| ordago | `assets/voices/canijo/ordago_2.ogg` | ¡Órdago! ¡A tope! | — |
| ordago | `assets/voices/canijo/ordago_3.ogg` | ¡ÓRDAGO, hombre! | — |
| ordago | `assets/voices/canijo/ordago_4.ogg` | ¡Órdago! Sin frenos. | — |
| quieroOrdago | `assets/voices/canijo/quieroOrdago_1.ogg` | ¡Quiero! ¡Vamos! | — |
| quieroOrdago | `assets/voices/canijo/quieroOrdago_2.ogg` | ¡A por ello! Quiero. | — |
| quieroOrdago | `assets/voices/canijo/quieroOrdago_3.ogg` | Quiero. Al carajo. | — |
| quieroOrdago | `assets/voices/canijo/quieroOrdago_4.ogg` | ¡Venga ese órdago! | — |
| paresSi | `assets/voices/canijo/paresSi_1.ogg` | Pares. | — |
| paresSi | `assets/voices/canijo/paresSi_2.ogg` | Pares sí. | — |
| paresSi | `assets/voices/canijo/paresSi_3.ogg` | Tengo, sí. | — |
| paresSi | `assets/voices/canijo/paresSi_4.ogg` | Pares, y buenos. | — |
| paresNo | `assets/voices/canijo/paresNo_1.ogg` | No. | — |
| paresNo | `assets/voices/canijo/paresNo_2.ogg` | Pares no. | — |
| paresNo | `assets/voices/canijo/paresNo_3.ogg` | Nada. | — |
| paresNo | `assets/voices/canijo/paresNo_4.ogg` | Ni una. | — |
| juegoSi | `assets/voices/canijo/juegoSi_1.ogg` | Juego. | — |
| juegoSi | `assets/voices/canijo/juegoSi_2.ogg` | Juego sí. | — |
| juegoSi | `assets/voices/canijo/juegoSi_3.ogg` | Tengo juego. | — |
| juegoSi | `assets/voices/canijo/juegoSi_4.ogg` | Juego, y cargado. | — |
| juegoNo | `assets/voices/canijo/juegoNo_1.ogg` | No. | — |
| juegoNo | `assets/voices/canijo/juegoNo_2.ogg` | Juego no. | — |
| juegoNo | `assets/voices/canijo/juegoNo_3.ogg` | No llego. | — |
| juegoNo | `assets/voices/canijo/juegoNo_4.ogg` | Nada de juego. | — |
| ganaLance | `assets/voices/canijo/ganaLance_1.ogg` | ¡Toma! | — |
| ganaLance | `assets/voices/canijo/ganaLance_2.ogg` | ¡Ahí va! | — |
| ganaLance | `assets/voices/canijo/ganaLance_3.ogg` | Descargado. | — |
| ganaLance | `assets/voices/canijo/ganaLance_4.ogg` | ¡Pa dentro! | — |
| pierdeLance | `assets/voices/canijo/pierdeLance_1.ogg` | Me cago en… | — |
| pierdeLance | `assets/voices/canijo/pierdeLance_2.ogg` | Mecachis. | — |
| pierdeLance | `assets/voices/canijo/pierdeLance_3.ogg` | Pinchazo. | — |
| pierdeLance | `assets/voices/canijo/pierdeLance_4.ogg` | Bah. | — |
| senaCazada | `assets/voices/canijo/senaCazada_1.ogg` | ¡Eh! ¡Eso es seña! | — |
| senaCazada | `assets/voices/canijo/senaCazada_2.ogg` | Te he visto, listo. | — |
| senaCazada | `assets/voices/canijo/senaCazada_3.ogg` | ¡Señitas no, eh! | — |
| senaCazada | `assets/voices/canijo/senaCazada_4.ogg` | Vaya careto has puesto. | — |
| lePillanSena | `assets/voices/canijo/lePillanSena_1.ogg` | ¿Qué? Me pica. | — |
| lePillanSena | `assets/voices/canijo/lePillanSena_2.ogg` | Estoy cansado, es eso. | — |
| lePillanSena | `assets/voices/canijo/lePillanSena_3.ogg` | Es el sueño, hombre. | — |
| lePillanSena | `assets/voices/canijo/lePillanSena_4.ogg` | Me he tragado un mosquito. | — |
| adentro | `assets/voices/canijo/adentro_1.ogg` | ¡Adentro! | — |
| adentro | `assets/voices/canijo/adentro_2.ogg` | ¡ADENTRO, coño! | — |
| adentro | `assets/voices/canijo/adentro_3.ogg` | ¡Adentro, a puerto! | — |
| adentro | `assets/voices/canijo/adentro_4.ogg` | Adentro. Ya se ve la meta. | — |
| victoria | `assets/voices/canijo/victoria_1.ogg` | Descargado y entregado. | — |
| victoria | `assets/voices/canijo/victoria_2.ogg` | ¡A la cama con la victoria! | — |
| victoria | `assets/voices/canijo/victoria_3.ogg` | Otra ruta completada. | — |
| victoria | `assets/voices/canijo/victoria_4.ogg` | ¡Ganamos, hombre ya! | — |
| derrota | `assets/voices/canijo/derrota_1.ogg` | Bah. Mañana, más. | — |
| derrota | `assets/voices/canijo/derrota_2.ogg` | Me voy a la ruta. | — |
| derrota | `assets/voices/canijo/derrota_3.ogg` | Qué mal. Otra vez será. | — |
| derrota | `assets/voices/canijo/derrota_4.ogg` | Hoy no era el día. | — |
| idle | `assets/voices/canijo/idle_1.ogg` | Nicanor, una caña. | — |
| idle | `assets/voices/canijo/idle_2.ogg` | Mañana salgo a las cinco. | — |
| idle | `assets/voices/canijo/idle_3.ogg` | ¿Queda tortilla? | — |
| idle | `assets/voices/canijo/idle_4.ogg` | Venga, que se enfría. | — |

## Doña Pura (`pura`)

La del estanco. Voz: seca y nasal.

| Evento | Archivo | Línea | Grabada |
|---|---|---|---|
| presentacion | `assets/voices/pura/presentacion_1.ogg` | Pura, del estanco. Aquí no se fía. | — |
| presentacion | `assets/voices/pura/presentacion_2.ogg` | Doña Pura. Sellos, tabaco y piedras. Todo al contado. | — |
| presentacion | `assets/voices/pura/presentacion_3.ogg` | Pura, la del estanco. Veinte años de mus y ni un euro regalado. | — |
| presentacion | `assets/voices/pura/presentacion_4.ogg` | Soy Pura. Hoy cierro pronto: vengo a ganar. | — |
| mus | `assets/voices/pura/mus_1.ogg` | Mus. Pero cartas nuevas, ¿eh? | — |
| mus | `assets/voices/pura/mus_2.ogg` | Mus. Estas no valen ni un sello. | — |
| mus | `assets/voices/pura/mus_3.ogg` | Mus. Devuélvame el cambio. | — |
| mus | `assets/voices/pura/mus_4.ogg` | Mus, y cuéntelas bien. | — |
| noHayMus | `assets/voices/pura/noHayMus_1.ogg` | No hay mus. Cerrado por inventario. | — |
| noHayMus | `assets/voices/pura/noHayMus_2.ogg` | Me quedo. Mercancía buena. | — |
| noHayMus | `assets/voices/pura/noHayMus_3.ogg` | No hay mus. Caja cerrada. | — |
| noHayMus | `assets/voices/pura/noHayMus_4.ogg` | No se toca nada. | — |
| descarte | `assets/voices/pura/descarte_1.ogg` | {N}. Y no me dé las de antes. | — |
| descarte | `assets/voices/pura/descarte_2.ogg` | Me descarto de {n}. | — |
| descarte | `assets/voices/pura/descarte_3.ogg` | {N}, justas. | — |
| descarte | `assets/voices/pura/descarte_4.ogg` | Cambio {n}. Con recibo. | — |
| paso | `assets/voices/pura/paso_1.ogg` | Paso. | — |
| paso | `assets/voices/pura/paso_2.ogg` | Paso. Ni un céntimo. | — |
| paso | `assets/voices/pura/paso_3.ogg` | Paso, de momento. | — |
| paso | `assets/voices/pura/paso_4.ogg` | Paso. Esto no lo pago. | — |
| envido | `assets/voices/pura/envido_1.ogg` | Dos. Ni una más. | — |
| envido | `assets/voices/pura/envido_2.ogg` | Envido. Lo justo. | — |
| envido | `assets/voices/pura/envido_3.ogg` | Envido {n}. Al contado. | — |
| envido | `assets/voices/pura/envido_4.ogg` | Envido, con timbre. | — |
| envidoMas | `assets/voices/pura/envidoMas_1.ogg` | {N} más. Y se acabó. | — |
| envidoMas | `assets/voices/pura/envidoMas_2.ogg` | {N} más, sin descuento. | — |
| envidoMas | `assets/voices/pura/envidoMas_3.ogg` | Subo {n}. Al contado. | — |
| envidoMas | `assets/voices/pura/envidoMas_4.ogg` | {N} más. Firme aquí. | — |
| quiero | `assets/voices/pura/quiero_1.ogg` | Quiero. Pague usted. | — |
| quiero | `assets/voices/pura/quiero_2.ogg` | Quiero. Hágame el cambio. | — |
| quiero | `assets/voices/pura/quiero_3.ogg` | Quiero, pero cuente bien. | — |
| quiero | `assets/voices/pura/quiero_4.ogg` | Lo quiero. | — |
| noQuiero | `assets/voices/pura/noQuiero_1.ogg` | No quiero. Aquí se paga al contado. | — |
| noQuiero | `assets/voices/pura/noQuiero_2.ogg` | No. No hay fianza. | — |
| noQuiero | `assets/voices/pura/noQuiero_3.ogg` | No quiero. Aquí no se fía. | — |
| noQuiero | `assets/voices/pura/noQuiero_4.ogg` | No. Otro día. | — |
| ordago | `assets/voices/pura/ordago_1.ogg` | Órdago. Primera vez en veinte años. | — |
| ordago | `assets/voices/pura/ordago_2.ogg` | Órdago. Se cierra la caja. | — |
| ordago | `assets/voices/pura/ordago_3.ogg` | Órdago. Todo a una carta. | — |
| ordago | `assets/voices/pura/ordago_4.ogg` | Órdago. Y no se hable más. | — |
| quieroOrdago | `assets/voices/pura/quieroOrdago_1.ogg` | Quiero. Enseñe la mercancía. | — |
| quieroOrdago | `assets/voices/pura/quieroOrdago_2.ogg` | Lo quiero. A ver ese género. | — |
| quieroOrdago | `assets/voices/pura/quieroOrdago_3.ogg` | Quiero. Cuentas claras. | — |
| quieroOrdago | `assets/voices/pura/quieroOrdago_4.ogg` | Veamos esas cartas. | — |
| paresSi | `assets/voices/pura/paresSi_1.ogg` | Pares sí. | — |
| paresSi | `assets/voices/pura/paresSi_2.ogg` | Tengo pares. | — |
| paresSi | `assets/voices/pura/paresSi_3.ogg` | Sí. | — |
| paresSi | `assets/voices/pura/paresSi_4.ogg` | Pares, contados. | — |
| paresNo | `assets/voices/pura/paresNo_1.ogg` | Pares no. | — |
| paresNo | `assets/voices/pura/paresNo_2.ogg` | No. | — |
| paresNo | `assets/voices/pura/paresNo_3.ogg` | Nada. | — |
| paresNo | `assets/voices/pura/paresNo_4.ogg` | Sin pares. | — |
| juegoSi | `assets/voices/pura/juegoSi_1.ogg` | Juego sí. | — |
| juegoSi | `assets/voices/pura/juegoSi_2.ogg` | Tengo juego. | — |
| juegoSi | `assets/voices/pura/juegoSi_3.ogg` | Sí. | — |
| juegoSi | `assets/voices/pura/juegoSi_4.ogg` | Juego, sí señor. | — |
| juegoNo | `assets/voices/pura/juegoNo_1.ogg` | Juego no. | — |
| juegoNo | `assets/voices/pura/juegoNo_2.ogg` | No. | — |
| juegoNo | `assets/voices/pura/juegoNo_3.ogg` | No llego. | — |
| juegoNo | `assets/voices/pura/juegoNo_4.ogg` | Sin juego. | — |
| ganaLance | `assets/voices/pura/ganaLance_1.ogg` | A caja. | — |
| ganaLance | `assets/voices/pura/ganaLance_2.ogg` | Cobrado. | — |
| ganaLance | `assets/voices/pura/ganaLance_3.ogg` | Anotado en el libro. | — |
| ganaLance | `assets/voices/pura/ganaLance_4.ogg` | Esto es mío. | — |
| pierdeLance | `assets/voices/pura/pierdeLance_1.ogg` | Qué mala pata. | — |
| pierdeLance | `assets/voices/pura/pierdeLance_2.ogg` | Mal negocio. | — |
| pierdeLance | `assets/voices/pura/pierdeLance_3.ogg` | Pérdidas. | — |
| pierdeLance | `assets/voices/pura/pierdeLance_4.ogg` | Ya lo recuperaré. | — |
| senaCazada | `assets/voices/pura/senaCazada_1.ogg` | Seña. La he visto. | — |
| senaCazada | `assets/voices/pura/senaCazada_2.ogg` | Esa cara me la conozco. | — |
| senaCazada | `assets/voices/pura/senaCazada_3.ogg` | Aquí no se hacen trampas. | — |
| senaCazada | `assets/voices/pura/senaCazada_4.ogg` | Menos muecas, que le veo. | — |
| lePillanSena | `assets/voices/pura/lePillanSena_1.ogg` | Son las gafas, que me aprietan. | — |
| lePillanSena | `assets/voices/pura/lePillanSena_2.ogg` | Estaba contando. | — |
| lePillanSena | `assets/voices/pura/lePillanSena_3.ogg` | Tengo un orzuelo. | — |
| lePillanSena | `assets/voices/pura/lePillanSena_4.ogg` | Nada, el humo. | — |
| adentro | `assets/voices/pura/adentro_1.ogg` | Adentro. | — |
| adentro | `assets/voices/pura/adentro_2.ogg` | Adentro. A cerrar caja. | — |
| adentro | `assets/voices/pura/adentro_3.ogg` | Adentro, sin prisas. | — |
| adentro | `assets/voices/pura/adentro_4.ogg` | Adentro. Ya se ve el final. | — |
| victoria | `assets/voices/pura/victoria_1.ogg` | Firme aquí, que le hago el recibo. | — |
| victoria | `assets/voices/pura/victoria_2.ogg` | Cobrado. Hasta otra. | — |
| victoria | `assets/voices/pura/victoria_3.ogg` | Buen género, mejor cobro. | — |
| victoria | `assets/voices/pura/victoria_4.ogg` | Caja cerrada. Ganamos. | — |
| derrota | `assets/voices/pura/derrota_1.ogg` | Mal día para el negocio. | — |
| derrota | `assets/voices/pura/derrota_2.ogg` | Pérdidas. A cerrar. | — |
| derrota | `assets/voices/pura/derrota_3.ogg` | Esto no vuelve a pasar. | — |
| derrota | `assets/voices/pura/derrota_4.ogg` | Me voy al estanco. | — |
| idle | `assets/voices/pura/idle_1.ogg` | Nicanor, que el café lo pago yo, no usted. | — |
| idle | `assets/voices/pura/idle_2.ogg` | Me he dejado la persiana a medias. | — |
| idle | `assets/voices/pura/idle_3.ogg` | Hoy han llegado sellos nuevos. | — |
| idle | `assets/voices/pura/idle_4.ogg` | Hay que ver cómo está todo. | — |

## Tomasín (`tomasin`)

Estudiante de Estadística. Voz: nasal y pedante.

| Evento | Archivo | Línea | Grabada |
|---|---|---|---|
| presentacion | `assets/voices/tomasin/presentacion_1.ogg` | Tomasín. Estudio Estadística, así que ya habéis perdido. | — |
| presentacion | `assets/voices/tomasin/presentacion_2.ogg` | Tomasín, tercero de Estadística. Esto es un problema de probabilidad. | — |
| presentacion | `assets/voices/tomasin/presentacion_3.ogg` | Tomasín. He simulado este torneo diez mil veces en el ordenador. | — |
| presentacion | `assets/voices/tomasin/presentacion_4.ogg` | Soy Tomasín. Vuestra suerte es sólo varianza. | — |
| mus | `assets/voices/tomasin/mus_1.ogg` | Mus. Probabilidad de mejora favorable. | — |
| mus | `assets/voices/tomasin/mus_2.ogg` | Mus. Muestra insuficiente. | — |
| mus | `assets/voices/tomasin/mus_3.ogg` | Mus. Toca remuestrear. | — |
| mus | `assets/voices/tomasin/mus_4.ogg` | Mus. Esto es ruido. | — |
| noHayMus | `assets/voices/tomasin/noHayMus_1.ogg` | No hay mus. Varianza controlada. | — |
| noHayMus | `assets/voices/tomasin/noHayMus_2.ogg` | No hay mus. Óptimo local. | — |
| noHayMus | `assets/voices/tomasin/noHayMus_3.ogg` | Me quedo. El modelo es claro. | — |
| noHayMus | `assets/voices/tomasin/noHayMus_4.ogg` | No hay mus. Significativo. | — |
| descarte | `assets/voices/tomasin/descarte_1.ogg` | {N}. Es lo óptimo. | — |
| descarte | `assets/voices/tomasin/descarte_2.ogg` | Descarto {n}. | — |
| descarte | `assets/voices/tomasin/descarte_3.ogg` | {N}. Lo dice la tabla. | — |
| descarte | `assets/voices/tomasin/descarte_4.ogg` | Fuera {n}, por esperanza. | — |
| paso | `assets/voices/tomasin/paso_1.ogg` | Paso. Falta información. | — |
| paso | `assets/voices/tomasin/paso_2.ogg` | Paso. Hipótesis nula. | — |
| paso | `assets/voices/tomasin/paso_3.ogg` | Paso, por ahora. | — |
| paso | `assets/voices/tomasin/paso_4.ogg` | Paso. Espero datos. | — |
| envido | `assets/voices/tomasin/envido_1.ogg` | Envido. Lo dicen los números. | — |
| envido | `assets/voices/tomasin/envido_2.ogg` | Envido. Esperanza positiva. | — |
| envido | `assets/voices/tomasin/envido_3.ogg` | Envido {n}. Calculado. | — |
| envido | `assets/voices/tomasin/envido_4.ogg` | Envido. P mayor que un medio. | — |
| envidoMas | `assets/voices/tomasin/envidoMas_1.ogg` | {N} más. Es racional. | — |
| envidoMas | `assets/voices/tomasin/envidoMas_2.ogg` | Subo {n}. Teoría de juegos. | — |
| envidoMas | `assets/voices/tomasin/envidoMas_3.ogg` | {N} más. Lo he calculado. | — |
| envidoMas | `assets/voices/tomasin/envidoMas_4.ogg` | {N} más. Dominante. | — |
| quiero | `assets/voices/tomasin/quiero_1.ogg` | Quiero. Esperanza positiva. | — |
| quiero | `assets/voices/tomasin/quiero_2.ogg` | Quiero. Ajustado a modelo. | — |
| quiero | `assets/voices/tomasin/quiero_3.ogg` | Quiero, con un 60 %. | — |
| quiero | `assets/voices/tomasin/quiero_4.ogg` | Quiero. Es óptimo. | — |
| noQuiero | `assets/voices/tomasin/noQuiero_1.ogg` | No quiero. No es significativo. | — |
| noQuiero | `assets/voices/tomasin/noQuiero_2.ogg` | No quiero. P-valor alto. | — |
| noQuiero | `assets/voices/tomasin/noQuiero_3.ogg` | No. Esperanza negativa. | — |
| noQuiero | `assets/voices/tomasin/noQuiero_4.ogg` | No quiero. Riesgo excesivo. | — |
| ordago | `assets/voices/tomasin/ordago_1.ogg` | Órdago. Confianza del 95 por ciento. | — |
| ordago | `assets/voices/tomasin/ordago_2.ogg` | Órdago. Óptimo global. | — |
| ordago | `assets/voices/tomasin/ordago_3.ogg` | Órdago. Ganamos, estadísticamente. | — |
| ordago | `assets/voices/tomasin/ordago_4.ogg` | Órdago. Sin intervalo. | — |
| quieroOrdago | `assets/voices/tomasin/quieroOrdago_1.ogg` | Quiero. Veamos la muestra. | — |
| quieroOrdago | `assets/voices/tomasin/quieroOrdago_2.ogg` | Quiero. Que decida el azar. | — |
| quieroOrdago | `assets/voices/tomasin/quieroOrdago_3.ogg` | Quiero. Contraste final. | — |
| quieroOrdago | `assets/voices/tomasin/quieroOrdago_4.ogg` | Quiero. Distribución a la vista. | — |
| paresSi | `assets/voices/tomasin/paresSi_1.ogg` | Pares sí. Evento probable. | — |
| paresSi | `assets/voices/tomasin/paresSi_2.ogg` | Pares, sí. | — |
| paresSi | `assets/voices/tomasin/paresSi_3.ogg` | Tengo pares. | — |
| paresSi | `assets/voices/tomasin/paresSi_4.ogg` | Sí. Cincuenta y siete por ciento. | — |
| paresNo | `assets/voices/tomasin/paresNo_1.ogg` | Pares no. | — |
| paresNo | `assets/voices/tomasin/paresNo_2.ogg` | No. Mala muestra. | — |
| paresNo | `assets/voices/tomasin/paresNo_3.ogg` | Pares no. Estaba en la cola. | — |
| paresNo | `assets/voices/tomasin/paresNo_4.ogg` | Sin pares. | — |
| juegoSi | `assets/voices/tomasin/juegoSi_1.ogg` | Juego sí. | — |
| juegoSi | `assets/voices/tomasin/juegoSi_2.ogg` | Juego. Veintisiete por ciento. | — |
| juegoSi | `assets/voices/tomasin/juegoSi_3.ogg` | Tengo juego. | — |
| juegoSi | `assets/voices/tomasin/juegoSi_4.ogg` | Juego sí. Poco probable, pero sí. | — |
| juegoNo | `assets/voices/tomasin/juegoNo_1.ogg` | Juego no. | — |
| juegoNo | `assets/voices/tomasin/juegoNo_2.ogg` | No llego. Esperable. | — |
| juegoNo | `assets/voices/tomasin/juegoNo_3.ogg` | Sin juego. | — |
| juegoNo | `assets/voices/tomasin/juegoNo_4.ogg` | Juego no. Lo más probable. | — |
| ganaLance | `assets/voices/tomasin/ganaLance_1.ogg` | Como predijo el modelo. | — |
| ganaLance | `assets/voices/tomasin/ganaLance_2.ogg` | Estadísticamente inevitable. | — |
| ganaLance | `assets/voices/tomasin/ganaLance_3.ogg` | Esperanza cumplida. | — |
| ganaLance | `assets/voices/tomasin/ganaLance_4.ogg` | Q.E.D. | — |
| pierdeLance | `assets/voices/tomasin/pierdeLance_1.ogg` | Un outlier. No cuenta. | — |
| pierdeLance | `assets/voices/tomasin/pierdeLance_2.ogg` | Varianza, sólo varianza. | — |
| pierdeLance | `assets/voices/tomasin/pierdeLance_3.ogg` | Muestra sesgada. | — |
| pierdeLance | `assets/voices/tomasin/pierdeLance_4.ogg` | Error de tipo dos. | — |
| senaCazada | `assets/voices/tomasin/senaCazada_1.ogg` | Seña detectada. Correlación clara. | — |
| senaCazada | `assets/voices/tomasin/senaCazada_2.ogg` | Eso es una seña. Lo he visto. | — |
| senaCazada | `assets/voices/tomasin/senaCazada_3.ogg` | Patrón detectado. | — |
| senaCazada | `assets/voices/tomasin/senaCazada_4.ogg` | Esa mueca no es aleatoria. | — |
| lePillanSena | `assets/voices/tomasin/lePillanSena_1.ogg` | Era un gesto aleatorio. | — |
| lePillanSena | `assets/voices/tomasin/lePillanSena_2.ogg` | Pura coincidencia. | — |
| lePillanSena | `assets/voices/tomasin/lePillanSena_3.ogg` | Correlación no implica seña. | — |
| lePillanSena | `assets/voices/tomasin/lePillanSena_4.ogg` | Estaba pensando en una integral. | — |
| adentro | `assets/voices/tomasin/adentro_1.ogg` | Adentro. Convergemos. | — |
| adentro | `assets/voices/tomasin/adentro_2.ogg` | ¡Adentro! Tendencia al alza. | — |
| adentro | `assets/voices/tomasin/adentro_3.ogg` | Adentro. Intervalo favorable. | — |
| adentro | `assets/voices/tomasin/adentro_4.ogg` | Adentro. Lo previsto. | — |
| victoria | `assets/voices/tomasin/victoria_1.ogg` | Como predijo el modelo. | — |
| victoria | `assets/voices/tomasin/victoria_2.ogg` | Resultado significativo. | — |
| victoria | `assets/voices/tomasin/victoria_3.ogg` | Victoria con un p menor de 0,05. | — |
| victoria | `assets/voices/tomasin/victoria_4.ogg` | Hipótesis confirmada. | — |
| derrota | `assets/voices/tomasin/derrota_1.ogg` | Muestra demasiado pequeña. | — |
| derrota | `assets/voices/tomasin/derrota_2.ogg` | El modelo necesita ajustes. | — |
| derrota | `assets/voices/tomasin/derrota_3.ogg` | Esto es un outlier. | — |
| derrota | `assets/voices/tomasin/derrota_4.ogg` | Mala semilla aleatoria. | — |
| idle | `assets/voices/tomasin/idle_1.ogg` | ¿Sabíais que hay 91.390 manos posibles? | — |
| idle | `assets/voices/tomasin/idle_2.ogg` | Nicanor, ¿tienes wifi? Ah, no. | — |
| idle | `assets/voices/tomasin/idle_3.ogg` | Esto lo voy a meter en mi trabajo. | — |
| idle | `assets/voices/tomasin/idle_4.ogg` | Interesante distribución. | — |

## Marisa Lentejuela (`marisa`)

Cantante de orquesta de verbena. Voz: impostada y cantarina.

| Evento | Archivo | Línea | Grabada |
|---|---|---|---|
| presentacion | `assets/voices/marisa/presentacion_1.ogg` | Marisa Lentejuela, de gira por todas las fiestas… ¡y por vuestras piedras! | — |
| presentacion | `assets/voices/marisa/presentacion_2.ogg` | Marisa Lentejuela, voz de la orquesta Los Luceros. ¡Y hoy, a cartas! | — |
| presentacion | `assets/voices/marisa/presentacion_3.ogg` | Soy Marisa. Canto en verbenas y gano en bares. | — |
| presentacion | `assets/voices/marisa/presentacion_4.ogg` | Marisa Lentejuela. ¡Que suene la música, que empieza el espectáculo! | — |
| mus | `assets/voices/marisa/mus_1.ogg` | ¡Mus, cariño, que esta canción no me gusta! | — |
| mus | `assets/voices/marisa/mus_2.ogg` | ¡Mus! Cambio de repertorio. | — |
| mus | `assets/voices/marisa/mus_3.ogg` | Mus, que desafina. | — |
| mus | `assets/voices/marisa/mus_4.ogg` | ¡Mus! Otra canción, maestro. | — |
| noHayMus | `assets/voices/marisa/noHayMus_1.ogg` | ¡Me quedo con este repertorio! | — |
| noHayMus | `assets/voices/marisa/noHayMus_2.ogg` | ¡No hay mus! Éxito asegurado. | — |
| noHayMus | `assets/voices/marisa/noHayMus_3.ogg` | ¡Quietos, que esta la canto yo! | — |
| noHayMus | `assets/voices/marisa/noHayMus_4.ogg` | No hay mus. Esto es un bis. | — |
| descarte | `assets/voices/marisa/descarte_1.ogg` | {N}, cariño. | — |
| descarte | `assets/voices/marisa/descarte_2.ogg` | Fuera {n}, que desafinan. | — |
| descarte | `assets/voices/marisa/descarte_3.ogg` | Me cambio {n} notas. | — |
| descarte | `assets/voices/marisa/descarte_4.ogg` | ¡{N} nuevas, por favor! | — |
| paso | `assets/voices/marisa/paso_1.ogg` | Paso, cielo. | — |
| paso | `assets/voices/marisa/paso_2.ogg` | Paso. Pausa dramática. | — |
| paso | `assets/voices/marisa/paso_3.ogg` | Paso… por ahora. | — |
| paso | `assets/voices/marisa/paso_4.ogg` | Paso, que me reservo. | — |
| envido | `assets/voices/marisa/envido_1.ogg` | Envido… ¡y que suene la orquesta! | — |
| envido | `assets/voices/marisa/envido_2.ogg` | ¡Envido, cariño! | — |
| envido | `assets/voices/marisa/envido_3.ogg` | Envido {n}, con estribillo. | — |
| envido | `assets/voices/marisa/envido_4.ogg` | Envido, y a bailar. | — |
| envidoMas | `assets/voices/marisa/envidoMas_1.ogg` | ¡{N} más! ¡Y subimos el tono! | — |
| envidoMas | `assets/voices/marisa/envidoMas_2.ogg` | {N} más, con vibrato. | — |
| envidoMas | `assets/voices/marisa/envidoMas_3.ogg` | ¡{N} más, bravo! | — |
| envidoMas | `assets/voices/marisa/envidoMas_4.ogg` | {N} más, y otra vuelta. | — |
| quiero | `assets/voices/marisa/quiero_1.ogg` | ¡Quiero! ¡Que suene! | — |
| quiero | `assets/voices/marisa/quiero_2.ogg` | Quiero, mi amor. | — |
| quiero | `assets/voices/marisa/quiero_3.ogg` | ¡Lo quiero, olé! | — |
| quiero | `assets/voices/marisa/quiero_4.ogg` | Quiero, y con aplausos. | — |
| noQuiero | `assets/voices/marisa/noQuiero_1.ogg` | Paso de este bolero. | — |
| noQuiero | `assets/voices/marisa/noQuiero_2.ogg` | No quiero, cariño. | — |
| noQuiero | `assets/voices/marisa/noQuiero_3.ogg` | Ay, no. Esta no me la sé. | — |
| noQuiero | `assets/voices/marisa/noQuiero_4.ogg` | No quiero. Me duele la garganta. | — |
| ordago | `assets/voices/marisa/ordago_1.ogg` | ¡Órdago! ¡Y el que no quiera, que baile! | — |
| ordago | `assets/voices/marisa/ordago_2.ogg` | ¡ÓRDAGO! ¡Gran final! | — |
| ordago | `assets/voices/marisa/ordago_3.ogg` | ¡Órdago, y fuegos artificiales! | — |
| ordago | `assets/voices/marisa/ordago_4.ogg` | ¡Órdago! ¡Telón! | — |
| quieroOrdago | `assets/voices/marisa/quieroOrdago_1.ogg` | ¡Quiero! ¡Que se encienda el escenario! | — |
| quieroOrdago | `assets/voices/marisa/quieroOrdago_2.ogg` | ¡Lo quiero, cariño! | — |
| quieroOrdago | `assets/voices/marisa/quieroOrdago_3.ogg` | ¡Quiero! ¡Momento cumbre! | — |
| quieroOrdago | `assets/voices/marisa/quieroOrdago_4.ogg` | ¡Quiero, y redoble! | — |
| paresSi | `assets/voices/marisa/paresSi_1.ogg` | ¡Pares sí! | — |
| paresSi | `assets/voices/marisa/paresSi_2.ogg` | Pares, en armonía. | — |
| paresSi | `assets/voices/marisa/paresSi_3.ogg` | ¡Sí, pares! | — |
| paresSi | `assets/voices/marisa/paresSi_4.ogg` | Pares, a dúo. | — |
| paresNo | `assets/voices/marisa/paresNo_1.ogg` | Pares no, ay. | — |
| paresNo | `assets/voices/marisa/paresNo_2.ogg` | No, cielo. | — |
| paresNo | `assets/voices/marisa/paresNo_3.ogg` | Pares no. Canto sola. | — |
| paresNo | `assets/voices/marisa/paresNo_4.ogg` | Ni un dúo. | — |
| juegoSi | `assets/voices/marisa/juegoSi_1.ogg` | ¡Juego sí! | — |
| juegoSi | `assets/voices/marisa/juegoSi_2.ogg` | Juego, cariño. | — |
| juegoSi | `assets/voices/marisa/juegoSi_3.ogg` | ¡Tengo juego! | — |
| juegoSi | `assets/voices/marisa/juegoSi_4.ogg` | Juego sí, y afinado. | — |
| juegoNo | `assets/voices/marisa/juegoNo_1.ogg` | Juego no. | — |
| juegoNo | `assets/voices/marisa/juegoNo_2.ogg` | No llego, cielo. | — |
| juegoNo | `assets/voices/marisa/juegoNo_3.ogg` | Juego no, qué pena. | — |
| juegoNo | `assets/voices/marisa/juegoNo_4.ogg` | Sin juego. Desafino. | — |
| ganaLance | `assets/voices/marisa/ganaLance_1.ogg` | ¡Bravo, bravo! | — |
| ganaLance | `assets/voices/marisa/ganaLance_2.ogg` | ¡Olé! | — |
| ganaLance | `assets/voices/marisa/ganaLance_3.ogg` | ¡Aplausos, por favor! | — |
| ganaLance | `assets/voices/marisa/ganaLance_4.ogg` | ¡Qué exitazo! | — |
| pierdeLance | `assets/voices/marisa/pierdeLance_1.ogg` | Ay, qué gallo. | — |
| pierdeLance | `assets/voices/marisa/pierdeLance_2.ogg` | Se me ha ido la voz. | — |
| pierdeLance | `assets/voices/marisa/pierdeLance_3.ogg` | Desafinado. | — |
| pierdeLance | `assets/voices/marisa/pierdeLance_4.ogg` | Esto no estaba en el ensayo. | — |
| senaCazada | `assets/voices/marisa/senaCazada_1.ogg` | ¡Uy, uy, uy! Eso es seña. | — |
| senaCazada | `assets/voices/marisa/senaCazada_2.ogg` | ¡Te he visto, pillín! | — |
| senaCazada | `assets/voices/marisa/senaCazada_3.ogg` | ¡Menudo teatro haces! | — |
| senaCazada | `assets/voices/marisa/senaCazada_4.ogg` | ¡Seña! Y mal actuada. | — |
| lePillanSena | `assets/voices/marisa/lePillanSena_1.ogg` | ¡Es mi gesto artístico! | — |
| lePillanSena | `assets/voices/marisa/lePillanSena_2.ogg` | Estaba calentando la voz. | — |
| lePillanSena | `assets/voices/marisa/lePillanSena_3.ogg` | ¡Ensayaba una mueca! | — |
| lePillanSena | `assets/voices/marisa/lePillanSena_4.ogg` | Es que me emociono. | — |
| adentro | `assets/voices/marisa/adentro_1.ogg` | ¡Adentro! ¡Que suene la charanga! | — |
| adentro | `assets/voices/marisa/adentro_2.ogg` | ¡Adentro, y a por el bis! | — |
| adentro | `assets/voices/marisa/adentro_3.ogg` | ¡Adentro, cariño! | — |
| adentro | `assets/voices/marisa/adentro_4.ogg` | ¡Adentro! ¡Último estribillo! | — |
| victoria | `assets/voices/marisa/victoria_1.ogg` | ¡Gracias, sois un público maravilloso! | — |
| victoria | `assets/voices/marisa/victoria_2.ogg` | ¡Bravo! ¡Otra, otra! | — |
| victoria | `assets/voices/marisa/victoria_3.ogg` | ¡Éxito total de la gira! | — |
| victoria | `assets/voices/marisa/victoria_4.ogg` | ¡Esta noche, fiesta! | — |
| derrota | `assets/voices/marisa/derrota_1.ogg` | Mi público no me merece. | — |
| derrota | `assets/voices/marisa/derrota_2.ogg` | Ay, qué mal final. | — |
| derrota | `assets/voices/marisa/derrota_3.ogg` | Suspendida la función. | — |
| derrota | `assets/voices/marisa/derrota_4.ogg` | Mañana, mejor. Hoy no tenía voz. | — |
| idle | `assets/voices/marisa/idle_1.ogg` | Tarareo mientras piensan… | — |
| idle | `assets/voices/marisa/idle_2.ogg` | El sábado canto en la verbena. | — |
| idle | `assets/voices/marisa/idle_3.ogg` | ¡Nicanor, un agua con limón! | — |
| idle | `assets/voices/marisa/idle_4.ogg` | Esta laca me tiene loca. | — |

## Julián (`julian`)

Alguacil del pueblo. Voz: de pregonero, alarga las vocales.

| Evento | Archivo | Línea | Grabada |
|---|---|---|---|
| presentacion | `assets/voices/julian/presentacion_1.ogg` | Julián, alguacil. Se hace saber que esta partida es mía. | — |
| presentacion | `assets/voices/julian/presentacion_2.ogg` | Julián, alguacil de Villaenvite. Aquí se juega según el reglamento. | — |
| presentacion | `assets/voices/julian/presentacion_3.ogg` | Se hace saber: Julián, alguacil, se presenta al campeonato. | — |
| presentacion | `assets/voices/julian/presentacion_4.ogg` | Julián. Pregonero, alguacil y jugador con licencia. | — |
| mus | `assets/voices/julian/mus_1.ogg` | Mus, conforme al reglamento. | — |
| mus | `assets/voices/julian/mus_2.ogg` | Mus. Artículo tercero. | — |
| mus | `assets/voices/julian/mus_3.ogg` | Mus, según bando. | — |
| mus | `assets/voices/julian/mus_4.ogg` | Mus, que conste en acta. | — |
| noHayMus | `assets/voices/julian/noHayMus_1.ogg` | No hay mus. Queda cerrada la ventanilla. | — |
| noHayMus | `assets/voices/julian/noHayMus_2.ogg` | No hay mus. Por orden. | — |
| noHayMus | `assets/voices/julian/noHayMus_3.ogg` | Se corta el mus. Que conste. | — |
| noHayMus | `assets/voices/julian/noHayMus_4.ogg` | No hay mus. Resolución firme. | — |
| descarte | `assets/voices/julian/descarte_1.ogg` | {N}. Que conste. | — |
| descarte | `assets/voices/julian/descarte_2.ogg` | Me descarto de {n}. | — |
| descarte | `assets/voices/julian/descarte_3.ogg` | {N}, según reglamento. | — |
| descarte | `assets/voices/julian/descarte_4.ogg` | Deposito {n}. | — |
| paso | `assets/voices/julian/paso_1.ogg` | Paso. Que conste. | — |
| paso | `assets/voices/julian/paso_2.ogg` | Paso, por ahora. | — |
| paso | `assets/voices/julian/paso_3.ogg` | Paso, en tiempo y forma. | — |
| paso | `assets/voices/julian/paso_4.ogg` | Paso. Sin alegaciones. | — |
| envido | `assets/voices/julian/envido_1.ogg` | Se envidan dos piedras. Que conste. | — |
| envido | `assets/voices/julian/envido_2.ogg` | Envido, por orden. | — |
| envido | `assets/voices/julian/envido_3.ogg` | Envido {n}. Así se hace saber. | — |
| envido | `assets/voices/julian/envido_4.ogg` | Envido, según bando. | — |
| envidoMas | `assets/voices/julian/envidoMas_1.ogg` | {N} más. Por la autoridad. | — |
| envidoMas | `assets/voices/julian/envidoMas_2.ogg` | {N} más. Recurso de alzada. | — |
| envidoMas | `assets/voices/julian/envidoMas_3.ogg` | Subo {n}. Que conste. | — |
| envidoMas | `assets/voices/julian/envidoMas_4.ogg` | {N} más, en firme. | — |
| quiero | `assets/voices/julian/quiero_1.ogg` | Quiero. Se admite a trámite. | — |
| quiero | `assets/voices/julian/quiero_2.ogg` | Quiero. Que conste. | — |
| quiero | `assets/voices/julian/quiero_3.ogg` | Quiero, conforme. | — |
| quiero | `assets/voices/julian/quiero_4.ogg` | Se acepta. Quiero. | — |
| noQuiero | `assets/voices/julian/noQuiero_1.ogg` | No quiero. Recurriré. | — |
| noQuiero | `assets/voices/julian/noQuiero_2.ogg` | No quiero. Presento alegación. | — |
| noQuiero | `assets/voices/julian/noQuiero_3.ogg` | Desestimado. No quiero. | — |
| noQuiero | `assets/voices/julian/noQuiero_4.ogg` | No quiero. Fuera de plazo. | — |
| ordago | `assets/voices/julian/ordago_1.ogg` | ¡Órdago, por orden de la autoridad! | — |
| ordago | `assets/voices/julian/ordago_2.ogg` | ¡Órdago! ¡Se hace saber! | — |
| ordago | `assets/voices/julian/ordago_3.ogg` | ¡Órdago, con sello municipal! | — |
| ordago | `assets/voices/julian/ordago_4.ogg` | ¡Órdago! ¡Y que suene la corneta! | — |
| quieroOrdago | `assets/voices/julian/quieroOrdago_1.ogg` | Quiero. Se levanta acta. | — |
| quieroOrdago | `assets/voices/julian/quieroOrdago_2.ogg` | Quiero. Que se destape. | — |
| quieroOrdago | `assets/voices/julian/quieroOrdago_3.ogg` | Quiero. Sentencia firme. | — |
| quieroOrdago | `assets/voices/julian/quieroOrdago_4.ogg` | Quiero. Proceda. | — |
| paresSi | `assets/voices/julian/paresSi_1.ogg` | Pares sí, que conste. | — |
| paresSi | `assets/voices/julian/paresSi_2.ogg` | Declaro pares. | — |
| paresSi | `assets/voices/julian/paresSi_3.ogg` | Pares, en regla. | — |
| paresSi | `assets/voices/julian/paresSi_4.ogg` | Sí, pares. | — |
| paresNo | `assets/voices/julian/paresNo_1.ogg` | Pares no. | — |
| paresNo | `assets/voices/julian/paresNo_2.ogg` | Declaro que no. | — |
| paresNo | `assets/voices/julian/paresNo_3.ogg` | Sin pares. Que conste. | — |
| paresNo | `assets/voices/julian/paresNo_4.ogg` | Pares no, lamentablemente. | — |
| juegoSi | `assets/voices/julian/juegoSi_1.ogg` | Juego sí, que conste. | — |
| juegoSi | `assets/voices/julian/juegoSi_2.ogg` | Declaro juego. | — |
| juegoSi | `assets/voices/julian/juegoSi_3.ogg` | Tengo juego, en regla. | — |
| juegoSi | `assets/voices/julian/juegoSi_4.ogg` | Juego sí. | — |
| juegoNo | `assets/voices/julian/juegoNo_1.ogg` | Juego no. | — |
| juegoNo | `assets/voices/julian/juegoNo_2.ogg` | Declaro que no llego. | — |
| juegoNo | `assets/voices/julian/juegoNo_3.ogg` | Sin juego. | — |
| juegoNo | `assets/voices/julian/juegoNo_4.ogg` | Juego no. Que conste. | — |
| ganaLance | `assets/voices/julian/ganaLance_1.ogg` | Se hace saber: ganado. | — |
| ganaLance | `assets/voices/julian/ganaLance_2.ogg` | Ganado en buena ley. | — |
| ganaLance | `assets/voices/julian/ganaLance_3.ogg` | Queda registrado. | — |
| ganaLance | `assets/voices/julian/ganaLance_4.ogg` | Conforme al reglamento. | — |
| pierdeLance | `assets/voices/julian/pierdeLance_1.ogg` | Protesto. | — |
| pierdeLance | `assets/voices/julian/pierdeLance_2.ogg` | Esto va al juzgado. | — |
| pierdeLance | `assets/voices/julian/pierdeLance_3.ogg` | Irregularidad manifiesta. | — |
| pierdeLance | `assets/voices/julian/pierdeLance_4.ogg` | Recurriré. | — |
| senaCazada | `assets/voices/julian/senaCazada_1.ogg` | ¡Seña! Queda anotada. | — |
| senaCazada | `assets/voices/julian/senaCazada_2.ogg` | Eso es seña. Multa. | — |
| senaCazada | `assets/voices/julian/senaCazada_3.ogg` | Seña vista. Consta en acta. | — |
| senaCazada | `assets/voices/julian/senaCazada_4.ogg` | ¡Alto! Eso ha sido seña. | — |
| lePillanSena | `assets/voices/julian/lePillanSena_1.ogg` | Protesto. No era seña. | — |
| lePillanSena | `assets/voices/julian/lePillanSena_2.ogg` | Era un gesto oficial. | — |
| lePillanSena | `assets/voices/julian/lePillanSena_3.ogg` | Me picaba el bigote. | — |
| lePillanSena | `assets/voices/julian/lePillanSena_4.ogg` | Exijo pruebas. | — |
| adentro | `assets/voices/julian/adentro_1.ogg` | ¡Adentro, por orden! | — |
| adentro | `assets/voices/julian/adentro_2.ogg` | Adentro. Se hace saber. | — |
| adentro | `assets/voices/julian/adentro_3.ogg` | ¡Adentro, vecinos! | — |
| adentro | `assets/voices/julian/adentro_4.ogg` | Adentro. Que suene la corneta. | — |
| victoria | `assets/voices/julian/victoria_1.ogg` | Se levanta acta: hemos ganado. | — |
| victoria | `assets/voices/julian/victoria_2.ogg` | Queda proclamado: ganamos. | — |
| victoria | `assets/voices/julian/victoria_3.ogg` | Victoria en firme. | — |
| victoria | `assets/voices/julian/victoria_4.ogg` | Se hace saber: campeones. | — |
| derrota | `assets/voices/julian/derrota_1.ogg` | Presentaré recurso. | — |
| derrota | `assets/voices/julian/derrota_2.ogg` | Esto no ha terminado. Recurriré. | — |
| derrota | `assets/voices/julian/derrota_3.ogg` | Irregularidades por todas partes. | — |
| derrota | `assets/voices/julian/derrota_4.ogg` | Lo llevo al pleno. | — |
| idle | `assets/voices/julian/idle_1.ogg` | Mañana hay bando de las fiestas. | — |
| idle | `assets/voices/julian/idle_2.ogg` | Nicanor, esa terraza no tiene permiso. | — |
| idle | `assets/voices/julian/idle_3.ogg` | Aquí está prohibido fumar desde el 88. | — |
| idle | `assets/voices/julian/idle_4.ogg` | Silencio en la sala. | — |

## Nicanor (`nicanor`)

El camarero. Voz campechana, de barra de bar.

| Archivo | Línea |
|---|---|
| `assets/voices/nicanor/idle_1.ogg` | ¡Marchando dos cafés! |
| `assets/voices/nicanor/idle_2.ogg` | Aquí se juega, pero se consume. |
| `assets/voices/nicanor/idle_3.ogg` | ¡Adentro, que se enfría la tortilla! |
| `assets/voices/nicanor/idle_4.ogg` | ¿Otra ronda? La casa no invita. |
| `assets/voices/nicanor/idle_5.ogg` | Cuidado con el tapete, que es nuevo. |
| `assets/voices/nicanor/idle_6.ogg` | ¡Esa caña, que se calienta! |
| `assets/voices/nicanor/idle_7.ogg` | Hoy hay callos, el que avisa… |
| `assets/voices/nicanor/idle_8.ogg` | A ver si ponéis algo en la hucha. |

## Cameos

| Personaje | Archivo | Línea |
|---|---|---|
| El cartero | `assets/voices/cartero/cameo_1.ogg` | ¿Don Anselmo? Traigo un certificado… bueno, luego vuelvo. |
| El cartero | `assets/voices/cartero/cameo_2.ogg` | Carta para el bar… ¡ah, no, que es de la otra calle! |
| El cartero | `assets/voices/cartero/cameo_3.ogg` | ¡Nicanor, la factura de la luz! Te la dejo aquí. |
| La vecina | `assets/voices/vecina/cameo_1.ogg` | ¿Alguien ha visto a mi Paco? …Ya veo que aquí no. |
| La vecina | `assets/voices/vecina/cameo_2.ogg` | ¡Como esté aquí mi marido…! Ah, no está. |
| La vecina | `assets/voices/vecina/cameo_3.ogg` | Que digo yo que si habéis visto al gato. |
| Un turista | `assets/voices/turista/cameo_1.ogg` | Perdonen, ¿la ermita románica? |
| Un turista | `assets/voices/turista/cameo_2.ogg` | Disculpen, ¿aquí se puede comer? |
| Un turista | `assets/voices/turista/cameo_3.ogg` | ¿Esto es Villaenvite? En el mapa parecía más grande. |
| Un chaval | `assets/voices/chaval/cameo_1.ogg` | ¡Nicanor, un polo de limón! |
| Un chaval | `assets/voices/chaval/cameo_2.ogg` | ¿Me da un helado de corte? |
| Un chaval | `assets/voices/chaval/cameo_3.ogg` | ¡Un flash de fresa, que me lo ha dicho mi madre! |
| El perro del bar | `assets/voices/perro/cameo_1.ogg` | ¡Guau! |
| El perro del bar | `assets/voices/perro/cameo_2.ogg` | ¡Guau, guau! |
| El perro del bar | `assets/voices/perro/cameo_3.ogg` | Grrr… ¡guau! |

Total de líneas de los siete personajes: 644.
