// Paleta base (sección 11.1). El juego completo no pasa de 256 colores: los sprites
// usan estas entradas y rampas derivadas (ver `rampa`).

export const PALETA = {
  negro: '#000000',
  tinta: '#1A1410',
  madera_osc: '#3A2415',
  madera: '#6E4424',
  madera_clara: '#A86C3A',
  barniz: '#D9A05B',
  pared: '#D8C48E',
  pared_sombra: '#9E8454',
  azulejo_osc: '#1F5C4A',
  azulejo: '#3E8C6E',
  azulejo_brillo: '#8FD0A8',
  pizarra: '#1F2E27',
  tiza: '#EAEAE0',
  tiza_sombra: '#9FA69B',
  papel: '#F1E6C8',
  piel_1: '#F0C49C',
  piel_2: '#C98A5E',
  piel_3: '#8C5634',
  oros: '#E2B227',
  copas: '#B3262E',
  espadas: '#2F58A8',
  bastos: '#3E7C2C',
  neon: '#4FE0FF',
  fluorescente: '#F4FFE0',
  atardecer: '#F08A4B',
  violeta: '#5B3A78',
} as const;

export type NombreColor = keyof typeof PALETA;

/** Colores derivados de uso frecuente (siguen siendo pocos: la paleta total se mantiene < 256). */
export const DERIVADOS = {
  blanco: '#FFFFFF',
  papel_sombra: '#C9B98F',
  oros_osc: '#9A7414',
  oros_brillo: '#F6DC7A',
  copas_osc: '#6E1218',
  copas_brillo: '#E0646A',
  espadas_osc: '#1A3470',
  espadas_brillo: '#8CA8E0',
  bastos_osc: '#23491A',
  bastos_brillo: '#7FB866',
  madera_muy_osc: '#24160C',
  piel_1_luz: '#FAD9B8',
  piel_1_sombra: '#D9A278',
  piel_2_luz: '#DDA47A',
  piel_2_sombra: '#A86C44',
  piel_3_sombra: '#6A3E24',
  rojo_labios: '#C0303A',
  lengua: '#E07080',
  gris: '#6E6E68',
  gris_claro: '#B8B8B0',
  cielo: '#7AB8E8',
  verde_boton: '#2E6B3A',
  crema_boton: '#EFE3B8',
  tele_osc: '#101418',
  pizarra_clara: '#2C4036',
} as const;

export function color(nombre: NombreColor | keyof typeof DERIVADOS): string {
  return (PALETA as Record<string, string>)[nombre] ?? (DERIVADOS as Record<string, string>)[nombre];
}

export function hexARgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

export function rgbAHex(r: number, g: number, b: number): string {
  const c = (x: number) =>
    Math.max(0, Math.min(255, Math.round(x)))
      .toString(16)
      .padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`.toUpperCase();
}

/** Mezcla dos colores (t = 0 → a, t = 1 → b). */
export function mezclar(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexARgb(a);
  const [r2, g2, b2] = hexARgb(b);
  return rgbAHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
}

/** Rampa de 3 tonos (sombra, base, luz) a partir de un color, cuantizada a 16 niveles por canal. */
export function rampa(base: string): { sombra: string; base: string; luz: string } {
  const q = (hex: string) => {
    const [r, g, b] = hexARgb(hex);
    const k = (x: number) => Math.round(x / 17) * 17;
    return rgbAHex(k(r), k(g), k(b));
  };
  return { sombra: q(mezclar(base, '#000000', 0.32)), base, luz: q(mezclar(base, '#FFFFFF', 0.28)) };
}
