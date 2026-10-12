import {
  getGardenSprite,
  getLampSprite,
  getRainCollectorShellSprite,
  getSolarPanelSprite,
  getTentSprite,
} from '../sprites/facilitySprites';
import type { BuildModeState, FacilityType } from '../types';

function getFacilityPreviewSprite(type: FacilityType): HTMLCanvasElement {
  switch (type) {
    case 'tent':
      return getTentSprite();
    case 'garden':
      return getGardenSprite(0);
    case 'rainCollector':
      return getRainCollectorShellSprite();
    case 'solarPanel':
      return getSolarPanelSprite();
    case 'lamp':
      return getLampSprite();
  }
}

export function drawBuildModeOverlay(ctx: CanvasRenderingContext2D, buildMode: BuildModeState): void {
  if (!buildMode.active) return;

  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 1;
  for (const cell of buildMode.gridCells) {
    const half = cell.size / 2;
    ctx.strokeRect(cell.x - half, cell.y - half, cell.size, cell.size);
  }

  if (buildMode.footprintCells.length > 0) {
    ctx.fillStyle = buildMode.validPlacement ? 'rgba(90, 200, 120, 0.45)' : 'rgba(220, 90, 90, 0.45)';
    for (const cell of buildMode.footprintCells) {
      const half = cell.size / 2;
      ctx.fillRect(cell.x - half, cell.y - half, cell.size, cell.size);
    }
  }

  if (buildMode.selectedType && buildMode.footprintCells.length > 0) {
    const sprite = getFacilityPreviewSprite(buildMode.selectedType);
    const anchor = buildMode.footprintCells[0];
    ctx.globalAlpha = 0.6;
    ctx.drawImage(sprite, anchor.x - sprite.width / 2, anchor.y - sprite.height);
    ctx.globalAlpha = 1;
  }
}
