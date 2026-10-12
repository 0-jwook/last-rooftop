import { HORIZON_Y, LOGICAL_W } from '../constants';
import { drawRadialGlow } from '../glow';
import type { TimeState } from '../time';
import type { Weather } from '../types';

export function drawSky(ctx: CanvasRenderingContext2D, time: TimeState): void {
  const grad = ctx.createLinearGradient(0, 0, 0, HORIZON_Y);
  grad.addColorStop(0, time.skyTop);
  grad.addColorStop(1, time.skyHorizon);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, LOGICAL_W, HORIZON_Y);

  if (time.isNight) {
    drawStars(ctx, time.ambientDarkness);
  }
}

function drawStars(ctx: CanvasRenderingContext2D, darkness: number): void {
  ctx.fillStyle = `rgba(255,255,255,${0.6 * darkness})`;
  for (let i = 0; i < 40; i++) {
    const x = (i * 97 + 13) % LOGICAL_W;
    const y = (i * 53 + 7) % (HORIZON_Y - 20);
    ctx.fillRect(x, y, 1, 1);
  }
}

export function drawSunMoon(ctx: CanvasRenderingContext2D, time: TimeState): void {
  const radius = time.isSun ? 10 : 7;
  drawRadialGlow(ctx, time.sunMoonX, time.sunMoonY, radius * 4, time.sunColor, time.isSun ? 0.9 : 0.5);
  ctx.fillStyle = time.sunColor;
  ctx.beginPath();
  ctx.arc(time.sunMoonX, time.sunMoonY, radius, 0, Math.PI * 2);
  ctx.fill();
}

export function drawClouds(ctx: CanvasRenderingContext2D, time: TimeState, elapsedMs: number, weather: Weather): void {
  if (weather === 'rain') return;
  const count = weather === 'cloudy' ? 6 : 3;
  const opacity = time.isNight ? 0.12 : 0.35;
  ctx.fillStyle = `rgba(255,255,255,${opacity})`;
  const drift = (elapsedMs * 0.005) % 760;
  for (let i = 0; i < count; i++) {
    const baseX = ((i * 180 + drift) % 760) - 60;
    const y = 20 + ((i * 23) % 70);
    drawCloudPuff(ctx, baseX, y);
  }
}

function drawCloudPuff(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.beginPath();
  ctx.ellipse(x, y, 18, 6, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 12, y - 3, 12, 5, 0, 0, Math.PI * 2);
  ctx.ellipse(x - 12, y - 2, 10, 5, 0, 0, Math.PI * 2);
  ctx.fill();
}
