// La mesa (sección 10): orquesta motor → eventos → animaciones y voces → entrada.
// El motor avanza de golpe hasta la siguiente decisión; aquí se reproducen sus eventos
// uno a uno, con su ritmo, y sólo después se pide la siguiente decisión (humano o IA).

import { crearJugador } from '../ai/fabrica';
import type { JugadorMus } from '../ai/jugadorMus';
import { vistaPara, type SenaVista } from '../ai/view';
import { catalogoActivo, duracionSena, elegirSenaIA, probabilidadCaza, sena, type IdSena } from '../ai/senas';
import { percentilEnLance, tablas } from '../ai/handValue';
import { hojaPersonaje } from '../core/assets';
import { ALTO_LINEA, envolver, texto } from '../core/bitmapFont';
import type { EventoEntrada } from '../core/input';
import { dentro } from '../core/input';
import { configDeOpciones, ritmo, type Juego } from '../core/juego';
import { derivarSemilla, mulberry32, type Rng } from '../core/rng';
import type { Escena } from '../core/sceneManager';
import { Animador, suave } from '../core/tween';
import { PERSONAJES, type IdPersonaje } from '../data/characters';
import { CAMEOS, DESPEDIDA_CAMEO, LINEAS, LINEAS_NICANOR, RESPUESTAS_CAMEO, type EventoVoz } from '../data/lines.es';
import { CameoEnCurso } from '../render/cameos';
import { narrar, NOMBRE_EQUIPO } from '../data/narrador.es';
import { DERIVADOS as D, PALETA as P } from '../data/palette';
import { SelectorLineas } from '../data/selectorLineas';
import { LINEAS_HUMANO, UI } from '../data/ui.es';
import { rango, type Carta } from '../mus/cards';
import { companero, equipoDe, juegosParaGanar, miembros, type Equipo, type MusConfig, type Seat } from '../mus/config';
import type { Lance } from '../mus/evaluate';
import type { ManoMus } from '../mus/handState';
import { PartidaMus } from '../mus/match';
import type { Accion, Decision, EventoMus, ResultadoLance, VozMus } from '../mus/types';
import { fondoBar, Camarero, dibujarFluorescente, dibujarNeon, dibujarReloj, dibujarTele } from '../render/barScene';
import { crearBocadillo, dibujarBocadillo, type Bocadillo } from '../render/bubbles';
import {
  CARTA_H,
  CARTA_W,
  DORSO_H,
  DORSO_W,
  dibujarVolteo,
  imagenCarta,
  imagenDorso,
  imagenMini,
  imagenReversoMini,
} from '../render/cardRenderer';
import { BustoAnimado } from '../render/characterRenderer';
import { caja, marco } from '../render/pixel';
import { dibujarCuenco, dibujarMonton, dibujarPiedra, dibujarPizarra, posicionEnMonton } from '../render/stones';
import { LAYOUT, MESA_Y, origenAsiento, rectCarta } from '../render/tableLayout';
import { GrupoBotones, hojaLibreta, panelPizarra, type Boton } from '../render/ui';
import { HandSummary } from './HandSummary';

export interface EstadisticasPartida {
  manos: number;
  ordagosLanzados: number;
  ordagosAceptados: number;
  /** Señas que ha hecho el humano. */
  senasHechas: number;
  /** Señas de los rivales que ha cazado el humano («¡Te he visto!»). */
  senasCazadas: number;
  /** Señas del humano que le han cazado los rivales. */
  senasPilladas: number;
  juegos: [number, number];
  piedras: [number, number];
}

export interface ResultadoPartida {
  ganador: Equipo;
  estadisticas: EstadisticasPartida;
  abandonada?: boolean;
}

export interface OpcionesMesa {
  companero: IdPersonaje;
  /** [este (asiento 1), oeste (asiento 3)] */
  rivales: [IdPersonaje, IdPersonaje];
  semilla?: number;
  /** Rótulo pequeño (p. ej. «Semifinal»). */
  titulo?: string;
  alTerminar?: (r: ResultadoPartida) => void;
  /** Modo de prueba: el humano también lo juega la IA (prueba de resistencia). */
  autoJugar?: boolean;
  /** Esc: pausa. */
  alPausar?: () => void;
  /** Mano guiada: cartas fijadas, postre fijo y pistas según la decisión. */
  tutorial?: {
    manos: Carta[][];
    postre: Seat;
    pista: (d: Decision | null, mesa: Mesa) => string | null;
    alSalir: () => void;
  };
}

type EstadoMesa = 'eventos' | 'pensando' | 'humano' | 'continuar' | 'fin';

const LANCES_PANEL: Lance[] = ['grande', 'chica', 'pares', 'juego'];

export class Mesa implements Escena {
  readonly nombre = 'Mesa';
  readonly config: MusConfig;
  readonly partida: PartidaMus;
  mano: ManoMus | null = null;
  readonly ids: Record<1 | 2 | 3, IdPersonaje>;
  readonly ias: Record<1 | 2 | 3, JugadorMus>;
  /** La IA que juega por el humano en modo automático. */
  private iaHumano: JugadorMus | null = null;
  readonly bustos: Record<1 | 2 | 3, BustoAnimado>;
  private readonly rng: Rng;
  private readonly lineas: SelectorLineas;
  private readonly anim = new Animador();
  private readonly camarero: Camarero;
  private readonly resumen = new HandSummary();
  readonly grupo = new GrupoBotones();

  estado: EstadoMesa = 'eventos';
  private cola: EventoMus[] = [];
  private espera = 0;
  private pensando = 0;
  private decisionMostrada: Decision | null = null;

  // Estado visual
  private dorsos: [number, number, number, number] = [0, 0, 0, 0];
  private misCartas: Carta[] = [];
  private seleccion = new Set<Carta>();
  private mazo = 40;
  private descartes = 0;
  private montones: [number, number] = [0, 0];
  private marcadorVisible: [number, number] = [0, 0];
  private resaltarMarcador: [number, number] = [0, 0];
  private estadoLances: Partial<Record<Lance, string>> = {};
  private lanceActual: Lance | null = null;
  private hayPunto = false;
  private destape: Carta[][] | null = null;
  private volteo = 1;
  private cantidad = 2;
  private bocadillos: Partial<Record<Seat | 4 | 5, Bocadillo>> = {};
  /** Alguien que entra por la puerta del fondo (cada 3-6 manos). */
  private cameo: CameoEnCurso | null = null;
  private manosHastaCameo = 3;
  private hablaCameo = 2600;
  private banner: { texto: string; color: string; restante: number } | null = null;
  private historial: string[] = [];
  verHistorial = false;
  private verAyuda = false;
  private tiempo = 0;
  private tSinHablar = 0;
  private temblor = 0;
  finJuegoPendiente = false;
  senasVistas: Record<Seat, SenaVista[]> = { 0: [], 1: [], 2: [], 3: [] };
  /** Señas que la IA hará en cuanto pase su momento (dentro de la ventana de señas). */
  private senasPendientes: { s: 1 | 2 | 3; id: IdSena; en: number }[] = [];
  /** Seña que está haciendo cada asiento ahora mismo (para «¡Te he visto!»). */
  private senaEnCurso: Partial<Record<Seat, { id: IdSena; restante: number; pillada: boolean }>> = {};
  menuSenas = false;
  /** Lo que la IA «Difícil» aprende del humano: cuántas veces envida y cuántas era farol. */
  private modeloHumano = { envites: 0, faroles: 0 };
  readonly estadisticas: EstadisticasPartida = {
    manos: 0,
    ordagosLanzados: 0,
    ordagosAceptados: 0,
    senasHechas: 0,
    senasCazadas: 0,
    senasPilladas: 0,
    juegos: [0, 0],
    piedras: [0, 0],
  };

  constructor(
    private readonly juego: Juego,
    private readonly op: OpcionesMesa,
  ) {
    const o = juego.opciones;
    this.config = configDeOpciones(o);
    const semilla = op.semilla ?? Math.floor(Math.random() * 1e9);
    this.rng = mulberry32(semilla);
    this.lineas = new SelectorLineas(mulberry32(derivarSemilla(this.rng)));
    this.camarero = new Camarero(mulberry32(derivarSemilla(this.rng)));
    this.partida = new PartidaMus(this.config, mulberry32(derivarSemilla(this.rng)), op.tutorial?.postre);
    this.ids = { 1: op.rivales[0], 2: op.companero, 3: op.rivales[1] };
    const crear = (s: 1 | 2 | 3) =>
      crearJugador(
        {
          personalidad: { ...PERSONAJES[this.ids[s]].stats },
          dificultad: o.dificultad,
          nombre: PERSONAJES[this.ids[s]].corto,
          estilo: PERSONAJES[this.ids[s]].estilo,
          companeroDeHumano: s === 2,
        },
        mulberry32(derivarSemilla(this.rng)),
      );
    this.ias = { 1: crear(1), 2: crear(2), 3: crear(3) };
    if (op.autoJugar) {
      this.iaHumano = crearJugador(
        { personalidad: PERSONAJES.tomasin.stats, dificultad: 'normal', nombre: 'Tú' },
        mulberry32(derivarSemilla(this.rng)),
      );
    }
    const rb = mulberry32(derivarSemilla(this.rng));
    this.bustos = {
      2: new BustoAnimado(hojaPersonaje(this.ids[2], 'frontal'), rb),
      3: new BustoAnimado(hojaPersonaje(this.ids[3], 'tresCuartos'), rb),
      1: new BustoAnimado(hojaPersonaje(this.ids[1], 'tresCuartos', true), rb),
    };
  }

  // ---------------------------------------------------------------------------
  // Ciclo de vida
  // ---------------------------------------------------------------------------

  entrar(): void {
    this.juego.audio.musica(null);
    this.juego.audio.ambiente(true);
    this.nuevaMano();
  }

  salir(): void {
    this.juego.audio.ambiente(false);
  }

  private get ritmo(): number {
    return ritmo(this.juego.opciones.velocidadIA);
  }

  private nuevaMano(): void {
    this.mano = this.partida.nuevaMano(
      this.op.tutorial && this.partida.numeroMano === 0 ? this.op.tutorial.manos : undefined,
    );
    this.dorsos = [0, 0, 0, 0];
    this.misCartas = [];
    this.seleccion.clear();
    this.mazo = 40;
    this.descartes = 0;
    this.estadoLances = {};
    this.lanceActual = null;
    this.hayPunto = false;
    this.destape = null;
    this.resumen.reiniciar();
    this.historial = [];
    this.finJuegoPendiente = false;
    this.senasVistas = { 0: [], 1: [], 2: [], 3: [] };
    this.senasPendientes = [];
    this.senaEnCurso = {};
    this.menuSenas = false;
    this.marcadorVisible = [this.partida.marcador[0], this.partida.marcador[1]];
    this.montones = [this.partida.marcador[0], this.partida.marcador[1]];
    this.estado = 'eventos';
    this.cola.push(...this.mano.sacarEventos());
    // Cada 3-6 manos entra alguien por la puerta.
    if (!this.op.tutorial && --this.manosHastaCameo <= 0 && !this.cameo) {
      this.manosHastaCameo = 3 + Math.floor(this.rng() * 4);
      this.cameo = new CameoEnCurso(CAMEOS[Math.floor(this.rng() * CAMEOS.length)].id);
    }
    // Nicanor comenta de vez en cuando al empezar la mano.
    if (this.partida.numeroMano > 0 && this.rng() < 0.18) {
      const l = this.lineas.elegirConIndice('nicanor', LINEAS_NICANOR);
      this.bocadillos[4] = crearBocadillo(l.texto, { x: 222, y: 24, lado: 'derecha' }, 2600);
      this.juego.audio.voz('nicanor', 'idle', l.texto, l.indice);
      this.camarero.forzar('quieto', 1800);
    }
  }

  // ---------------------------------------------------------------------------
  // Actualización
  // ---------------------------------------------------------------------------

  actualizar(dt: number): void {
    this.tiempo += dt;
    this.anim.actualizar(dt);
    this.camarero.actualizar(dt);
    this.resumen.actualizar(dt);
    for (const s of [1, 2, 3] as const) this.bustos[s].actualizar(dt);
    for (const k of Object.keys(this.bocadillos)) {
      const b = this.bocadillos[Number(k) as Seat];
      if (!b) continue;
      b.restante -= dt;
      if (b.restante <= 0) delete this.bocadillos[Number(k) as Seat];
    }
    if (this.banner) {
      this.banner.restante -= dt;
      if (this.banner.restante <= 0) this.banner = null;
    }
    if (this.temblor > 0) {
      this.temblor -= dt;
      this.juego.pantalla.temblor.x = this.temblor > 0 ? (Math.floor(this.temblor / 30) % 2 ? 2 : -2) : 0;
    }
    for (const e of [0, 1] as const) if (this.resaltarMarcador[e] > 0) this.resaltarMarcador[e] -= dt;
    this.actualizarSenas(dt);
    this.actualizarCameo(dt);

    if (this.estado === 'continuar' || this.estado === 'fin') {
      if (this.iaHumano && this.estado === 'continuar' && !this.anim.ocupado) this.continuar();
      return;
    }
    if (this.estado === 'humano') {
      this.tSinHablar += dt;
      if (this.tSinHablar > 14000) this.charlaOciosa();
      if (this.iaHumano && this.mano) {
        const d = this.mano.pendiente();
        if (d && d.jugador === 0) this.aplicar(0, this.iaHumano.decidir(this.vista(0), d));
      }
      return;
    }
    if (this.espera > 0) {
      this.espera -= dt;
      return;
    }
    if (this.cola.length > 0) {
      this.procesar(this.cola.shift()!);
      return;
    }
    if (!this.mano) return;
    const d = this.mano.pendiente();
    if (!d) return;
    if (d.jugador === 0) {
      this.mostrarDecision(d);
      return;
    }
    const s = d.jugador as 1 | 2 | 3;
    if (this.estado !== 'pensando') {
      this.estado = 'pensando';
      const base = d.tipo === 'descarte' ? 700 : d.tipo === 'mus' ? 500 : 800;
      this.pensando = (base + this.rng() * 600) * this.ritmo;
      if (d.tipo === 'apuesta' && this.rng() < 0.35) this.bustos[s].mostrar('pensar', this.pensando);
      return;
    }
    this.pensando -= dt;
    if (this.pensando > 0) return;
    this.aplicar(s, this.ias[s].decidir(this.vista(s), d));
  }

  private vista(s: Seat) {
    return vistaPara(this.mano!, s, {
      juegos: [this.partida.juegos[0], this.partida.juegos[1]],
      senas: this.senasVistas[s],
    });
  }

  /** Aplica una acción al motor y encola los eventos que produzca. */
  aplicar(s: Seat, accion: Accion): void {
    if (!this.mano) return;
    if (accion.tipo === 'ordago') this.estadisticas.ordagosLanzados++;
    this.mano.actuar(s, accion);
    this.cola.push(...this.mano.sacarEventos());
    this.estado = 'eventos';
    this.decisionMostrada = null;
    this.grupo.vaciar();
    if (s === 0) this.seleccion.clear();
    this.tSinHablar = 0;
  }

  // ---------------------------------------------------------------------------
  // Eventos del motor → animaciones
  // ---------------------------------------------------------------------------

  private procesar(e: EventoMus): void {
    const r = this.ritmo;
    const narrado = narrar(e, this.nombres());
    if (narrado) this.historial.push(narrado);
    switch (e.tipo) {
      case 'inicio_mano':
        this.espera = 300 * r;
        break;
      case 'baraja':
        this.juego.audio.sfx('barajar');
        this.espera = 500 * r;
        break;
      case 'carta_repartida':
        this.animarReparto(e.a, e.carta);
        this.espera = 80 * r;
        break;
      case 'fase_mus':
        // Cartas nuevas: lo que se señó antes ya no vale.
        if (e.ronda > 0) this.senasVistas = { 0: [], 1: [], 2: [], 3: [] };
        this.espera = (this.programarSenasIA() ? 700 : 250) * r;
        break;
      case 'habla':
        this.hablar(e.jugador, e.voz, e.cantidad, e.lance);
        break;
      case 'descarte':
        this.animarDescarte(e.jugador, e.cartas);
        this.espera = 350 * r;
        break;
      case 'rebarajar_descartes':
        this.juego.audio.sfx('barajar');
        this.mazo += this.descartes;
        this.descartes = 0;
        this.mostrarBanner('Se barajan los descartes', P.tiza, 1100);
        this.espera = 700 * r;
        break;
      case 'mano_avanza':
        this.mostrarBanner('Mus corrido: cambia la mano', P.tiza, 1100);
        this.espera = 600 * r;
        break;
      case 'corte_mus':
        this.espera = (this.programarSenasIA() ? 700 : 200) * r;
        break;
      case 'lance_inicio':
        this.lanceActual = e.lance;
        if (e.lance === 'punto') this.hayPunto = true;
        this.espera = 300 * r;
        break;
      case 'lance_fin':
        this.estadoLances[e.lance] = this.textoResultado(e.resultado);
        this.lanceActual = null;
        this.espera = 350 * r;
        break;
      case 'deje':
        this.animarPiedras(e.equipo, e.piedras);
        this.reaccionar(e.equipo, 'contento', 0.5);
        this.espera = (300 + Math.min(e.piedras, 10) * 90) * r;
        break;
      case 'ordago_aceptado':
        this.estadisticas.ordagosAceptados++;
        this.mostrarBanner('¡ÓRDAGO!', P.copas, 1400);
        this.temblor = 400;
        this.juego.audio.sfx('golpe');
        this.espera = 1000 * r;
        break;
      case 'destape':
        this.destapar(e.manos);
        this.aprenderFaroles(e.manos[0]);
        this.espera = 1100 * r;
        break;
      case 'resolucion_ordago': {
        const ganaNos = e.equipo === 0;
        this.mostrarBanner(
          ganaNos ? '¡Órdago para Nosotros!' : 'Órdago para Ellos',
          ganaNos ? P.oros : D.copas_brillo,
          2200,
        );
        this.reaccionar(e.equipo, 'contento', 1);
        this.reaccionar((1 - e.equipo) as Equipo, 'cabreado', 1);
        this.decirReaccion(e.equipo, 'ganaLance');
        this.espera = 1800 * r;
        break;
      }
      case 'recuento':
        this.resumen.agregar(e.linea);
        if (e.linea.equipo !== null && e.linea.total > 0) {
          this.animarPiedras(e.linea.equipo, e.linea.total);
          this.espera = (650 + Math.min(e.linea.total, 10) * 90) * r;
        } else this.espera = 450 * r;
        break;
      case 'adentro': {
        const [a, b] = miembros(e.equipo);
        const quien = a === 0 ? 2 : this.rng() < 0.5 ? a : b;
        this.decir(quien, 'adentro');
        if (this.rng() < 0.4) {
          const t = LINEAS_NICANOR[2];
          this.anim.agregar({
            dur: 0,
            retardo: 900 * this.ritmo,
            alTerminar: () => {
              this.bocadillos[4] = crearBocadillo(t, { x: 222, y: 24, lado: 'derecha' }, 2200 * this.ritmo);
              this.juego.audio.voz('nicanor', 'idle', t, 2);
            },
          });
        }
        this.espera = 900 * r;
        break;
      }
      case 'fin_juego': {
        this.finJuegoPendiente = true;
        // Si el juego se acaba con un deje, se enseñan las cartas igualmente (para la curiosidad).
        if (!this.destape && this.mano) this.destapar(this.mano.manos);
        this.marcadorVisible = [e.marcador[0], e.marcador[1]];
        const nos = e.fin.ganador === 0;
        this.mostrarBanner(nos ? UI.finJuego.ganamos : UI.finJuego.perdemos, nos ? P.oros : D.copas_brillo, 2600);
        this.reaccionar(e.fin.ganador, 'contento', 1);
        this.reaccionar((1 - e.fin.ganador) as Equipo, 'cabreado', 0.7);
        this.juego.audio.sfx(nos ? 'aplauso' : 'grillos');
        this.espera = 1400 * r;
        break;
      }
      case 'fin_mano':
        // Quien se ha llevado la mano lo comenta (según el parloteo).
        if (this.mano && !this.mano.finJuego) {
          const ganado: [number, number] = [
            e.marcador[0] - this.mano.marcadorInicial[0],
            e.marcador[1] - this.mano.marcadorInicial[1],
          ];
          if (Math.abs(ganado[0] - ganado[1]) >= 3 && this.rng() < this.probabilidadCharla() * 0.6) {
            const gana: Equipo = ganado[0] > ganado[1] ? 0 : 1;
            this.decirReaccion(gana, this.rng() < 0.5 ? 'ganaLance' : 'pierdeLance');
          }
        }
        this.marcadorVisible = [e.marcador[0], e.marcador[1]];
        this.resumen.mensajeFinal = UI.recuento.seguir;
        this.resumen.visible = true;
        this.estadisticas.manos++;
        this.lanceActual = null;
        this.estado = 'continuar';
        this.grupo.poner([this.boton('continuar', UI.botones.continuar, 0, () => this.continuar(), [' ', 'enter'])]);
        break;
    }
  }

  private nombres(): string[] {
    return [UI.tu, PERSONAJES[this.ids[1]].corto, PERSONAJES[this.ids[2]].corto, PERSONAJES[this.ids[3]].corto];
  }

  private textoResultado(r: ResultadoLance): string {
    switch (r.tipo) {
      case 'paso':
        return UI.estado.paso;
      case 'querido':
        return r.ordago ? UI.estado.ordago : UI.estado.querido(r.puntos);
      case 'rechazado':
        return UI.estado.deje(r.piedras);
      case 'solo':
        return UI.estado.solo;
      case 'nadie':
        return UI.estado.nadie;
    }
  }

  private continuar(): void {
    if (this.estado !== 'continuar') return;
    this.grupo.vaciar();
    const m = this.mano!;
    this.estadisticas.piedras[0] += m.marcador[0] - m.marcadorInicial[0];
    this.estadisticas.piedras[1] += m.marcador[1] - m.marcadorInicial[1];
    this.partida.cerrarMano();
    this.estadisticas.juegos = [this.partida.juegos[0], this.partida.juegos[1]];
    if (this.op.tutorial) {
      this.estado = 'fin';
      this.op.tutorial.alSalir();
      return;
    }
    if (this.partida.terminada) {
      this.estado = 'fin';
      const ganador = this.partida.ganador!;
      this.op.alTerminar?.({ ganador, estadisticas: this.estadisticas });
      return;
    }
    this.nuevaMano();
  }

  // ---------------------------------------------------------------------------
  // Voces y reacciones
  // ---------------------------------------------------------------------------

  private probabilidadCharla(): number {
    const p = this.juego.opciones.parloteo;
    return p === 'poco' ? 0.3 : p === 'clasico' ? 1 : 0.6;
  }

  private hablar(s: Seat, voz: VozMus, cantidad?: number, lance?: Lance): void {
    const r = this.ritmo;
    const declaracion = voz === 'paresSi' || voz === 'paresNo' || voz === 'juegoSi' || voz === 'juegoNo';
    const importante = voz === 'ordago' || voz === 'quieroOrdago' || voz === 'envido' || voz === 'envidoMas';
    if (voz === 'ordago') {
      this.temblor = 300;
      this.juego.audio.sfx('golpe');
      if (s !== 0) this.bustos[s as 1 | 2 | 3].sacudida = 300;
      // Los contrarios se quedan de piedra.
      for (const o of [1, 2, 3] as const) {
        if (equipoDe(o) !== equipoDe(s)) this.bustos[o].mostrar('sorprendido', 900 * this.ritmo);
      }
    }
    // Las declaraciones son cortas y siempre iguales; el resto, con el sabor de cada uno.
    const conSabor = !declaracion && (s === 0 || this.rng() < this.probabilidadCharla() || voz === 'ordago');
    const evento: EventoVoz = voz;
    this.decir(s, evento, cantidad, conSabor, lance);
    this.espera = (declaracion ? 380 : importante ? 950 : 650) * r;
  }

  /** Dice una línea con bocadillo y voz. */
  decir(s: Seat, evento: EventoVoz, cantidad?: number, conSabor = true, _lance?: Lance): void {
    let elegida: { texto: string; indice: number; plantilla: string };
    let sabor = conSabor;
    if (s === 0) {
      elegida = this.lineas.elegirConIndice('humano', LINEAS_HUMANO[evento] ?? [''], cantidad);
      sabor = false;
    } else {
      const id = this.ids[s as 1 | 2 | 3];
      const opciones = conSabor ? LINEAS[id][evento] : (LINEAS_HUMANO[evento] ?? LINEAS[id][evento]);
      elegida = this.lineas.elegirConIndice(conSabor ? id : `${id}-neutro`, opciones, cantidad);
    }
    let linea = elegida.texto;
    if (!linea) return;
    // «Envido» a secas con cantidad distinta de 2: que se oiga la cantidad.
    if (
      evento === 'envido' &&
      cantidad &&
      cantidad !== 2 &&
      !/\d|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez/i.test(linea)
    ) {
      linea = `${linea.replace(/[.!]$/, '')} ${cantidadEnTexto(cantidad)}.`;
    }
    const quien = s === 0 ? 'humano' : this.ids[s as 1 | 2 | 3];
    // La grabación sirve si es una línea con sabor y, si lleva cantidad, ésta es la grabada («dos»).
    const grabable = sabor && (!elegida.plantilla.includes('{') || cantidad === 2);
    const dur = this.juego.audio.voz(quien, evento, linea, grabable ? elegida.indice : undefined);
    const ms = Math.max(2500 * this.ritmo, dur + 400);
    const tinta = evento === 'ordago' || evento === 'quieroOrdago' ? D.copas_osc : undefined;
    this.bocadillos[s] = crearBocadillo(linea, LAYOUT.bocadillos[s], ms, { tinta });
    if (s !== 0) this.bustos[s as 1 | 2 | 3].hablar(Math.min(ms, Math.max(500, dur)));
  }

  private decirReaccion(ganador: Equipo, evento: 'ganaLance' | 'pierdeLance'): void {
    const candidatos = ([1, 2, 3] as const).filter((s) =>
      evento === 'ganaLance' ? equipoDe(s) === ganador : equipoDe(s) !== ganador,
    );
    if (candidatos.length === 0) return;
    const s = candidatos[Math.floor(this.rng() * candidatos.length)];
    this.decir(s, evento);
  }

  private reaccionar(e: Equipo, expresion: 'contento' | 'cabreado', prob: number): void {
    for (const s of [1, 2, 3] as const) {
      if (equipoDe(s) === e && this.rng() < prob) this.bustos[s].mostrar(expresion, 1200 * this.ritmo);
    }
  }

  private charlaOciosa(): void {
    this.tSinHablar = 0;
    if (this.rng() > this.probabilidadCharla()) return;
    const s = ([1, 2, 3] as const)[Math.floor(this.rng() * 3)];
    this.decir(s, 'idle');
  }

  private mostrarBanner(t: string, color: string, ms: number): void {
    this.banner = { texto: t, color, restante: ms * this.ritmo };
  }

  // ---------------------------------------------------------------------------
  // Animaciones de cartas y piedras
  // ---------------------------------------------------------------------------

  private posDorso(s: 1 | 2 | 3, i: number): { x: number; y: number } {
    const d = LAYOUT.dorsos[s];
    return { x: d.x + d.dx * i, y: d.y + d.dy * i };
  }

  private animarReparto(a: Seat, c: Carta): void {
    const desde = origenAsiento(this.mano!.postre);
    let hasta: { x: number; y: number };
    if (a === 0) {
      const i = this.misCartas.length;
      hasta = { x: LAYOUT.cartas.xs[Math.min(i, 3)] + 13, y: LAYOUT.cartas.y + 20 };
    } else hasta = this.posDorso(a, this.dorsos[a]);
    this.mazo = Math.max(0, this.mazo - 1);
    this.juego.audio.sfx('carta', { volumen: 0.6 });
    const dorso = imagenDorso();
    this.anim.agregar({
      dur: 180 * this.ritmo,
      suavizado: suave.salida,
      capa: 5,
      dibujar: (ctx, p) => {
        ctx.drawImage(
          dorso,
          Math.round(desde.x + (hasta.x - desde.x) * p),
          Math.round(desde.y + (hasta.y - desde.y) * p),
        );
      },
      alTerminar: () => {
        if (a === 0) {
          this.misCartas.push(c);
          this.ordenarMisCartas();
        } else this.dorsos[a]++;
      },
    });
  }

  private ordenarMisCartas(): void {
    const r = this.config.reyes;
    this.misCartas.sort((x, y) => rango(y, r) - rango(x, r) || x - y);
  }

  private animarDescarte(s: Seat, cartas: Carta[]): void {
    const hasta = { x: LAYOUT.descartes.x, y: LAYOUT.descartes.y };
    this.juego.audio.sfx('descarte');
    cartas.forEach((c, k) => {
      let desde: { x: number; y: number };
      if (s === 0) {
        const i = this.misCartas.indexOf(c);
        desde = { x: LAYOUT.cartas.xs[Math.max(0, i)] + 13, y: LAYOUT.cartas.y };
      } else desde = this.posDorso(s, Math.max(0, this.dorsos[s] - 1 - k));
      const dorso = imagenDorso();
      this.anim.agregar({
        dur: 260 * this.ritmo,
        retardo: k * 60 * this.ritmo,
        suavizado: suave.entradaSalida,
        capa: 5,
        dibujar: (ctx, p) =>
          ctx.drawImage(
            dorso,
            Math.round(desde.x + (hasta.x - desde.x) * p),
            Math.round(desde.y + (hasta.y - desde.y) * p),
          ),
        alTerminar: () => {
          this.descartes++;
        },
      });
    });
    if (s === 0) this.misCartas = this.misCartas.filter((c) => !cartas.includes(c));
    else this.dorsos[s] = Math.max(0, this.dorsos[s] - cartas.length);
  }

  private animarPiedras(e: Equipo, n: number): void {
    const origen = { x: LAYOUT.cuenco.x + 9, y: LAYOUT.cuenco.y + 3 };
    const base = LAYOUT.piedras[e];
    const animadas = Math.min(n, 10);
    for (let k = 0; k < animadas; k++) {
      const ultimo = k === animadas - 1;
      const destino = posicionEnMonton(base, Math.min(this.montones[e] + k, 29));
      this.anim.agregar({
        dur: 280 * this.ritmo,
        retardo: k * 90 * this.ritmo,
        suavizado: suave.salida,
        capa: 6,
        dibujar: (ctx, p) => {
          const x = origen.x + (destino.x - origen.x) * p;
          const y = origen.y + (destino.y - origen.y) * p - Math.sin(p * Math.PI) * 12;
          dibujarPiedra(ctx, x, y, k);
        },
        alTerminar: () => {
          this.juego.audio.sfx('piedra', { tono: 0.9 + this.rng() * 0.3 });
          if (ultimo) {
            this.montones[e] += n;
            this.marcadorVisible[e] += n;
            this.resaltarMarcador[e] = 800;
          }
        },
      });
    }
  }

  /** Tras el destape, mira si los envites del humano eran farol (sólo lo usa «Difícil»). */
  private aprenderFaroles(mia: Carta[]): void {
    if (!this.mano) return;
    const t = tablas(this.config.reyes);
    for (const h of this.mano.historial) {
      if (h.jugador !== 0 || !h.lance) continue;
      if (h.voz !== 'envido' && h.voz !== 'envidoMas' && h.voz !== 'ordago') continue;
      this.modeloHumano.envites++;
      if (percentilEnLance(t, h.lance, mia) < 0.4) this.modeloHumano.faroles++;
    }
    if (this.juego.opciones.dificultad !== 'dificil') return;
    const farol = (this.modeloHumano.faroles + 1) / (this.modeloHumano.envites + 5);
    for (const s of [1, 3] as const) this.ias[s].opciones.farolHumano = farol;
  }

  private destapar(manos: Carta[][]): void {
    this.destape = manos.map((m) => [...m]);
    this.volteo = 0;
    this.juego.audio.sfx('carta');
    this.anim.agregar({
      dur: 600 * this.ritmo,
      alActualizar: (p) => (this.volteo = p),
    });
  }

  // ---------------------------------------------------------------------------
  // Cameos y Nicanor
  // ---------------------------------------------------------------------------

  /** Para pruebas: que entre alguien ya. */
  forzarCameo(id: CameoEnCurso['id']): void {
    this.cameo = new CameoEnCurso(id);
  }

  private actualizarCameo(dt: number): void {
    const c = this.cameo;
    if (!c) return;
    if (c.actualizar(dt, this.hablaCameo)) {
      const def = CAMEOS.find((k) => k.id === c.id)!;
      const l = this.lineas.elegirConIndice(`cameo-${c.id}`, def.lineas);
      const ancla = c.ancla;
      this.hablaCameo = 2600 * this.ritmo;
      this.bocadillos[5] = crearBocadillo(l.texto, { x: ancla.x, y: ancla.y, lado: 'izquierda' }, this.hablaCameo, {
        maxLineas: 3,
      });
      this.juego.audio.voz(c.id, 'cameo', l.texto, l.indice);
      if (c.id === 'perro') this.juego.audio.sfx('ladrido');
      // El turista pregunta por la ermita… y alguien grita «¡Envido!».
      const respuestas = RESPUESTAS_CAMEO[c.id];
      if (respuestas) {
        this.hablaCameo = 4200 * this.ritmo;
        const quien = ([1, 2, 3] as const)[Math.floor(this.rng() * 3)];
        const grito = respuestas[Math.floor(this.rng() * respuestas.length)];
        this.anim.agregar({
          dur: 0,
          retardo: 1300 * this.ritmo,
          alTerminar: () => {
            this.bocadillos[quien] = crearBocadillo(grito, LAYOUT.bocadillos[quien], 1500 * this.ritmo);
            this.bustos[quien].hablar(500);
            this.juego.audio.voz(this.ids[quien], 'grito', grito);
          },
        });
        const despedida = DESPEDIDA_CAMEO[c.id];
        if (despedida) {
          this.anim.agregar({
            dur: 0,
            retardo: 2600 * this.ritmo,
            alTerminar: () => {
              const t = despedida[Math.floor(this.rng() * despedida.length)];
              this.bocadillos[5] = crearBocadillo(t, { x: ancla.x, y: ancla.y, lado: 'izquierda' }, 1600 * this.ritmo);
              this.juego.audio.voz(c.id, 'cameo', t);
            },
          });
        }
      }
    }
    if (c.terminado) this.cameo = null;
  }

  // ---------------------------------------------------------------------------
  // Señas (sección 7)
  // ---------------------------------------------------------------------------

  /** Las señas se hacen durante el mus y desde que se corta hasta que empieza el lance de pares. */
  get ventanaSenas(): boolean {
    if (this.config.senas === 'off' || !this.mano || this.mano.terminada) return false;
    const f = this.mano.fase;
    if (f === 'mus' || f === 'descarte') return true;
    return this.mano.lance === 'grande' || this.mano.lance === 'chica';
  }

  /** Decide qué IA hará seña en esta ventana. Devuelve true si alguna la hará. */
  private programarSenasIA(): boolean {
    if (this.config.senas === 'off' || !this.mano) return false;
    this.senasPendientes = [];
    let alguna = false;
    for (const s of [1, 2, 3] as const) {
      const id = elegirSenaIA(
        this.mano.manos[s],
        this.config.reyes,
        this.config.senasDeLaCasa,
        this.ias[s].perfil.personalidad,
        this.rng,
      );
      if (!id) continue;
      this.senasPendientes.push({ s, id, en: this.tiempo + (150 + this.rng() * 500) * this.ritmo });
      alguna = true;
    }
    return alguna;
  }

  private actualizarSenas(dt: number): void {
    for (const k of Object.keys(this.senaEnCurso)) {
      const s = Number(k) as Seat;
      const en = this.senaEnCurso[s]!;
      en.restante -= dt;
      if (en.restante <= 0) delete this.senaEnCurso[s];
    }
    if (this.senasPendientes.length === 0) return;
    if (!this.ventanaSenas) {
      this.senasPendientes = [];
      return;
    }
    const listas = this.senasPendientes.filter((p) => p.en <= this.tiempo);
    this.senasPendientes = this.senasPendientes.filter((p) => p.en > this.tiempo);
    for (const p of listas) this.hacerSena(p.s, p.id);
  }

  /** Alguien hace una seña: la ve su compañero y quizá la cazan los rivales. */
  hacerSena(s: Seat, id: IdSena): void {
    const def = sena(id);
    const modo = this.config.senas;
    const dur = duracionSena(modo);
    const nombres = this.nombres();
    if (s === 0) {
      this.estadisticas.senasHechas++;
      this.bocadillos[0] = crearBocadillo(`(${def.gesto.toLowerCase()})`, LAYOUT.bocadillos[0], Math.max(dur, 900), {
        tinta: D.gris,
      });
      this.historial.push(`Haces la seña: ${def.gesto.toLowerCase()} (${def.quiere}).`);
      // El compañero te mira: la ha visto.
      this.bustos[2].mostrar('mirar_pareja', 700);
    } else {
      this.bustos[s as 1 | 2 | 3].mostrar(def.animacion, dur);
      if (this.juego.opciones.chivato) {
        this.historial.push(`[Chivato] ${nombres[s]}: ${def.gesto.toLowerCase()} → ${def.quiere}.`);
      }
    }
    this.senaEnCurso[s] = { id, restante: dur, pillada: false };
    const significado = def.significado;
    // Su compañero (si es IA) la recibe y se la cree.
    const comp = companero(s);
    if (comp !== 0) this.senasVistas[comp].push({ de: s, significado, deCompanero: true });
    // Los rivales IA pueden cazarla.
    const emisor = s === 0 ? undefined : this.ias[s as 1 | 2 | 3].perfil.personalidad;
    let cazador: 1 | 2 | 3 | null = null;
    for (const o of [1, 2, 3] as const) {
      if (equipoDe(o) === equipoDe(s)) continue;
      const p = probabilidadCaza(this.ias[o].perfil.personalidad, this.juego.opciones.dificultad, modo, emisor);
      if (this.rng() < p) {
        this.senasVistas[o].push({ de: s, significado, deCompanero: false });
        if (!cazador) cazador = o;
      }
    }
    if (cazador !== null) {
      if (s === 0) this.estadisticas.senasPilladas++;
      if (this.rng() < Math.max(0.5, this.probabilidadCharla())) {
        const quien = cazador;
        this.anim.agregar({ dur: 0, retardo: dur * 0.6, alTerminar: () => this.decir(quien, 'senaCazada') });
        if (s !== 0 && this.rng() < 0.6) {
          const emisorS = s;
          this.anim.agregar({
            dur: 0,
            retardo: dur * 0.6 + 1200 * this.ritmo,
            alTerminar: () => this.decir(emisorS, 'lePillanSena'),
          });
        }
      }
      this.historial.push(
        s === 0
          ? `${nombres[cazador]} te ha cazado la seña.`
          : `${nombres[cazador]} ha cazado una seña de ${nombres[s]}.`,
      );
    }
  }

  /** Extra del remake: clic en la cara de un rival mientras hace una seña. */
  private teHeVisto(s: 1 | 3): boolean {
    const en = this.senaEnCurso[s];
    if (!en || en.pillada) return false;
    en.pillada = true;
    this.estadisticas.senasCazadas++;
    const nombres = this.nombres();
    this.bocadillos[0] = crearBocadillo('¡Te he visto!', LAYOUT.bocadillos[0], 1800 * this.ritmo, { tinta: P.copas });
    this.historial.push(`Has cazado una seña de ${nombres[s]}: ${sena(en.id).quiere}.`);
    // El rival se pica: se vuelve algo más agresivo el resto de la partida.
    const pers = this.ias[s].perfil.personalidad;
    pers.agr = Math.min(1, pers.agr + 0.08);
    this.bustos[s].mostrar('cabreado', 1400 * this.ritmo);
    this.anim.agregar({ dur: 0, retardo: 700 * this.ritmo, alTerminar: () => this.decir(s, 'lePillanSena') });
    return true;
  }

  private rectMenuSenas() {
    const opciones = catalogoActivo(this.config.senasDeLaCasa);
    return { x: 4, y: 128 - (opciones.length * 11 + 16), w: 168, h: opciones.length * 11 + 14, opciones };
  }

  private elegirSenaHumano(i: number): void {
    const { opciones } = this.rectMenuSenas();
    const def = opciones[i];
    this.menuSenas = false;
    if (!def || !this.ventanaSenas) return;
    this.hacerSena(0, def.id);
  }

  // ---------------------------------------------------------------------------
  // Decisiones del humano
  // ---------------------------------------------------------------------------

  private boton(
    id: string,
    t: string,
    fila: number,
    alPulsar: () => void,
    teclas: string[],
    activo = true,
    estilo?: Boton['estilo'],
  ): Boton {
    const pa = LAYOUT.panelAcciones;
    const b = LAYOUT.boton;
    return { id, texto: t, x: pa.x, y: pa.y + fila * (b.h + b.sep), w: b.w, h: b.h, activo, teclas, alPulsar, estilo };
  }

  private mostrarDecision(d: Decision): void {
    if (this.estado === 'humano' && this.decisionMostrada === d) return;
    this.estado = 'humano';
    this.decisionMostrada = d;
    this.tSinHablar = 0;
    this.construirBotones(d);
    this.juego.audio.sfx('turno', { volumen: 0.4 });
  }

  private construirBotones(d: Decision): void {
    const B = UI.botones;
    if (d.tipo === 'mus') {
      this.grupo.poner([
        this.boton('mus', B.mus, 0, () => this.aplicar(0, { tipo: 'mus' }), ['m']),
        this.boton('noHayMus', B.noHayMus, 1, () => this.aplicar(0, { tipo: 'noHayMus' }), ['n']),
      ]);
      return;
    }
    if (d.tipo === 'descarte') {
      const n = this.seleccion.size;
      this.grupo.poner([
        this.boton(
          'descartar',
          n > 0 ? `${B.descartar} ${n}` : B.descartar,
          0,
          () => {
            if (this.seleccion.size >= 1 && this.seleccion.size <= 4)
              this.aplicar(0, { tipo: 'descarte', cartas: [...this.seleccion] });
          },
          ['d'],
          n >= 1 && n <= 4,
          'verde',
        ),
      ]);
      return;
    }
    const botones: Boton[] = [];
    let fila = 0;
    const cant = this.cantidad;
    if (d.opciones.includes('paso')) {
      botones.push(this.boton('paso', B.paso, fila++, () => this.aplicar(0, { tipo: 'paso' }), ['p']));
      botones.push(
        this.boton(
          'envido',
          `${B.envido} ${cant}`,
          fila++,
          () => this.aplicar(0, { tipo: 'envido', cantidad: this.cantidad }),
          ['e'],
        ),
      );
    } else {
      botones.push(this.boton('quiero', B.quiero, fila++, () => this.aplicar(0, { tipo: 'quiero' }), ['q']));
      botones.push(this.boton('noQuiero', B.noQuiero, fila++, () => this.aplicar(0, { tipo: 'noQuiero' }), ['x']));
      if (d.opciones.includes('envido')) {
        botones.push(
          this.boton(
            'mas',
            `${cant} ${B.envidoMas}`,
            fila++,
            () => this.aplicar(0, { tipo: 'envido', cantidad: this.cantidad }),
            ['+', 'e'],
          ),
        );
      }
    }
    if (d.opciones.includes('ordago')) {
      botones.push(
        this.boton('ordago', B.ordago, fila, () => this.aplicar(0, { tipo: 'ordago' }), ['o'], true, 'ordago'),
      );
    }
    this.grupo.poner(botones);
  }

  private get puedeElegirCantidad(): boolean {
    const d = this.decisionMostrada;
    return this.estado === 'humano' && d?.tipo === 'apuesta' && d.opciones.includes('envido');
  }

  private cambiarCantidad(delta: number): void {
    this.cantidad = Math.max(2, Math.min(10, this.cantidad + delta));
    this.juego.audio.sfx('clic', { volumen: 0.4 });
    if (this.decisionMostrada) this.construirBotones(this.decisionMostrada);
  }

  private alternarSeleccion(c: Carta): void {
    if (this.seleccion.has(c)) this.seleccion.delete(c);
    else this.seleccion.add(c);
    this.juego.audio.sfx('clic', { volumen: 0.4 });
    if (this.decisionMostrada) this.construirBotones(this.decisionMostrada);
  }

  entrada(e: EventoEntrada): void {
    if (e.tipo === 'tecla') {
      const k = e.tecla.toLowerCase();
      if (k === 'l') {
        this.verHistorial = !this.verHistorial;
        return;
      }
      if (k === 'h') {
        this.verAyuda = !this.verAyuda;
        return;
      }
      if (this.verHistorial && (k === 'escape' || k === ' ')) {
        this.verHistorial = false;
        return;
      }
      if (k === 'escape' && !this.menuSenas) {
        if (this.verAyuda) this.verAyuda = false;
        else this.op.alPausar?.();
        return;
      }
    }
    if (this.verHistorial && e.tipo === 'clic') {
      this.verHistorial = false;
      return;
    }
    // Menú de señas
    if (this.menuSenas) {
      if (e.tipo === 'tecla') {
        const k = e.tecla.toLowerCase();
        const n = Number(k);
        if (n >= 1 && n <= 7) this.elegirSenaHumano(n - 1);
        else if (k === 'escape' || k === 's') this.menuSenas = false;
        return;
      }
      if (e.tipo === 'clic') {
        const r = this.rectMenuSenas();
        if (dentro(e.x, e.y, r)) {
          const i = Math.floor((e.y - r.y - 12) / 11);
          if (i >= 0) this.elegirSenaHumano(i);
        } else this.menuSenas = false;
        return;
      }
    }
    if (e.tipo === 'tecla' && e.tecla.toLowerCase() === 's' && this.ventanaSenas) {
      this.menuSenas = true;
      return;
    }
    if (e.tipo === 'clic') {
      const pl = LAYOUT.panelLances;
      if (this.ventanaSenas && dentro(e.x, e.y, { x: pl.x + 4, y: pl.y + pl.h - 14, w: pl.w - 8, h: 11 })) {
        this.menuSenas = true;
        return;
      }
      if (this.juego.opciones.teHeVisto && this.config.senas === 'discreto') {
        for (const s of [1, 3] as const) if (dentro(e.x, e.y, LAYOUT.caras[s]) && this.teHeVisto(s)) return;
      }
    }
    if (this.grupo.entrada(e)) return;
    const d = this.decisionMostrada;
    if (e.tipo === 'tecla') {
      const k = e.tecla.toLowerCase();
      if (this.estado === 'humano' && d?.tipo === 'descarte' && ['1', '2', '3', '4'].includes(k)) {
        const c = this.misCartas[Number(k) - 1];
        if (c !== undefined) this.alternarSeleccion(c);
        return;
      }
      if (this.puedeElegirCantidad && (k === 'arrowleft' || k === '-')) this.cambiarCantidad(-1);
      if (this.puedeElegirCantidad && k === 'arrowright') this.cambiarCantidad(1);
      if (this.estado === 'continuar' && (k === ' ' || k === 'enter')) this.continuar();
      return;
    }
    if (e.tipo === 'clic') {
      if (this.estado === 'continuar') {
        this.continuar();
        return;
      }
      if (this.estado === 'humano' && d?.tipo === 'descarte') {
        for (let i = this.misCartas.length - 1; i >= 0; i--) {
          const c = this.misCartas[i];
          if (dentro(e.x, e.y, rectCarta(i, this.seleccion.has(c)))) {
            this.alternarSeleccion(c);
            return;
          }
        }
      }
      if (this.puedeElegirCantidad) {
        const s = LAYOUT.selector;
        if (dentro(e.x, e.y, { x: s.x, y: s.y, w: 14, h: s.h })) this.cambiarCantidad(-1);
        if (dentro(e.x, e.y, { x: s.x + s.w - 14, y: s.y, w: 14, h: s.h })) this.cambiarCantidad(1);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Dibujo
  // ---------------------------------------------------------------------------

  dibujar(ctx: CanvasRenderingContext2D): void {
    const t = this.juego.tiempo;
    ctx.save();
    ctx.translate(this.juego.pantalla.temblor.x, this.juego.pantalla.temblor.y);
    // Pared y bar
    ctx.drawImage(fondoBar(), 0, 0);
    dibujarFluorescente(ctx, t);
    dibujarNeon(ctx, t);
    dibujarTele(ctx, t);
    dibujarReloj(ctx);
    this.camarero.dibujar(ctx);
    this.cameo?.dibujar(ctx);
    dibujarPizarra(ctx, this.marcadorVisible, this.partida.juegos, juegosParaGanar(this.config), this.resaltarMarcador);
    // Compañero (norte), por detrás de la mesa
    const bn = LAYOUT.bustos[2];
    this.bustos[2].dibujar(ctx, bn.x, bn.y, MESA_Y - bn.y);
    // Mesa: se redibuja la franja de la mesa por encima del busto norte
    ctx.drawImage(fondoBar(), 0, MESA_Y, 320, 200 - MESA_Y, 0, MESA_Y, 320, 200 - MESA_Y);
    // Rivales laterales, delante del canto de la mesa
    const bo = LAYOUT.bustos[3];
    const be = LAYOUT.bustos[1];
    this.bustos[3].dibujar(ctx, bo.x, bo.y);
    this.bustos[1].dibujar(ctx, be.x, be.y);
    this.destellosLentejuelas(ctx);
    this.dibujarCentroMesa(ctx);
    this.dibujarDorsosYDestape(ctx);
    dibujarMonton(ctx, LAYOUT.piedras[0], this.montones[0]);
    dibujarMonton(ctx, LAYOUT.piedras[1], this.montones[1]);
    this.dibujarFichas(ctx);
    this.dibujarMisCartas(ctx);
    this.anim.dibujar(ctx);
    this.dibujarPanelLances(ctx);
    this.dibujarPanelAcciones(ctx);
    this.resumen.dibujar(ctx);
    for (const s of [3, 1, 2, 0, 4, 5] as const) {
      const b = this.bocadillos[s];
      if (b) dibujarBocadillo(ctx, b);
    }
    this.dibujarBanner(ctx);
    if (this.op.titulo) {
      const w = [...this.op.titulo].length * 6 + 6;
      caja(ctx, 316 - w, 36, w, 11, P.negro);
      caja(ctx, 317 - w, 37, w - 2, 9, P.papel);
      texto(ctx, this.op.titulo, 313, 38, P.copas, { alinear: 'derecha' });
    }
    if (this.op.tutorial) this.dibujarPista(ctx);
    if (this.menuSenas) this.dibujarMenuSenas(ctx);
    if (this.verAyuda) this.dibujarAyuda(ctx);
    if (this.verHistorial || this.juego.opciones.historialVisible) this.dibujarHistorial(ctx, this.verHistorial);
    ctx.restore();
  }

  /** Ciclo de paleta en el vestido de lentejuelas de Marisa: destellos que van cambiando. */
  private destellosLentejuelas(ctx: CanvasRenderingContext2D): void {
    const ciclo = [P.fluorescente, P.neon, D.blanco, D.oros_brillo];
    for (const s of [1, 2, 3] as const) {
      if (this.ids[s] !== 'marisa') continue;
      const r = LAYOUT.bustos[s];
      const fase = Math.floor(this.juego.tiempo / 120);
      for (let k = 0; k < 5; k++) {
        const x = r.x + 18 + ((k * 13 + fase * 7) % 26);
        const y = r.y + r.h - 16 + ((k * 5 + fase * 3) % 12);
        if (s === 2 && y >= MESA_Y) continue;
        ctx.fillStyle = ciclo[(fase + k) % ciclo.length];
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  private dibujarCentroMesa(ctx: CanvasRenderingContext2D): void {
    const dorso = imagenDorso();
    const nm = Math.ceil(this.mazo / 6);
    for (let k = 0; k < nm; k++) ctx.drawImage(dorso, LAYOUT.mazo.x, LAYOUT.mazo.y - k);
    const nd = Math.min(8, this.descartes);
    for (let k = 0; k < nd; k++) {
      ctx.drawImage(dorso, LAYOUT.descartes.x + ((k * 3) % 5) - 2, LAYOUT.descartes.y + ((k * 2) % 3) - k * 0.5);
    }
    dibujarCuenco(ctx);
  }

  private dibujarDorsosYDestape(ctx: CanvasRenderingContext2D): void {
    const dorso = imagenDorso();
    for (const s of [2, 3, 1] as const) {
      if (this.destape) {
        const d = LAYOUT.destape[s];
        this.destape[s].forEach((c, i) => {
          const x = d.x + d.dx * i;
          const y = d.y + (s === 2 ? 0 : i);
          const p = Math.max(0, Math.min(1, this.volteo * 1.6 - i * 0.15));
          dibujarVolteo(ctx, imagenMini(c), imagenReversoMini(), x, y, p);
        });
        continue;
      }
      for (let i = 0; i < this.dorsos[s]; i++) {
        const p = this.posDorso(s, i);
        ctx.drawImage(dorso, p.x, p.y);
      }
    }
  }

  private dibujarFichas(ctx: CanvasRenderingContext2D): void {
    if (!this.mano) return;
    const ficha = (s: Seat, letra: string, fondo: string) => {
      const f = LAYOUT.fichas[s];
      caja(ctx, f.x + 1, f.y, 7, 9, P.negro);
      caja(ctx, f.x, f.y + 1, 9, 7, P.negro);
      caja(ctx, f.x + 1, f.y + 1, 7, 7, fondo);
      texto(ctx, letra, f.x + 2, f.y + 1, P.tinta);
    };
    ficha(this.mano.mano, 'M', P.papel);
    ficha(this.mano.postre, 'P', D.copas_brillo);
  }

  private dibujarMisCartas(ctx: CanvasRenderingContext2D): void {
    const descartando = this.estado === 'humano' && this.decisionMostrada?.tipo === 'descarte';
    const raton = this.juego.entrada.raton;
    this.misCartas.forEach((c, i) => {
      const sel = this.seleccion.has(c);
      const r = rectCarta(i, sel);
      ctx.drawImage(imagenCarta(c), r.x, r.y);
      if (descartando) {
        const hover = raton.dentro && dentro(raton.x, raton.y, r);
        if (sel) marco(ctx, r.x - 1, r.y - 1, CARTA_W + 2, CARTA_H + 2, P.oros);
        else if (hover) marco(ctx, r.x - 1, r.y - 1, CARTA_W + 2, CARTA_H + 2, P.tiza);
        texto(ctx, String(i + 1), r.x + CARTA_W - 7, r.y + CARTA_H - 10, P.tiza_sombra);
      }
    });
    // Pulgares sujetando las cartas (como en primera persona)
    if (this.misCartas.length > 0) {
      const piel = P.piel_1;
      for (const [x, y] of [
        [LAYOUT.cartas.xs[0] - 4, 186],
        [LAYOUT.cartas.xs[3] + CARTA_W - 8, 186],
      ]) {
        caja(ctx, x, y, 12, 14, P.negro);
        caja(ctx, x + 1, y + 1, 10, 13, piel);
        caja(ctx, x + 3, y + 2, 6, 4, D.piel_1_luz);
        caja(ctx, x + 1, y + 10, 10, 1, D.piel_1_sombra);
      }
    }
  }

  private dibujarPanelLances(ctx: CanvasRenderingContext2D): void {
    const { x, y, w, h } = LAYOUT.panelLances;
    panelPizarra(ctx, x, y, w, h);
    LANCES_PANEL.forEach((l, i) => {
      const lance: Lance = l === 'juego' && this.hayPunto ? 'punto' : l;
      const ly = y + 3 + i * 11;
      const actual = this.lanceActual === lance;
      const color = actual ? P.oros : P.tiza;
      if (actual) texto(ctx, '▸', x + 1, ly, P.oros);
      texto(ctx, UI.lances[lance], x + 7, ly, color, { variante: 'tiza' });
      let estado = this.estadoLances[lance] ?? '';
      if (actual && this.mano?.apuesta && this.mano.apuesta.apostadoPor !== null) {
        estado = this.mano.apuesta.ordago ? UI.estado.ordago : UI.estado.envite(this.mano.apuesta.apuestaVigente);
      }
      if (estado)
        texto(ctx, estado, x + w - 3, ly, actual ? P.oros : P.tiza_sombra, { alinear: 'derecha', variante: 'tiza' });
    });
    // Botón de señas
    if (this.config.senas === 'off') return;
    const activo = this.ventanaSenas && this.estado !== 'continuar';
    const raton = this.juego.entrada.raton;
    const bs = { x: x + 4, y: y + h - 14, w: w - 8, h: 11 };
    const hover = activo && raton.dentro && dentro(raton.x, raton.y, bs);
    caja(ctx, bs.x, bs.y, bs.w, bs.h, P.negro);
    caja(ctx, bs.x + 1, bs.y + 1, bs.w - 2, bs.h - 2, !activo ? D.pizarra_clara : hover ? D.bastos_brillo : P.bastos);
    texto(ctx, `${UI.botones.senas} (S)`, bs.x + bs.w / 2, bs.y + 2, activo ? P.papel : P.tiza_sombra, {
      alinear: 'centro',
    });
  }

  private dibujarPanelAcciones(ctx: CanvasRenderingContext2D): void {
    if (this.puedeElegirCantidad) {
      const s = LAYOUT.selector;
      panelPizarra(ctx, s.x, s.y, s.w, s.h);
      texto(ctx, '−', s.x + 4, s.y + 2, P.tiza);
      texto(ctx, '+', s.x + s.w - 9, s.y + 2, P.tiza);
      texto(ctx, String(this.cantidad), s.x + s.w / 2, s.y + 2, P.oros, { alinear: 'centro' });
    }
    this.grupo.focoVisible = this.juego.entrada.modoTeclado;
    this.grupo.dibujar(ctx, this.juego.entrada.raton);
    if (this.estado === 'pensando' || (this.estado === 'eventos' && this.grupo.botones.length === 0)) {
      const pa = LAYOUT.panelAcciones;
      if (this.estado === 'pensando' && Math.floor(this.tiempo / 400) % 2 === 0) {
        texto(ctx, '…', pa.x + pa.w / 2, pa.y + 26, P.tinta, { alinear: 'centro' });
      }
    }
  }

  private dibujarBanner(ctx: CanvasRenderingContext2D): void {
    if (!this.banner) return;
    const b = this.banner;
    const grande = [...b.texto].length <= 12;
    const escala = grande ? 2 : 1;
    const ancho = [...b.texto].length * 7 * escala + 12;
    const x = 160 - ancho / 2;
    const y = 58;
    const h = grande ? 26 : 16;
    caja(ctx, x, y, ancho, h, P.negro);
    caja(ctx, x + 1, y + 1, ancho - 2, h - 2, P.pizarra);
    texto(ctx, b.texto, 160, y + (grande ? 5 : 4), b.color, {
      alinear: 'centro',
      negrita: true,
      escala,
      sombra: P.negro,
    });
  }

  private dibujarAyuda(ctx: CanvasRenderingContext2D): void {
    const d = this.decisionMostrada;
    let ayuda: string = UI.ayuda.esperando;
    if (this.estado === 'continuar') ayuda = UI.ayuda.continuar;
    else if (d?.tipo === 'mus') ayuda = UI.ayuda.mus;
    else if (d?.tipo === 'descarte') ayuda = UI.ayuda.descarte;
    else if (d?.tipo === 'apuesta') ayuda = d.opciones.includes('paso') ? UI.ayuda.apertura : UI.ayuda.respuesta;
    const w = [...ayuda].length * 6 + 8;
    caja(ctx, 160 - w / 2, 46, w, 12, P.negro);
    caja(ctx, 160 - w / 2 + 1, 47, w - 2, 10, P.pizarra);
    texto(ctx, ayuda, 160, 48, P.tiza, { alinear: 'centro' });
  }

  private dibujarMenuSenas(ctx: CanvasRenderingContext2D): void {
    const r = this.rectMenuSenas();
    panelPizarra(ctx, r.x, r.y, r.w, r.h);
    texto(ctx, 'SEÑAS AL COMPAÑERO', r.x + r.w / 2, r.y + 2, P.oros, { alinear: 'centro', variante: 'tiza' });
    const raton = this.juego.entrada.raton;
    r.opciones.forEach((def, i) => {
      const y = r.y + 13 + i * 11;
      const hover = raton.dentro && dentro(raton.x, raton.y, { x: r.x, y: y - 1, w: r.w, h: 11 });
      if (hover) caja(ctx, r.x + 1, y - 1, r.w - 2, 10, D.pizarra_clara);
      texto(ctx, `${i + 1}`, r.x + 3, y, P.oros);
      texto(ctx, def.gesto, r.x + 11, y, P.tiza, { variante: 'tiza' });
    });
    // Significado de la seña bajo el ratón
    const i = Math.floor((raton.y - r.y - 12) / 11);
    const def = raton.dentro && dentro(raton.x, raton.y, r) ? r.opciones[i] : undefined;
    if (def) {
      const t = `= ${def.quiere}`;
      caja(ctx, r.x + r.w + 2, r.y + 13 + i * 11 - 2, [...t].length * 6 + 5, 11, P.negro);
      caja(ctx, r.x + r.w + 3, r.y + 13 + i * 11 - 1, [...t].length * 6 + 3, 9, P.papel);
      texto(ctx, t, r.x + r.w + 5, r.y + 13 + i * 11, P.tinta);
    }
  }

  private dibujarHistorial(ctx: CanvasRenderingContext2D, completo: boolean): void {
    const x = completo ? 40 : 84;
    const y = completo ? 16 : 2;
    const w = completo ? 240 : 152;
    const h = completo ? 150 : 44;
    hojaLibreta(ctx, x, y, w, h);
    const maxC = Math.floor((w - 20) / 6);
    const lineas = this.historial.flatMap((l) => envolver(l, maxC));
    const caben = Math.floor((h - 16) / (ALTO_LINEA - 1));
    const vis = lineas.slice(-caben);
    if (completo) texto(ctx, UI.historial.titulo, x + w / 2, y + 3, P.copas, { alinear: 'centro' });
    if (vis.length === 0) texto(ctx, UI.historial.vacio, x + 14, y + 14, D.gris);
    vis.forEach((l, i) => texto(ctx, l, x + 14, y + (completo ? 14 : 4) + i * (ALTO_LINEA - 1), P.tinta));
  }

  // Acceso para pruebas automáticas
  get depuracion() {
    return {
      estado: this.estado,
      decision: this.decisionMostrada,
      misCartas: [...this.misCartas],
      marcador: [...this.partida.marcador],
      juegos: [...this.partida.juegos],
      mano: this.partida.numeroMano,
      animaciones: this.anim.cuantas,
      ventanaSenas: this.ventanaSenas,
      senasVistas: this.senasVistas,
    };
  }

  /** Nombre del equipo, para pantallas de fin. */
  static nombreEquipo(e: Equipo): string {
    return NOMBRE_EQUIPO[e];
  }

  private dibujarPista(ctx: CanvasRenderingContext2D): void {
    const d = this.estado === 'humano' ? this.decisionMostrada : null;
    const pista = this.op.tutorial!.pista(this.estado === 'continuar' ? null : d, this);
    if (!pista) return;
    const lineas = envolver(pista, 34);
    const h = lineas.length * 10 + 6;
    const x = 84;
    const y = 2;
    caja(ctx, x, y, 212, h, P.negro);
    caja(ctx, x + 1, y + 1, 210, h - 2, D.crema_boton);
    lineas.forEach((l, i) => texto(ctx, l, x + 4, y + 4 + i * 10, P.tinta));
  }

  /** Hojas y expresiones de los tres para la viñeta del final. */
  bustosParaFinal(): { ids: Record<1 | 2 | 3, IdPersonaje> } {
    return { ids: { ...this.ids } };
  }

  get companeroSeat(): Seat {
    return companero(0);
  }
}

function cantidadEnTexto(n: number): string {
  const t = ['cero', 'una', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez'];
  return t[n] ?? String(n);
}

export { DORSO_W, DORSO_H };
