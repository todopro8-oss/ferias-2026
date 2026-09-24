// La mesa (sección 10): orquesta motor → eventos → animaciones y voces → entrada.
// El motor avanza de golpe hasta la siguiente decisión; aquí se reproducen sus eventos
// uno a uno, con su ritmo, y sólo después se pide la siguiente decisión (humano o IA).

import { crearJugador } from '../ai/fabrica';
import type { JugadorMus } from '../ai/jugadorMus';
import { vistaPara, type SenaVista } from '../ai/view';
import { hojaPersonaje } from '../core/assets';
import { ALTO_LINEA, envolver, texto } from '../core/bitmapFont';
import type { EventoEntrada } from '../core/input';
import { dentro } from '../core/input';
import { configDeOpciones, ritmo, type Juego } from '../core/juego';
import { derivarSemilla, mulberry32, type Rng } from '../core/rng';
import type { Escena } from '../core/sceneManager';
import { Animador, suave } from '../core/tween';
import { PERSONAJES, type IdPersonaje } from '../data/characters';
import { LINEAS, LINEAS_NICANOR, type EventoVoz } from '../data/lines.es';
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
  senasHechas: number;
  senasCazadas: number;
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
  private bocadillos: Partial<Record<Seat | 4, Bocadillo>> = {};
  private banner: { texto: string; color: string; restante: number } | null = null;
  private historial: string[] = [];
  private verHistorial = false;
  private verAyuda = false;
  private tiempo = 0;
  private tSinHablar = 0;
  private temblor = 0;
  finJuegoPendiente = false;
  senasVistas: Record<Seat, SenaVista[]> = { 0: [], 1: [], 2: [], 3: [] };
  readonly estadisticas: EstadisticasPartida = {
    manos: 0,
    ordagosLanzados: 0,
    ordagosAceptados: 0,
    senasHechas: 0,
    senasCazadas: 0,
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
    this.partida = new PartidaMus(this.config, mulberry32(derivarSemilla(this.rng)));
    this.ids = { 1: op.rivales[0], 2: op.companero, 3: op.rivales[1] };
    const crear = (s: 1 | 2 | 3) =>
      crearJugador(
        {
          personalidad: PERSONAJES[this.ids[s]].stats,
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
    this.mano = this.partida.nuevaMano();
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
    this.marcadorVisible = [this.partida.marcador[0], this.partida.marcador[1]];
    this.montones = [this.partida.marcador[0], this.partida.marcador[1]];
    this.estado = 'eventos';
    this.cola.push(...this.mano.sacarEventos());
    // Nicanor comenta de vez en cuando al empezar la mano.
    if (this.partida.numeroMano > 0 && this.rng() < 0.18) {
      this.bocadillos[4] = crearBocadillo(
        this.lineas.elegir('nicanor', LINEAS_NICANOR),
        { x: 222, y: 24, lado: 'derecha' },
        2600,
      );
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
        this.espera = 250 * r;
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
        this.espera = 200 * r;
        break;
      case 'lance_inicio':
        this.lanceActual = e.lance;
        if (e.lance === 'punto') this.hayPunto = true;
        this.espera = 300 * r;
        break;
      case 'lance_fin':
        this.estadoLances[e.lance] = this.textoResultado(e.resultado);
        if (e.lance === 'pares' || e.lance === 'juego') this.lanceActual = null;
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
        this.espera = 900 * r;
        break;
      }
      case 'fin_juego': {
        this.finJuegoPendiente = true;
        this.marcadorVisible = [e.marcador[0], e.marcador[1]];
        const nos = e.fin.ganador === 0;
        this.mostrarBanner(nos ? UI.finJuego.ganamos : UI.finJuego.perdemos, nos ? P.oros : D.copas_brillo, 2600);
        this.reaccionar(e.fin.ganador, 'contento', 1);
        this.reaccionar((1 - e.fin.ganador) as Equipo, 'cabreado', 0.7);
        this.juego.audio.sfx(nos ? 'aplauso' : 'murmullo');
        this.espera = 1400 * r;
        break;
      }
      case 'fin_mano':
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
    }
    // Las declaraciones son cortas y siempre iguales; el resto, con el sabor de cada uno.
    const conSabor = !declaracion && (s === 0 || this.rng() < this.probabilidadCharla() || voz === 'ordago');
    const evento: EventoVoz = voz;
    this.decir(s, evento, cantidad, conSabor, lance);
    this.espera = (declaracion ? 380 : importante ? 950 : 650) * r;
  }

  /** Dice una línea con bocadillo y voz. */
  decir(s: Seat, evento: EventoVoz, cantidad?: number, conSabor = true, _lance?: Lance): void {
    let linea: string;
    if (s === 0) {
      linea = this.lineas.elegir('humano', LINEAS_HUMANO[evento] ?? [''], cantidad);
    } else {
      const id = this.ids[s as 1 | 2 | 3];
      const opciones = conSabor ? LINEAS[id][evento] : (LINEAS_HUMANO[evento] ?? LINEAS[id][evento]);
      linea = this.lineas.elegir(conSabor ? id : `${id}-neutro`, opciones, cantidad);
    }
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
    const dur = this.juego.audio.voz(quien, evento, linea);
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
    }
    if (this.verHistorial && e.tipo === 'clic') {
      this.verHistorial = false;
      return;
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
    for (const s of [3, 1, 2, 0, 4] as const) {
      const b = this.bocadillos[s];
      if (b) dibujarBocadillo(ctx, b);
    }
    this.dibujarBanner(ctx);
    if (this.op.titulo) texto(ctx, this.op.titulo, 316, 38, P.tinta, { alinear: 'derecha' });
    if (this.verAyuda) this.dibujarAyuda(ctx);
    if (this.verHistorial || this.juego.opciones.historialVisible) this.dibujarHistorial(ctx, this.verHistorial);
    ctx.restore();
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
    // Botón de señas (se activa en H5)
    const bs = { x: x + 4, y: y + h - 14, w: w - 8, h: 11 };
    caja(ctx, bs.x, bs.y, bs.w, bs.h, D.pizarra_clara);
    texto(ctx, UI.botones.senas, bs.x + bs.w / 2, bs.y + 2, P.tiza_sombra, { alinear: 'centro' });
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
    };
  }

  /** Nombre del equipo, para pantallas de fin. */
  static nombreEquipo(e: Equipo): string {
    return NOMBRE_EQUIPO[e];
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
