// Opciones (sección 14): la libreta de apuntes del bar, con dos pestañas.

import { texto } from '../core/bitmapFont';
import type { EventoEntrada } from '../core/input';
import { dentro } from '../core/input';
import type { Juego, Opciones, Parloteo } from '../core/juego';
import type { Dificultad } from '../ai/personalities';
import type { ModoSenas, VelocidadIA } from '../mus/config';
import type { Escalado } from '../core/pantalla';
import type { Escena } from '../core/sceneManager';
import { DERIVADOS as D, PALETA as P } from '../data/palette';
import { caja } from '../render/pixel';
import { hojaLibreta } from '../render/ui';

interface Fila {
  etiqueta: string;
  valores: { v: unknown; t: string }[];
  leer: (o: Opciones) => unknown;
  escribir: (o: Opciones, v: unknown) => void;
}

const siNo = [
  { v: false, t: 'No' },
  { v: true, t: 'Sí' },
];
const volumen = Array.from({ length: 11 }, (_, i) => ({ v: i / 10, t: `${i * 10} %` }));

function fila<T>(
  etiqueta: string,
  valores: { v: T; t: string }[],
  leerV: (o: Opciones) => T,
  escribirV: (o: Opciones, v: T) => void,
): Fila {
  return {
    etiqueta,
    valores,
    leer: leerV as (o: Opciones) => unknown,
    escribir: escribirV as (o: Opciones, v: unknown) => void,
  };
}

const PESTANAS: { titulo: string; filas: Fila[] }[] = [
  {
    titulo: 'Juego',
    filas: [
      fila<Dificultad>(
        'Dificultad',
        [
          { v: 'facil', t: 'Fácil (Clásico 96)' },
          { v: 'normal', t: 'Normal' },
          { v: 'dificil', t: 'Difícil' },
        ],
        (o) => o.dificultad,
        (o, v) => (o.dificultad = v),
      ),
      fila<8 | 4>(
        'Reyes',
        [
          { v: 8, t: '8 reyes' },
          { v: 4, t: '4 reyes' },
        ],
        (o) => o.reglas.reyes,
        (o, v) => (o.reglas.reyes = v),
      ),
      fila<40 | 30>(
        'Puntos por juego',
        [
          { v: 40, t: '40' },
          { v: 30, t: '30' },
        ],
        (o) => o.reglas.puntosJuego,
        (o, v) => (o.reglas.puntosJuego = v),
      ),
      fila<1 | 3>(
        'Juegos por partida',
        [
          { v: 1, t: '1' },
          { v: 3, t: 'Al mejor de 3' },
        ],
        (o) => o.reglas.juegosPartida,
        (o, v) => (o.reglas.juegosPartida = v),
      ),
      fila(
        'Mus corrido',
        siNo,
        (o) => o.reglas.musCorrido,
        (o, v) => (o.reglas.musCorrido = v),
      ),
      fila<ModoSenas>(
        'Señas',
        [
          { v: 'clasico', t: 'Clásico (cantosas)' },
          { v: 'discreto', t: 'Discreto' },
          { v: 'off', t: 'Sin señas' },
        ],
        (o) => o.senas,
        (o, v) => (o.senas = v),
      ),
      fila(
        'Señas de la casa',
        siNo,
        (o) => o.senasDeLaCasa,
        (o, v) => (o.senasDeLaCasa = v),
      ),
      fila<VelocidadIA>(
        'Velocidad de la IA',
        [
          { v: 'lenta', t: 'Lenta' },
          { v: 'normal', t: 'Normal' },
          { v: 'rapida', t: 'Rápida' },
        ],
        (o) => o.velocidadIA,
        (o, v) => (o.velocidadIA = v),
      ),
      fila<Parloteo>(
        'Parloteo',
        [
          { v: 'poco', t: 'Poco' },
          { v: 'normal', t: 'Normal' },
          { v: 'clasico', t: 'Clásico (todo)' },
        ],
        (o) => o.parloteo,
        (o, v) => (o.parloteo = v),
      ),
      fila(
        'Chivato de señas',
        siNo,
        (o) => o.chivato,
        (o, v) => (o.chivato = v),
      ),
      fila(
        '«¡Te he visto!»',
        siNo,
        (o) => o.teHeVisto,
        (o, v) => (o.teHeVisto = v),
      ),
      fila(
        'Historial visible',
        siNo,
        (o) => o.historialVisible,
        (o, v) => (o.historialVisible = v),
      ),
    ],
  },
  {
    titulo: 'Pantalla y sonido',
    filas: [
      fila(
        'Música',
        volumen,
        (o) => o.volumenMusica,
        (o, v) => (o.volumenMusica = v),
      ),
      fila(
        'Efectos',
        volumen,
        (o) => o.volumenEfectos,
        (o, v) => (o.volumenEfectos = v),
      ),
      fila(
        'Voces',
        volumen,
        (o) => o.volumenVoces,
        (o, v) => (o.volumenVoces = v),
      ),
      fila(
        'Voces sintéticas',
        siNo,
        (o) => o.vocesSinteticas,
        (o, v) => (o.vocesSinteticas = v),
      ),
      fila(
        'Filtro Sound Blaster',
        siNo,
        (o) => o.filtroSoundBlaster,
        (o, v) => (o.filtroSoundBlaster = v),
      ),
      fila<Escalado>(
        'Escalado',
        (['auto', 2, 3, 4, 5, 6] as Escalado[]).map((v) => ({ v, t: v === 'auto' ? 'Auto' : `${v}x` })),
        (o) => o.escalado,
        (o, v) => (o.escalado = v),
      ),
      fila(
        'Corrección 4:3',
        siNo,
        (o) => o.correccion43,
        (o, v) => (o.correccion43 = v),
      ),
      fila(
        'Arranque retro',
        siNo,
        (o) => o.arranqueRetro,
        (o, v) => (o.arranqueRetro = v),
      ),
    ],
  },
];

const X = 20;
const Y = 3;
const W = 280;
const H = 194;

export class OptionsScene implements Escena {
  readonly nombre = 'Opciones';
  readonly transparente = true;
  private pestana = 0;
  private fila = 0;

  constructor(
    private readonly juego: Juego,
    private readonly alCerrar: () => void,
  ) {}

  private get filas(): Fila[] {
    return PESTANAS[this.pestana].filas;
  }

  private cambiar(i: number, delta: number): void {
    const f = this.filas[i];
    const o = this.juego.opciones;
    const actual = f.valores.findIndex((x) => x.v === f.leer(o));
    const n = f.valores.length;
    const nuevo = (Math.max(0, actual) + delta + n) % n;
    f.escribir(o, f.valores[nuevo].v);
    this.juego.audio.sfx('clic', { volumen: 0.4 });
    this.alCerrar(); // guarda y aplica (pantalla) al momento
  }

  private cerrar(): void {
    this.alCerrar();
    this.juego.escenas.quitar(this);
  }

  actualizar(): void {}

  private rectFila(i: number) {
    return { x: X + 14, y: Y + 28 + i * 12, w: W - 20, h: 11 };
  }

  entrada(e: EventoEntrada): void {
    if (e.tipo === 'tecla') {
      const k = e.tecla.toLowerCase();
      if (k === 'escape' || k === 'backspace') return this.cerrar();
      if (k === 'arrowdown') this.fila = (this.fila + 1) % this.filas.length;
      else if (k === 'arrowup') this.fila = (this.fila + this.filas.length - 1) % this.filas.length;
      else if (k === 'arrowright' || k === 'enter' || k === ' ') this.cambiar(this.fila, 1);
      else if (k === 'arrowleft') this.cambiar(this.fila, -1);
      else if (k === 'tab') {
        this.pestana = (this.pestana + 1) % PESTANAS.length;
        this.fila = 0;
      }
      return;
    }
    if (e.tipo === 'mover') {
      this.filas.forEach((_, i) => {
        if (dentro(e.x, e.y, this.rectFila(i))) this.fila = i;
      });
      return;
    }
    if (e.tipo === 'clic') {
      // Pestañas
      PESTANAS.forEach((_, i) => {
        if (dentro(e.x, e.y, { x: X + 14 + i * 124, y: Y + 13, w: 120, h: 11 })) {
          this.pestana = i;
          this.fila = 0;
        }
      });
      this.filas.forEach((_, i) => {
        if (dentro(e.x, e.y, this.rectFila(i))) this.cambiar(i, e.boton === 2 ? -1 : 1);
      });
      if (dentro(e.x, e.y, { x: X + W - 70, y: Y + H - 16, w: 60, h: 12 })) this.cerrar();
    }
  }

  dibujar(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, 320, 200);
    hojaLibreta(ctx, X, Y, W, H);
    texto(ctx, 'OPCIONES', X + W / 2, Y + 3, P.copas, { alinear: 'centro', negrita: true });
    PESTANAS.forEach((p, i) => {
      const x = X + 14 + i * 124;
      const sel = i === this.pestana;
      caja(ctx, x, Y + 13, 120, 11, sel ? P.espadas : D.papel_sombra);
      texto(ctx, p.titulo, x + 60, Y + 15, sel ? P.papel : P.tinta, { alinear: 'centro' });
    });
    const o = this.juego.opciones;
    this.filas.forEach((f, i) => {
      const r = this.rectFila(i);
      const sel = i === this.fila;
      if (sel) caja(ctx, r.x - 2, r.y - 2, r.w + 2, 11, D.oros_brillo);
      texto(ctx, f.etiqueta, r.x, r.y, P.tinta);
      const v = f.valores.find((x) => x.v === f.leer(o))?.t ?? '?';
      texto(ctx, sel ? `◂ ${v} ▸` : v, r.x + r.w - 4, r.y, sel ? P.copas : P.espadas, { alinear: 'derecha' });
    });
    texto(ctx, '↑↓ elegir · ←→ cambiar · Tab', X + 16, Y + H - 14, D.gris);
    caja(ctx, X + W - 70, Y + H - 16, 60, 12, P.negro);
    caja(ctx, X + W - 69, Y + H - 15, 58, 10, D.crema_boton);
    texto(ctx, 'VOLVER', X + W - 40, Y + H - 14, P.tinta, { alinear: 'centro' });
  }
}
