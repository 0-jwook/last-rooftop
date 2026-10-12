import { CITY_BUILDINGS, type CityBuildingDef } from '../cityLayout';
import { HORIZON_Y } from '../constants';
import { decayStageForBuilding } from '../decay';
import { getArchetypeShape, getBuildingSprite } from '../sprites/buildingSprites';

export function drawCitySkyline(ctx: CanvasRenderingContext2D, gameDay: number): void {
  for (const building of CITY_BUILDINGS) {
    if (building.layer === 'far') {
      drawBuilding(ctx, building, gameDay, 0.6, 'rgba(27, 37, 80, 0.4)');
    }
  }
  for (const building of CITY_BUILDINGS) {
    if (building.layer === 'near') {
      drawBuilding(ctx, building, gameDay, 1.0, 'rgba(20, 24, 50, 0.12)');
    }
  }
}

function drawBuilding(
  ctx: CanvasRenderingContext2D,
  building: CityBuildingDef,
  gameDay: number,
  scale: number,
  tint: string
): void {
  const stage = decayStageForBuilding(building.seed, gameDay);
  const sprite = getBuildingSprite(building.archetypeId, building.seed, stage);
  const shape = getArchetypeShape(building.archetypeId);
  const dw = shape.width * scale;
  const dh = shape.height * scale;
  const dx = building.x;
  const dy = HORIZON_Y - dh;

  ctx.drawImage(sprite, dx, dy, dw, dh);
  ctx.save();
  ctx.globalCompositeOperation = 'source-atop';
  ctx.fillStyle = tint;
  ctx.fillRect(dx, dy, dw, dh);
  ctx.restore();
}
