import { CHARACTER_X, CHARACTER_Y, LOGICAL_H, LOGICAL_W } from './constants';
import { drawBuildModeOverlay } from './layers/buildMode';
import { drawCitySkyline } from './layers/city';
import { drawCharacter, drawFacility } from './layers/facility';
import { drawRoofClutter, drawRooftopFloor, drawRooftopRailing } from './layers/rooftop';
import { drawClouds, drawSky, drawSunMoon } from './layers/sky';
import { drawRainOverlay } from './layers/weather';
import { getTimeOfDayState } from './time';
import type { WorldSnapshot } from './types';

export function drawWorld(ctx: CanvasRenderingContext2D, snapshot: WorldSnapshot, elapsedMs: number): void {
  const time = getTimeOfDayState(snapshot.timeOfDay);
  ctx.clearRect(0, 0, LOGICAL_W, LOGICAL_H);

  drawSky(ctx, time);
  drawSunMoon(ctx, time);
  drawClouds(ctx, time, elapsedMs, snapshot.weather);
  drawCitySkyline(ctx, snapshot.gameDay);
  drawRooftopFloor(ctx, time);
  drawRoofClutter(ctx);

  const sortedFacilities = [...snapshot.facilities].sort((a, b) => a.y - b.y);
  for (const facility of sortedFacilities) {
    drawFacility(ctx, facility, time, elapsedMs);
  }

  drawCharacter(ctx, CHARACTER_X, CHARACTER_Y, elapsedMs);
  drawRooftopRailing(ctx, time);

  if (snapshot.weather === 'rain') drawRainOverlay(ctx, elapsedMs);
  if (snapshot.buildMode?.active) drawBuildModeOverlay(ctx, snapshot.buildMode);
}
