import { LOGICAL_H, LOGICAL_W } from '../constants';

export function drawRainOverlay(ctx: CanvasRenderingContext2D, elapsedMs: number): void {
  ctx.fillStyle = 'rgba(20,24,38,0.22)';
  ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

  ctx.strokeStyle = 'rgba(180,200,220,0.35)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 60; i++) {
    const seedX = (i * 53) % LOGICAL_W;
    const speed = 0.3 + (i % 5) * 0.05;
    const y = ((i * 37 + elapsedMs * speed) % (LOGICAL_H + 20)) - 20;
    ctx.beginPath();
    ctx.moveTo(seedX, y);
    ctx.lineTo(seedX - 4, y + 10);
    ctx.stroke();
  }
}
