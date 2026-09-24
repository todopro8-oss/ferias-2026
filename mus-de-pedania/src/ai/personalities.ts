// Personalidad y perfil de un jugador IA (secciones 6 y 8).

/** Estadísticas 0..1 de la tabla de personajes. */
export interface Personalidad {
  /** Agresividad: cuánto envida y sube. */
  agr: number;
  /** Farol: probabilidad de envidar sin cartas. */
  far: number;
  /** Tendencia al órdago. */
  ord: number;
  /** Vista para cazar señas ajenas. */
  vis: number;
  /** Disimulo: lo que cuesta cazarle una seña en modo discreto. */
  dis: number;
  /** Franqueza: probabilidad de hacer señas a su pareja cuando tiene la jugada. */
  fra: number;
  /** Umbral de corte de mus (percentil de la mano a partir del cual dice «no hay mus»). */
  cor: number;
}

export type Dificultad = 'facil' | 'normal' | 'dificil';

export interface PerfilIA {
  personalidad: Personalidad;
  dificultad: Dificultad;
  /** Nombre corto para registros. */
  nombre: string;
  /** Sesgos de estilo: el órdaguero guarda reyes, la prudente busca la 31… */
  estilo?: 'ordaguero' | 'prudente' | 'calculador' | 'teatral' | 'reglamentista' | 'farolera' | 'racana';
  /** El compañero del humano juega distinto: no le pisa las apuestas. */
  companeroDeHumano?: boolean;
}

export const PERSONALIDAD_NEUTRA: Readonly<Personalidad> = Object.freeze({
  agr: 0.5,
  far: 0.15,
  ord: 0.1,
  vis: 0.6,
  dis: 0.5,
  fra: 0.6,
  cor: 0.6,
});

/** Parámetros de dificultad (sección 6.6). */
export interface ParametrosDificultad {
  muestrasMonteCarlo: number;
  /** Multiplicador de la vista para cazar señas (tope 0.95 al aplicarlo). */
  factorVista: number;
  /** Multiplicador de los faroles de los rivales. */
  factorFarol: number;
  /** «Clásico 96»: los rivales rechazan siempre los órdagos salvo con jugada máxima. */
  clasico96: boolean;
  /** ¿Tiene en cuenta el marcador? */
  miraMarcador: boolean;
  /** Se adapta a lo que farolea el humano. */
  adaptativa: boolean;
  /** Simulaciones de reposición por subconjunto al elegir descarte. */
  simsDescarte: number;
}

export const DIFICULTADES: Record<Dificultad, ParametrosDificultad> = {
  facil: {
    muestrasMonteCarlo: 0,
    factorVista: 0.5,
    factorFarol: 0.4,
    clasico96: true,
    miraMarcador: false,
    adaptativa: false,
    simsDescarte: 16,
  },
  normal: {
    muestrasMonteCarlo: 200,
    factorVista: 1,
    factorFarol: 1,
    clasico96: false,
    miraMarcador: true,
    adaptativa: false,
    simsDescarte: 40,
  },
  dificil: {
    muestrasMonteCarlo: 800,
    factorVista: 1.2,
    factorFarol: 1,
    clasico96: false,
    miraMarcador: true,
    adaptativa: true,
    simsDescarte: 40,
  },
};
