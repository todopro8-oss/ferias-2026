// Máquina de estados de una mano de mus (sección 5).
//
// REPARTO → MUS ─┬─ (los 4 piden mus) → DESCARTE → REPOSICION → MUS …
//                └─ (no hay mus) → GRANDE → CHICA → DECL_PARES → PARES? → DECL_JUEGO → JUEGO | PUNTO
//                                  → DESTAPE → RECUENTO → FIN_MANO
// En cualquier lance: ORDAGO_ACEPTADO → DESTAPE_ORDAGO → FIN_JUEGO
// En cualquier rechazo que alcance puntosJuego: FIN_JUEGO
//
// El motor avanza solo hasta la siguiente decisión y deja en una cola los eventos que ha
// producido. La escena los consume a su ritmo (animaciones, voces) y sólo entonces pide la
// siguiente decisión: ése es el «ack».

import type { Rng } from '../core/rng';
import { aplicarApuesta, iniciarApuesta, opcionesApuesta, vozDeAccion, type EstadoApuesta } from './betting';
import { barajaCompleta, barajar, TOTAL_CARTAS, type Carta } from './cards';
import { equipoDe, ordenDesde, siguiente, type Equipo, type MusConfig, type Seat } from './config';
import { ganadorLance, tieneJugada, type Lance } from './evaluate';
import { calcularRecuento } from './scoring';
import type {
  Accion,
  Decision,
  EventoMus,
  FinJuego,
  LineaRecuento,
  RegistroHabla,
  ResultadoLance,
  VozMus,
} from './types';

export interface OpcionesMano {
  config: MusConfig;
  postre: Seat;
  /** Marcador del juego al empezar la mano (piedras de cada equipo). */
  marcador: [number, number];
  rng: Rng;
  /** Primera mano del juego (afecta al mus corrido). */
  primeraDelJuego?: boolean;
  /** Para tests y tutoriales: manos ya repartidas (índice = asiento). */
  manos?: Carta[][];
  /** Para tests: orden exacto del mazo tras repartir (se roba del principio). */
  mazo?: Carta[];
}

type Fase = 'mus' | 'descarte' | 'apuesta' | 'fin';

export class ManoMus {
  readonly config: MusConfig;
  postre: Seat;
  mano: Seat;
  readonly manos: Carta[][] = [[], [], [], []];
  mazo: Carta[];
  /** Descartes acumulados (se rebarajan si el mazo no alcanza). */
  descartes: Carta[] = [];
  fase: Fase = 'mus';
  lance: Lance | null = null;
  apuesta: EstadoApuesta | null = null;
  /** Ronda de mus actual (0 = la del reparto). */
  rondaMus = 0;
  /** Información pública: cuántas cartas descartó cada asiento en cada ronda. */
  readonly descartesPorRonda: number[][] = [];
  readonly resultados: Partial<Record<Lance, ResultadoLance>> = {};
  /** Declaraciones públicas de pares y de juego (índice = asiento). */
  readonly declaraciones: { pares: boolean[] | null; juego: boolean[] | null } = { pares: null, juego: null };
  participantesPares: Seat[] = [];
  participantesJuego: Seat[] = [];
  /** null hasta la declaración de juego; false si se juega al punto. */
  hayJuego: boolean | null = null;
  readonly marcador: [number, number];
  readonly marcadorInicial: [number, number];
  finJuego: FinJuego | null = null;
  recuento: LineaRecuento[] = [];
  readonly historial: RegistroHabla[] = [];
  /** Información privada: cartas que ha descartado cada asiento en esta mano. */
  readonly descartadas: Carta[][] = [[], [], [], []];
  /** Público: si en algún momento se han rebarajado los descartes. */
  rebarajado = false;
  destapada = false;

  private turnoIdx = 0;
  private readonly primeraDelJuego: boolean;
  private readonly rng: Rng;
  private cola: EventoMus[] = [];
  private readonly todos: EventoMus[] = [];

  constructor(op: OpcionesMano) {
    this.config = op.config;
    this.postre = op.postre;
    this.mano = siguiente(op.postre);
    this.marcador = [op.marcador[0], op.marcador[1]];
    this.marcadorInicial = [op.marcador[0], op.marcador[1]];
    this.primeraDelJuego = op.primeraDelJuego ?? false;
    this.rng = op.rng;

    this.emitir({ tipo: 'inicio_mano', postre: this.postre, mano: this.mano, marcador: this.copiaMarcador() });
    if (op.manos) {
      const usadas = new Set(op.manos.flat());
      if (usadas.size !== 16 || op.manos.some((m) => m.length !== 4)) throw new Error('Manos fijadas no válidas');
      this.mazo = op.mazo
        ? [...op.mazo]
        : barajar(
            barajaCompleta().filter((c) => !usadas.has(c)),
            this.rng,
          );
      for (let vuelta = 0; vuelta < 4; vuelta++) {
        for (const s of ordenDesde(this.mano)) {
          const c = op.manos[s][vuelta];
          this.manos[s].push(c);
          this.emitir({ tipo: 'carta_repartida', a: s, carta: c, reposicion: false });
        }
      }
    } else {
      this.mazo = op.mazo ? [...op.mazo] : barajar(barajaCompleta(), this.rng);
      this.emitir({ tipo: 'baraja' });
      // Carta a carta, cuatro vueltas, empezando por la mano.
      for (let vuelta = 0; vuelta < 4; vuelta++) {
        for (const s of ordenDesde(this.mano)) {
          const c = this.robar();
          this.manos[s].push(c);
          this.emitir({ tipo: 'carta_repartida', a: s, carta: c, reposicion: false });
        }
      }
    }
    this.comprobarInvariante();
    this.emitir({ tipo: 'fase_mus', ronda: 0 });
  }

  // ---------------------------------------------------------------------------
  // API pública
  // ---------------------------------------------------------------------------

  get terminada(): boolean {
    return this.fase === 'fin';
  }

  /** Orden de habla actual (desde la mano). */
  get orden(): Seat[] {
    return ordenDesde(this.mano);
  }

  /** Qué decisión espera el motor, o null si la mano ha terminado. */
  pendiente(): Decision | null {
    switch (this.fase) {
      case 'mus':
        return { tipo: 'mus', jugador: this.orden[this.turnoIdx] };
      case 'descarte':
        return { tipo: 'descarte', jugador: this.orden[this.turnoIdx] };
      case 'apuesta': {
        const a = this.apuesta!;
        return {
          tipo: 'apuesta',
          jugador: a.turno!,
          lance: this.lance!,
          opciones: opcionesApuesta(a),
          apuestaVigente: a.apuestaVigente,
          ordago: a.ordago,
        };
      }
      case 'fin':
        return null;
    }
  }

  /** Aplica la acción del jugador al que le toca y avanza hasta la siguiente decisión. */
  actuar(jugador: Seat, accion: Accion): void {
    const d = this.pendiente();
    if (!d) throw new Error('La mano ya ha terminado');
    if (d.jugador !== jugador) throw new Error(`No es el turno del jugador ${jugador} (le toca a ${d.jugador})`);

    switch (d.tipo) {
      case 'mus':
        if (accion.tipo === 'mus') return this.decirMus(jugador);
        if (accion.tipo === 'noHayMus') return this.cortarMus(jugador);
        throw new Error(`En la fase de mus no se puede «${accion.tipo}»`);
      case 'descarte':
        if (accion.tipo !== 'descarte') throw new Error(`Ahora toca descartar, no «${accion.tipo}»`);
        return this.descartar(jugador, accion.cartas);
      case 'apuesta':
        if (
          accion.tipo === 'mus' ||
          accion.tipo === 'noHayMus' ||
          accion.tipo === 'descarte' ||
          !d.opciones.includes(accion.tipo)
        ) {
          throw new Error(`Acción no válida en el lance de ${d.lance}: ${accion.tipo}`);
        }
        return this.apostar(jugador, accion);
    }
  }

  /** Saca los eventos pendientes de consumir (la cola queda vacía). */
  sacarEventos(): EventoMus[] {
    const ev = this.cola;
    this.cola = [];
    return ev;
  }

  /** Todos los eventos desde el principio de la mano (historial completo). */
  get eventos(): readonly EventoMus[] {
    return this.todos;
  }

  /** Invariante: siempre hay 40 cartas únicas entre mazo, manos y descartes. */
  comprobarInvariante(): void {
    const todas = [...this.mazo, ...this.descartes, ...this.manos.flat()];
    if (todas.length !== TOTAL_CARTAS || new Set(todas).size !== TOTAL_CARTAS) {
      throw new Error(`Invariante de baraja roto: ${todas.length} cartas, ${new Set(todas).size} únicas`);
    }
    if (todas.some((c) => c < 0 || c >= TOTAL_CARTAS)) throw new Error('Carta fuera de rango');
  }

  // ---------------------------------------------------------------------------
  // Mus y descartes
  // ---------------------------------------------------------------------------

  private decirMus(jugador: Seat): void {
    this.hablar(jugador, 'mus');
    this.turnoIdx++;
    if (this.turnoIdx < 4) return;
    // Los cuatro han pedido mus: a descartar, empezando por la mano.
    this.fase = 'descarte';
    this.turnoIdx = 0;
    this.descartesPorRonda.push([0, 0, 0, 0]);
  }

  private descartar(jugador: Seat, cartas: Carta[]): void {
    if (cartas.length < 1 || cartas.length > 4) throw new Error('Hay que descartar de 1 a 4 cartas');
    if (new Set(cartas).size !== cartas.length) throw new Error('Cartas repetidas en el descarte');
    const mano = this.manos[jugador];
    for (const c of cartas) if (!mano.includes(c)) throw new Error(`El jugador ${jugador} no tiene esa carta`);
    this.manos[jugador] = mano.filter((c) => !cartas.includes(c));
    this.descartes.push(...cartas);
    this.descartadas[jugador].push(...cartas);
    this.descartesPorRonda[this.descartesPorRonda.length - 1][jugador] = cartas.length;
    this.historial.push({ jugador, voz: 'descarte', cantidad: cartas.length, rondaMus: this.rondaMus });
    this.emitir({ tipo: 'habla', jugador, voz: 'descarte', cantidad: cartas.length });
    this.emitir({ tipo: 'descarte', jugador, cartas: [...cartas] });
    this.turnoIdx++;
    if (this.turnoIdx < 4) return;
    this.reponer();
  }

  /** El postre repone en orden desde la mano. */
  private reponer(): void {
    for (const s of this.orden) {
      while (this.manos[s].length < 4) {
        const c = this.robar();
        this.manos[s].push(c);
        this.emitir({ tipo: 'carta_repartida', a: s, carta: c, reposicion: true });
      }
    }
    this.comprobarInvariante();
    this.rondaMus++;
    if (this.config.musCorrido && this.primeraDelJuego) {
      this.postre = this.mano;
      this.mano = siguiente(this.mano);
      this.emitir({ tipo: 'mano_avanza', mano: this.mano, postre: this.postre });
    }
    this.fase = 'mus';
    this.turnoIdx = 0;
    this.emitir({ tipo: 'fase_mus', ronda: this.rondaMus });
  }

  private robar(): Carta {
    if (this.mazo.length === 0) {
      // Se barajan todos los descartes acumulados (nunca las cartas en mano).
      if (this.descartes.length === 0) throw new Error('No quedan cartas ni en el mazo ni en los descartes');
      this.mazo = barajar(this.descartes, this.rng);
      this.descartes = [];
      this.rebarajado = true;
      this.emitir({ tipo: 'rebarajar_descartes', cartas: this.mazo.length });
    }
    return this.mazo.shift()!;
  }

  private cortarMus(jugador: Seat): void {
    this.hablar(jugador, 'noHayMus');
    this.emitir({ tipo: 'corte_mus', jugador });
    this.abrirLance('grande');
  }

  // ---------------------------------------------------------------------------
  // Lances
  // ---------------------------------------------------------------------------

  private abrirLance(lance: Lance): void {
    this.lance = lance;
    if (lance === 'grande' || lance === 'chica' || lance === 'punto') {
      this.empezarApuesta(lance, this.orden);
      return;
    }
    // Pares o juego: primero se declara, desde la mano. Es información pública.
    const decl: boolean[] = [false, false, false, false];
    for (const s of this.orden) {
      decl[s] = tieneJugada(lance, this.manos[s], this.config.reyes);
      const voz: VozMus = lance === 'pares' ? (decl[s] ? 'paresSi' : 'paresNo') : decl[s] ? 'juegoSi' : 'juegoNo';
      this.hablar(s, voz, { lance });
    }
    const con = this.orden.filter((s) => decl[s]);
    if (lance === 'pares') {
      this.declaraciones.pares = decl;
      this.participantesPares = con;
    } else {
      this.declaraciones.juego = decl;
      this.participantesJuego = con;
      this.hayJuego = con.length > 0;
    }
    const equipos = new Set(con.map(equipoDe));
    if (equipos.size === 2) {
      this.empezarApuesta(lance, con);
    } else if (equipos.size === 1) {
      this.cerrarLance(lance, { tipo: 'solo', equipo: equipoDe(con[0]) });
    } else if (lance === 'pares') {
      this.cerrarLance(lance, { tipo: 'nadie' });
    } else {
      // Nadie tiene juego: se juega al punto y hablan los cuatro.
      this.abrirLance('punto');
    }
  }

  private empezarApuesta(lance: Lance, participantes: Seat[]): void {
    this.lance = lance;
    this.apuesta = iniciarApuesta(participantes);
    this.fase = 'apuesta';
    this.emitir({ tipo: 'lance_inicio', lance, participantes: [...participantes] });
  }

  private apostar(jugador: Seat, accion: Accion & { tipo: 'paso' | 'envido' | 'quiero' | 'noQuiero' | 'ordago' }) {
    const antes = this.apuesta!;
    const voz = vozDeAccion(antes, accion);
    const despues = aplicarApuesta(antes, jugador, accion);
    this.apuesta = despues;
    const cantidad = accion.tipo === 'envido' ? accion.cantidad : undefined;
    const total = accion.tipo === 'envido' ? despues.apuestaVigente : undefined;
    this.hablar(jugador, voz, { lance: this.lance!, cantidad, total });
    if (despues.resultado) this.cerrarLance(this.lance!, despues.resultado);
  }

  private cerrarLance(lance: Lance, resultado: ResultadoLance): void {
    this.resultados[lance] = resultado;
    this.apuesta = null;
    this.emitir({ tipo: 'lance_fin', lance, resultado });

    if (resultado.tipo === 'rechazado') {
      // El equipo que hizo la última apuesta cobra en el acto.
      this.sumar(resultado.ganador, resultado.piedras);
      this.emitir({
        tipo: 'deje',
        lance,
        equipo: resultado.ganador,
        piedras: resultado.piedras,
        marcador: this.copiaMarcador(),
      });
      if (this.marcador[resultado.ganador] >= this.config.puntosJuego) {
        return this.terminarJuego({ ganador: resultado.ganador, motivo: 'deje', lance });
      }
    }

    if (resultado.tipo === 'querido' && resultado.ordago) {
      // Órdago aceptado: se destapa en el acto y ese lance decide el juego.
      this.emitir({ tipo: 'ordago_aceptado', lance });
      this.destapar();
      const participantes =
        lance === 'pares' ? this.participantesPares : lance === 'juego' ? this.participantesJuego : undefined;
      const g = ganadorLance(lance, this.manos, this.mano, this.config.reyes, participantes);
      if (g === null) throw new Error('Órdago sin ganador');
      this.emitir({ tipo: 'resolucion_ordago', lance, ganador: g, equipo: equipoDe(g) });
      return this.terminarJuego({ ganador: equipoDe(g), motivo: 'ordago', lance });
    }

    switch (lance) {
      case 'grande':
        return this.abrirLance('chica');
      case 'chica':
        return this.abrirLance('pares');
      case 'pares':
        return this.abrirLance('juego');
      case 'juego':
      case 'punto':
        return this.hacerRecuento();
    }
  }

  // ---------------------------------------------------------------------------
  // Destape, recuento y final
  // ---------------------------------------------------------------------------

  private destapar(): void {
    if (this.destapada) return;
    this.destapada = true;
    this.emitir({ tipo: 'destape', manos: this.manos.map((m) => [...m]) });
  }

  private hacerRecuento(): void {
    this.destapar();
    this.recuento = calcularRecuento({
      manos: this.manos,
      mano: this.mano,
      reyes: this.config.reyes,
      resultados: this.resultados,
      participantesPares: this.participantesPares,
      participantesJuego: this.participantesJuego,
      hayJuego: this.hayJuego !== false,
    });
    // Se suma lance a lance comprobando la victoria tras cada suma.
    for (const linea of this.recuento) {
      if (linea.equipo !== null && linea.total > 0) this.sumar(linea.equipo, linea.total);
      this.emitir({ tipo: 'recuento', linea, marcador: this.copiaMarcador() });
      if (linea.equipo !== null && this.marcador[linea.equipo] >= this.config.puntosJuego) {
        return this.terminarJuego({ ganador: linea.equipo, motivo: 'recuento', lance: linea.lance });
      }
    }
    const umbral = this.config.puntosJuego - 5;
    for (const e of [0, 1] as Equipo[]) {
      if (this.marcadorInicial[e] < umbral && this.marcador[e] >= umbral) this.emitir({ tipo: 'adentro', equipo: e });
    }
    this.fase = 'fin';
    this.emitir({ tipo: 'fin_mano', marcador: this.copiaMarcador() });
  }

  private terminarJuego(fin: FinJuego): void {
    this.finJuego = fin;
    this.fase = 'fin';
    this.apuesta = null;
    this.emitir({ tipo: 'fin_juego', fin, marcador: this.copiaMarcador() });
    this.emitir({ tipo: 'fin_mano', marcador: this.copiaMarcador() });
  }

  // ---------------------------------------------------------------------------
  // Utilidades
  // ---------------------------------------------------------------------------

  private sumar(e: Equipo, piedras: number): void {
    this.marcador[e] += piedras;
  }

  private copiaMarcador(): [number, number] {
    return [this.marcador[0], this.marcador[1]];
  }

  private hablar(jugador: Seat, voz: VozMus, extra: { lance?: Lance; cantidad?: number; total?: number } = {}): void {
    const reg: RegistroHabla = { jugador, voz, rondaMus: this.rondaMus };
    if (extra.lance) reg.lance = extra.lance;
    if (extra.cantidad !== undefined) reg.cantidad = extra.cantidad;
    if (extra.total !== undefined) reg.total = extra.total;
    this.historial.push(reg);
    const { rondaMus: _r, ...ev } = reg;
    this.emitir({ tipo: 'habla', ...ev });
  }

  private emitir(e: EventoMus): void {
    this.cola.push(e);
    this.todos.push(e);
  }
}
