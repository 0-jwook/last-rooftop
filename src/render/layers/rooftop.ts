import { lerpColor } from '../colorMath';
import { LOGICAL_W, ROOFTOP_BOTTOM, ROOFTOP_TOP, ROOFTOP_TOP_INSET } from '../constants';
import { PALETTE } from '../palette';
import type { TimeState } from '../time';

function mixWithDark(hex: string, darkness: number): string {
  return lerpColor(hex, '#05060a', darkness * 0.55);
}

export function drawRooftopFloor(ctx: CanvasRenderingContext2D, time: TimeState): void {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(ROOFTOP_TOP_INSET, ROOFTOP_TOP);
  ctx.lineTo(LOGICAL_W - ROOFTOP_TOP_INSET, ROOFTOP_TOP);
  ctx.lineTo(LOGICAL_W, ROOFTOP_BOTTOM);
  ctx.lineTo(0, ROOFTOP_BOTTOM);
  ctx.closePath();
  ctx.clip();

  const darkness = time.ambientDarkness;
  const grad = ctx.createLinearGradient(0, ROOFTOP_TOP, 0, ROOFTOP_BOTTOM);
  grad.addColorStop(0, mixWithDark(PALETTE.concreteHighlight, darkness));
  grad.addColorStop(1, mixWithDark(PALETTE.concreteShadow, darkness));
  ctx.fillStyle = grad;
  ctx.fillRect(0, ROOFTOP_TOP, LOGICAL_W, ROOFTOP_BOTTOM - ROOFTOP_TOP);

  ctx.strokeStyle = `rgba(0,0,0,${0.12 + darkness * 0.1})`;
  ctx.lineWidth = 1;
  for (let i = 1; i < 5; i++) {
    const y = ROOFTOP_TOP + ((ROOFTOP_BOTTOM - ROOFTOP_TOP) / 5) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(LOGICAL_W, y);
    ctx.stroke();
  }

  ctx.restore();
}

export function drawRoofClutter(ctx: CanvasRenderingContext2D): void {
  const x = ROOFTOP_TOP_INSET + 10;
  const y = ROOFTOP_TOP + 8;
  ctx.fillStyle = PALETTE.ventDark;
  ctx.fillRect(x, y, 16, 11);
  ctx.fillStyle = PALETTE.metalHighlight;
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(x + 2, y + 2 + i * 2, 12, 1);
  }
}

export function drawRooftopRailing(ctx: CanvasRenderingContext2D, time: TimeState): void {
  const topY = ROOFTOP_TOP;
  const leftTop = ROOFTOP_TOP_INSET;
  const rightTop = LOGICAL_W - ROOFTOP_TOP_INSET;
  const postColor = time.ambientDarkness > 0.5 ? PALETTE.railingDark : PALETTE.railingHighlight;

  ctx.strokeStyle = PALETTE.railingDark;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(leftTop, topY - 11);
  ctx.lineTo(rightTop, topY - 11);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(leftTop, topY - 11);
  ctx.lineTo(leftTop, topY);
  ctx.lineTo(0, ROOFTOP_BOTTOM);
  ctx.moveTo(rightTop, topY - 11);
  ctx.lineTo(rightTop, topY);
  ctx.lineTo(LOGICAL_W, ROOFTOP_BOTTOM);
  ctx.stroke();

  ctx.strokeStyle = postColor;
  ctx.lineWidth = 1;
  const postCount = 9;
  for (let i = 0; i <= postCount; i++) {
    const x = leftTop + ((rightTop - leftTop) / postCount) * i;
    ctx.beginPath();
    ctx.moveTo(x, topY - 11);
    ctx.lineTo(x, topY);
    ctx.stroke();
  }
}
