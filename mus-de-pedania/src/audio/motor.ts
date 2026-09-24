// Motor de audio: implementa la fachada que usan las escenas. Música FM secuenciada,
// SFX procedurales, ambiente de bar y voces (grabadas o balbuceo con filtro Sound Blaster).

import { vocesGrabadas } from '../core/assets';
import type { FachadaAudio, Opciones } from '../core/juego';
import { cuantizar8bits, duracionBalbuceo, normalizarToma, sintetizarBalbuceo } from './babble';
import { compilar, type Cancion } from './sequencer';
import { FRECUENCIA_SFX, generarSfx, type NombreSfx } from './sfx';
import { CANCIONES } from './songs';
import { frecuenciaDeNota, PATCHES, tocarNota } from './synth';
import { rutaVoz, vozDe } from './voices';

class Reproductor {
  private temporizador: ReturnType<typeof setInterval> | null = null;
  private idx = 0;
  private t0 = 0;
  private readonly eventos;
  private readonly duracion: number;
  readonly salida: GainNode;

  constructor(
    private readonly ctx: AudioContext,
    destino: AudioNode,
    readonly cancion: Cancion,
    private readonly percusion: (golpe: string, t: number, vol: number, destino: AudioNode) => void,
  ) {
    const c = compilar(cancion);
    this.eventos = c.eventos;
    this.duracion = c.duracion;
    this.salida = ctx.createGain();
    this.salida.gain.value = 1;
    this.salida.connect(destino);
  }

  empezar(): void {
    this.t0 = this.ctx.currentTime + 0.08;
    this.idx = 0;
    this.temporizador = setInterval(() => this.programar(), 50);
    this.programar();
  }

  private programar(): void {
    const hasta = this.ctx.currentTime + 0.35;
    while (this.idx < this.eventos.length && this.t0 + this.eventos[this.idx].t < hasta) {
      const e = this.eventos[this.idx++];
      const t = Math.max(this.ctx.currentTime, this.t0 + e.t);
      if (e.instrumento === 'percusion') {
        for (const g of e.notas) this.percusion(g, t, e.volumen, this.salida);
      } else {
        const patch = PATCHES[e.instrumento];
        for (const n of e.notas)
          tocarNota(this.ctx, this.salida, patch, frecuenciaDeNota(n), t, e.dur * 0.92, e.volumen);
      }
    }
    if (this.idx >= this.eventos.length) {
      if (this.cancion.bucle) {
        this.t0 += this.duracion;
        this.idx = 0;
      } else if (this.temporizador) {
        clearInterval(this.temporizador);
        this.temporizador = null;
      }
    }
  }

  parar(): void {
    if (this.temporizador) clearInterval(this.temporizador);
    this.temporizador = null;
    const ahora = this.ctx.currentTime;
    this.salida.gain.cancelScheduledValues(ahora);
    this.salida.gain.setValueAtTime(this.salida.gain.value, ahora);
    this.salida.gain.linearRampToValueAtTime(0, ahora + 0.35);
    setTimeout(() => this.salida.disconnect(), 800);
  }
}

export class MotorAudio implements FachadaAudio {
  private ctx: AudioContext | null = null;
  private maestro!: GainNode;
  private gMusica!: GainNode;
  private gEfectos!: GainNode;
  private gVoces!: GainNode;
  private gAmbiente!: GainNode;
  private readonly buffers = new Map<string, AudioBuffer>();
  private readonly grabadas = new Map<string, Promise<AudioBuffer | null>>();
  private cancionPedida: string | null = null;
  private reproductor: Reproductor | null = null;
  private ambientePedido = false;
  private fuenteAmbiente: AudioBufferSourceNode | null = null;
  private temporizadorAmbiente: ReturnType<typeof setTimeout> | null = null;
  private hablandoHasta = 0;

  constructor(private readonly opciones: () => Opciones) {}

  get activo(): boolean {
    return this.ctx !== null && this.ctx.state === 'running';
  }

  /** Crea el contexto de audio (hace falta un gesto del usuario en los navegadores). */
  desbloquear(): void {
    try {
      if (!this.ctx) {
        const Ctx =
          window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!Ctx) return;
        this.ctx = new Ctx({ latencyHint: 'interactive' });
        const comp = this.ctx.createDynamicsCompressor();
        comp.threshold.value = -10;
        comp.knee.value = 8;
        comp.ratio.value = 4;
        this.maestro = this.ctx.createGain();
        this.maestro.gain.value = 0.9;
        this.maestro.connect(comp).connect(this.ctx.destination);
        this.gMusica = this.ctx.createGain();
        this.gEfectos = this.ctx.createGain();
        this.gVoces = this.ctx.createGain();
        this.gAmbiente = this.ctx.createGain();
        for (const g of [this.gMusica, this.gEfectos, this.gVoces]) g.connect(this.maestro);
        this.gAmbiente.connect(this.gEfectos);
        this.aplicarVolumenes();
      }
      void this.ctx.resume().then(() => {
        const pedida = this.cancionPedida;
        this.cancionPedida = null;
        if (pedida) this.musica(pedida);
        if (this.ambientePedido) this.ambiente(true);
      });
    } catch {
      this.ctx = null;
    }
  }

  aplicarVolumenes(): void {
    if (!this.ctx) return;
    const o = this.opciones();
    const t = this.ctx.currentTime;
    this.gMusica.gain.setTargetAtTime(o.volumenMusica * 0.8, t, 0.05);
    this.gEfectos.gain.setTargetAtTime(o.volumenEfectos, t, 0.05);
    this.gVoces.gain.setTargetAtTime(o.volumenVoces, t, 0.05);
    this.gAmbiente.gain.setTargetAtTime(0.14, t, 0.05);
  }

  private buffer(nombre: NombreSfx): AudioBuffer {
    let b = this.buffers.get(nombre);
    if (!b) {
      const datos = generarSfx(nombre, FRECUENCIA_SFX);
      b = this.ctx!.createBuffer(1, datos.length, FRECUENCIA_SFX);
      b.copyToChannel(datos as Float32Array<ArrayBuffer>, 0);
      this.buffers.set(nombre, b);
    }
    return b;
  }

  private sonar(nombre: NombreSfx, t: number, volumen: number, destino: AudioNode, tono = 1): void {
    const ctx = this.ctx!;
    const s = ctx.createBufferSource();
    s.buffer = this.buffer(nombre);
    s.playbackRate.value = tono;
    const g = ctx.createGain();
    g.gain.value = volumen;
    s.connect(g).connect(destino);
    s.start(t);
    s.onended = () => g.disconnect();
  }

  sfx(nombre: string, op: { volumen?: number; tono?: number; retardo?: number } = {}): void {
    if (!this.activo) return;
    try {
      this.sonar(
        nombre as NombreSfx,
        this.ctx!.currentTime + (op.retardo ?? 0),
        op.volumen ?? 1,
        this.gEfectos,
        op.tono ?? 1,
      );
    } catch {
      // Un sonido que falla no debe romper la partida.
    }
  }

  musica(nombre: string | null): void {
    if (!this.activo) {
      this.cancionPedida = nombre;
      return;
    }
    if (nombre && this.reproductor && CANCIONES[nombre] === this.reproductor.cancion) return;
    this.reproductor?.parar();
    this.reproductor = null;
    if (!nombre) return;
    const cancion = CANCIONES[nombre];
    if (!cancion) return;
    this.reproductor = new Reproductor(this.ctx!, this.gMusica, cancion, (g, t, vol, destino) =>
      this.sonar(`perc_${g}` as NombreSfx, t, vol, destino),
    );
    this.reproductor.empezar();
  }

  ambiente(activo: boolean): void {
    this.ambientePedido = activo;
    if (!this.activo) return;
    if (activo && !this.fuenteAmbiente) {
      const s = this.ctx!.createBufferSource();
      s.buffer = this.buffer('murmullo');
      s.loop = true;
      s.connect(this.gAmbiente);
      s.start();
      this.fuenteAmbiente = s;
      this.programarRuidoDeBar();
    } else if (!activo && this.fuenteAmbiente) {
      this.fuenteAmbiente.stop();
      this.fuenteAmbiente.disconnect();
      this.fuenteAmbiente = null;
      if (this.temporizadorAmbiente) clearTimeout(this.temporizadorAmbiente);
    }
  }

  /** Cafetera, vasos y la tragaperras de fondo, de vez en cuando. */
  private programarRuidoDeBar(): void {
    if (this.temporizadorAmbiente) clearTimeout(this.temporizadorAmbiente);
    this.temporizadorAmbiente = setTimeout(
      () => {
        if (!this.fuenteAmbiente || !this.ctx) return;
        const opciones: NombreSfx[] = ['cafetera', 'vasos', 'vasos', 'tragaperras'];
        const n = opciones[Math.floor(Math.random() * opciones.length)];
        this.sonar(n, this.ctx.currentTime, 0.5, this.gAmbiente);
        this.programarRuidoDeBar();
      },
      6000 + Math.random() * 10000,
    );
  }

  voz(quien: string, evento: string, texto: string, indice?: number): number {
    const o = this.opciones();
    const voz = vozDe(quien);
    const durBalbuceo = duracionBalbuceo(texto, voz) * 1000;
    if (!this.activo || o.volumenVoces <= 0) return durBalbuceo;
    const ruta = indice !== undefined ? rutaVoz(quien, evento, indice) : null;
    const grabada = ruta && vocesGrabadas(quien, evento).includes(ruta);
    if (grabada) {
      void this.cargarGrabada(ruta).then((b) => {
        if (b) this.reproducirVoz(b);
        else if (o.vocesSinteticas) void this.balbucear(texto, voz);
      });
      return durBalbuceo;
    }
    if (o.vocesSinteticas) void this.balbucear(texto, voz);
    return durBalbuceo;
  }

  private cargarGrabada(ruta: string): Promise<AudioBuffer | null> {
    let p = this.grabadas.get(ruta);
    if (!p) {
      p = fetch(ruta)
        .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(r.statusText))))
        .then((ab) => this.ctx!.decodeAudioData(ab))
        .catch(() => null);
      this.grabadas.set(ruta, p);
    }
    return p;
  }

  private async balbucear(texto: string, voz: ReturnType<typeof vozDe>): Promise<void> {
    try {
      const sb = this.opciones().filtroSoundBlaster;
      const sr = sb ? 11025 : 22050;
      const dur = duracionBalbuceo(texto, voz) + 0.3;
      const off = new OfflineAudioContext(1, Math.ceil(dur * sr), sr);
      sintetizarBalbuceo(off, off.destination, texto, voz, 0.02);
      const b = await off.startRendering();
      normalizarToma(b.getChannelData(0));
      if (sb) cuantizar8bits(b.getChannelData(0));
      this.reproducirVoz(b);
    } catch {
      // Sin OfflineAudioContext: se queda en silencio (el bocadillo sigue ahí).
    }
  }

  private reproducirVoz(b: AudioBuffer): void {
    if (!this.ctx) return;
    const s = this.ctx.createBufferSource();
    s.buffer = b;
    s.connect(this.gVoces);
    const ahora = this.ctx.currentTime;
    s.start(ahora);
    // El ambiente baja mientras alguien habla.
    this.hablandoHasta = Math.max(this.hablandoHasta, ahora + b.duration);
    this.gAmbiente.gain.setTargetAtTime(0.05, ahora, 0.08);
    s.onended = () => {
      if (this.ctx && this.ctx.currentTime >= this.hablandoHasta - 0.05) {
        this.gAmbiente.gain.setTargetAtTime(0.14, this.ctx.currentTime, 0.3);
      }
    };
  }
}
