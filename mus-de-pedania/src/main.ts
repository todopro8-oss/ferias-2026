// Punto de entrada provisional (H0): pinta la pantalla lógica 320×200 escalada.
const ANCHO = 320;
const ALTO = 200;

const canvas = document.getElementById('pantalla') as HTMLCanvasElement;
canvas.width = ANCHO;
canvas.height = ALTO;
const ctx = canvas.getContext('2d')!;
ctx.imageSmoothingEnabled = false;

function ajustar(): void {
  const escala = Math.max(1, Math.floor(Math.min(window.innerWidth / ANCHO, window.innerHeight / ALTO)));
  canvas.style.width = `${ANCHO * escala}px`;
  canvas.style.height = `${ALTO * escala}px`;
}
window.addEventListener('resize', ajustar);
ajustar();

ctx.fillStyle = '#1F2E27';
ctx.fillRect(0, 0, ANCHO, ALTO);
ctx.fillStyle = '#EAEAE0';
ctx.font = '8px monospace';
ctx.fillText('MUS DE PEDANIA - H0', 100, 100);
