// Jugador IA completo: mus, descarte y apuestas según su perfil.

import type { Rng } from '../core/rng';
import type { Accion, Decision } from '../mus/types';
import { decidirApuesta, type OpcionesApuestaIA } from './bet';
import { elegirDescarte } from './discard';
import type { Estimador } from './estimacion';
import type { JugadorIA } from './jugador';
import { decidirMus } from './musDecision';
import type { PerfilIA } from './personalities';
import type { VistaJugador } from './view';

export class JugadorMus implements JugadorIA {
  readonly nombre: string;
  /** Por qué tomó la última decisión (para registros y depuración). */
  ultimoMotivo = '';
  /** Probabilidad estimada en la última decisión de apuesta. */
  ultimaP = 0;
  opciones: OpcionesApuestaIA;

  constructor(
    readonly perfil: PerfilIA,
    private readonly rng: Rng,
    private readonly estimador: Estimador,
    opciones: OpcionesApuestaIA = {},
  ) {
    this.nombre = perfil.nombre;
    this.opciones = { companeroHumano: perfil.companeroDeHumano, ...opciones };
  }

  decidir(vista: VistaJugador, d: Decision): Accion {
    switch (d.tipo) {
      case 'mus': {
        const r = decidirMus(vista, this.perfil, this.rng);
        this.ultimoMotivo = `${r.motivo} (percentil ${r.percentil.toFixed(2)}, umbral ${r.umbral.toFixed(2)})`;
        return { tipo: r.mus ? 'mus' : 'noHayMus' };
      }
      case 'descarte': {
        const cartas = elegirDescarte(vista, this.perfil, this.rng);
        this.ultimoMotivo = `descarta ${cartas.length}`;
        return { tipo: 'descarte', cartas };
      }
      case 'apuesta': {
        const est = this.estimador.estimar(vista);
        const p = est.p[d.lance];
        this.ultimaP = p;
        const r = decidirApuesta(vista, d, p, this.perfil, this.rng, this.opciones);
        this.ultimoMotivo = r.motivo;
        return r.accion;
      }
    }
  }
}
