/** Analizador mínimo de argumentos: --clave valor, --clave=valor y --bandera. */
export function argumentos(argv: string[]): Record<string, string | boolean> {
  const res: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const [clave, valor] = a.slice(2).split('=', 2);
    if (valor !== undefined) res[clave] = valor;
    else if (i + 1 < argv.length && !argv[i + 1].startsWith('--')) res[clave] = argv[++i];
    else res[clave] = true;
  }
  return res;
}
