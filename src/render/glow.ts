import { hexToRgbString } from './colorMath';

export function drawRadialGlow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  intensity: number
): void {
  if (intensity <= 0 || radius <= 0) return;
  const rgb = hexToRgbString(color);
  const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
  grad.addColorStop(0, `rgba(${rgb}, ${0.5 * intensity})`);
  grad.addColorStop(0.4, `rgba(${rgb}, ${0.22 * intensity})`);
  grad.addColorStop(1, `rgba(${rgb}, 0)`);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}
