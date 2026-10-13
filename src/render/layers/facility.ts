import { lerp } from '../colorMath';
import { ROOFTOP_BOTTOM, ROOFTOP_TOP } from '../constants';
import { drawRadialGlow } from '../glow';
import { PALETTE } from '../palette';
import { CHARACTER_HEIGHT, CHARACTER_WIDTH, getCharacterSprite } from '../sprites/characterSprite';
import {
  RAIN_COLLECTOR_INNER,
  getGardenSprite,
  getLampSprite,
  getRainCollectorShellSprite,
  getSolarPanelSprite,
  getTentSprite,
} from '../sprites/facilitySprites';
import type { TimeState } from '../time';
import type { RenderFacilityInstance } from '../types';

function depthScale(y: number): number {
  const ratio = (y - ROOFTOP_TOP) / (ROOFTOP_BOTTOM - ROOFTOP_TOP);
  return lerp(0.8, 1.2, Math.min(1, Math.max(0, ratio)));
}

function drawAnchoredSprite(
  ctx: CanvasRenderingContext2D,
  sprite: HTMLCanvasElement,
  x: number,
  y: number,
  scale: number
): { dx: number; dy: number; w: number; h: number } {
  const w = sprite.width * scale;
  const h = sprite.height * scale;
  const dx = x - w / 2;
  const dy = y - h;
  ctx.drawImage(sprite, dx, dy, w, h);
  return { dx, dy, w, h };
}

export function drawFacility(
  ctx: CanvasRenderingContext2D,
  facility: RenderFacilityInstance,
  time: TimeState,
  elapsedMs: number
): void {
  const scale = depthScale(facility.y);
  const underConstruction = facility.state.underConstruction ?? false;
  if (underConstruction) ctx.globalAlpha = 0.45;

  switch (facility.type) {
    case 'tent':
      drawAnchoredSprite(ctx, getTentSprite(), facility.x, facility.y, scale);
      break;
    case 'garden':
      drawAnchoredSprite(ctx, getGardenSprite(facility.state.growthStage ?? 0), facility.x, facility.y, scale);
      break;
    case 'rainCollector':
      drawRainCollector(ctx, facility, scale, elapsedMs);
      break;
    case 'solarPanel':
      drawSolarPanel(ctx, facility, time, scale);
      break;
    case 'lamp':
      drawLamp(ctx, facility, time, scale, elapsedMs);
      break;
  }

  if (underConstruction) ctx.globalAlpha = 1;
}

function drawRainCollector(
  ctx: CanvasRenderingContext2D,
  facility: RenderFacilityInstance,
  scale: number,
  elapsedMs: number
): void {
  const sprite = getRainCollectorShellSprite();
  const { dx, dy } = drawAnchoredSprite(ctx, sprite, facility.x, facility.y, scale);

  const level = facility.state.waterLevel ?? 0;
  if (level <= 0) return;

  const inner = RAIN_COLLECTOR_INNER;
  const innerX = dx + inner.x * scale;
  const innerY = dy + inner.y * scale;
  const innerW = inner.width * scale;
  const innerH = inner.height * scale;
  const fillH = innerH * Math.min(1, level);
  const shimmer = Math.sin(elapsedMs * 0.003) * 0.5 + 0.5;

  ctx.save();
  ctx.beginPath();
  ctx.rect(innerX, innerY, innerW, innerH);
  ctx.clip();
  ctx.fillStyle = PALETTE.water;
  ctx.fillRect(innerX, innerY + (innerH - fillH), innerW, fillH);
  ctx.fillStyle = PALETTE.waterHighlight;
  ctx.fillRect(innerX, innerY + (innerH - fillH), innerW, Math.max(1, shimmer));
  ctx.restore();
}

function drawSolarPanel(ctx: CanvasRenderingContext2D, facility: RenderFacilityInstance, time: TimeState, scale: number): void {
  const sprite = getSolarPanelSprite();
  const { dx, dy, w } = drawAnchoredSprite(ctx, sprite, facility.x, facility.y, scale);
  const charge = facility.state.charge ?? 0;
  if (time.isNight && charge > 0) {
    drawRadialGlow(ctx, dx + w / 2, dy, 20 * scale, PALETTE.solarGlow, charge);
  }
}

function drawLamp(
  ctx: CanvasRenderingContext2D,
  facility: RenderFacilityInstance,
  time: TimeState,
  scale: number,
  elapsedMs: number
): void {
  const sprite = getLampSprite();
  const { dx, dy, w } = drawAnchoredSprite(ctx, sprite, facility.x, facility.y, scale);
  const fade = Math.min(1, Math.max(0, (time.ambientDarkness - 0.4) / 0.6));
  if (fade <= 0) return;
  const flicker = 0.9 + 0.1 * Math.sin(elapsedMs * 0.01 + facility.x);
  drawRadialGlow(ctx, dx + w / 2, dy + sprite.height * scale * 0.15, 26 * scale * flicker, PALETTE.lampGlow, fade);
}

export function drawCharacter(ctx: CanvasRenderingContext2D, x: number, y: number, elapsedMs: number): void {
  const sprite = getCharacterSprite();
  const bob = Math.sin(elapsedMs * 0.002) * 0.6;
  const scale = depthScale(y);
  const w = CHARACTER_WIDTH * scale;
  const h = CHARACTER_HEIGHT * scale;
  ctx.drawImage(sprite, x - w / 2, y - h + bob, w, h);
}
