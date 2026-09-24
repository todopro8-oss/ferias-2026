import { cargarRecursos } from './core/assets';
import { type Juego } from './core/juego';
import { MotorAudio } from './audio/motor';
import { Bucle } from './core/loop';
import { Entrada } from './core/input';
import { Pantalla } from './core/pantalla';
import { GestorEscenas } from './core/sceneManager';
import type { IdPersonaje } from './data/characters';
import { Flujo } from './scenes/flujo';
import { Galeria } from './scenes/Galeria';
import { Mesa, type ResultadoPartida } from './scenes/Table';

const pantalla = new Pantalla(document.getElementById('pantalla') as HTMLCanvasElement);
const entrada = new Entrada(pantalla);
const escenas = new GestorEscenas();
const params = new URLSearchParams(location.search);

const bucle = new Bucle({
  actualizar: (dt) => {
    juego.tiempo += dt;
    for (const e of entrada.sacar()) {
      if (e.tipo === 'tecla' && e.tecla.toLowerCase() === 'f' && !e.repetida && escenas.actual?.nombre !== 'Nombre') {
        void pantalla.alternarPantallaCompleta();
      }
      escenas.entrada(e);
    }
    escenas.actualizar(dt);
  },
  dibujar: () => {
    pantalla.ctx.fillStyle = '#000';
    pantalla.ctx.fillRect(0, 0, 320, 200);
    escenas.dibujar(pantalla.ctx);
  },
});

const juego: Juego = {
  pantalla,
  entrada,
  escenas,
  bucle,
  opciones: Flujo.cargarOpciones(),
  guardarOpciones: () => flujo.guardarOpciones(),
  tiempo: 0,
  turbo: 1,
  audio: null as unknown as MotorAudio,
};
const motorAudio = new MotorAudio(() => juego.opciones);
juego.audio = motorAudio;
// Los navegadores sólo dejan sonar el audio tras un gesto del usuario.
entrada.alPrimerGesto(() => motorAudio.desbloquear());
pantalla.configurar(juego.opciones.escalado, juego.opciones.correccion43);
const flujo = new Flujo(juego);

// Ajustes de desarrollo por URL (?senas=discreto&chivato&dificultad=dificil&velocidad=rapida).
if (params.has('senas')) juego.opciones.senas = params.get('senas') as typeof juego.opciones.senas;
if (params.has('chivato')) juego.opciones.chivato = true;
if (params.has('dificultad')) juego.opciones.dificultad = params.get('dificultad') as typeof juego.opciones.dificultad;
if (params.has('demo')) flujo.demo = true;
if (params.has('velocidad')) juego.opciones.velocidadIA = params.get('velocidad') as typeof juego.opciones.velocidadIA;

// Gancho para pruebas automáticas (Playwright).
const depuracion = { juego, escenas, flujo, partidasTerminadas: 0, ultimoResultado: null as ResultadoPartida | null };
(window as unknown as { __mus: unknown }).__mus = depuracion;

/** ?mesa: entra directamente en una partida (pruebas y desarrollo). */
function empezarMesa(): void {
  const rivales = (params.get('rivales') ?? 'canijo,rufi').split(',') as [IdPersonaje, IdPersonaje];
  const mesa = new Mesa(juego, {
    companero: (params.get('companero') ?? 'anselmo') as IdPersonaje,
    rivales,
    semilla: params.has('semilla') ? Number(params.get('semilla')) : undefined,
    autoJugar: params.has('auto'),
    alPausar: () => flujo.pausa(mesa),
    alTerminar: (r) => {
      depuracion.partidasTerminadas++;
      depuracion.ultimoResultado = r;
      empezarMesa();
    },
  });
  escenas.cambiar(mesa);
}

async function arrancar(): Promise<void> {
  await cargarRecursos();
  if (params.has('galeria')) {
    const g = new Galeria(params.get('galeria') ?? 'cartas');
    g.pagina = Number(params.get('pagina') ?? 0);
    escenas.cambiar(g);
  } else if (params.has('mesa') || params.has('semilla') || params.has('auto')) {
    empezarMesa();
  } else if (params.has('menu')) {
    flujo.menu();
  } else {
    flujo.arrancar();
  }
  if (params.has('turbo')) {
    juego.turbo = Number(params.get('turbo'));
    bucle.aceleracion = juego.turbo;
  }
  bucle.empezar();
}

void arrancar();
