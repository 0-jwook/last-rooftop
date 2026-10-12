import { canPlaceFacility, getFootprintCells } from '../game/domain/facilities';
import { ROOFTOP_LAYOUT } from '../game/data/rooftop';
import type { FacilityState as GameFacilityState, FacilityType as GameFacilityType, GameState, GridPosition } from '../game/state/types';
import { lerp } from './colorMath';
import { LOGICAL_W, ROOFTOP_BOTTOM, ROOFTOP_TOP, ROOFTOP_TOP_INSET } from './constants';
import type { BuildModeState, GridCellMarker, RenderFacilityState, RenderFacilityInstance, WorldSnapshot } from './types';

export interface BuildModeUiState {
  active: boolean;
  selectedType: GameFacilityType | null;
  hoveredCell: GridPosition | null;
}

export function gridCellToWorldPixel(cell: GridPosition): { x: number; y: number } {
  const rowT = (cell.y + 0.5) / ROOFTOP_LAYOUT.height;
  const y = ROOFTOP_TOP + rowT * (ROOFTOP_BOTTOM - ROOFTOP_TOP);
  const leftEdge = lerp(ROOFTOP_TOP_INSET, 0, rowT);
  const rightEdge = lerp(LOGICAL_W - ROOFTOP_TOP_INSET, LOGICAL_W, rowT);
  const colT = (cell.x + 0.5) / ROOFTOP_LAYOUT.width;
  const x = leftEdge + colT * (rightEdge - leftEdge);
  return { x, y };
}

export function pixelToGridCell(px: number, py: number): GridPosition {
  const rowT = Math.min(1, Math.max(0, (py - ROOFTOP_TOP) / (ROOFTOP_BOTTOM - ROOFTOP_TOP)));
  const leftEdge = lerp(ROOFTOP_TOP_INSET, 0, rowT);
  const rightEdge = lerp(LOGICAL_W - ROOFTOP_TOP_INSET, LOGICAL_W, rowT);
  const colT = Math.min(1, Math.max(0, (px - leftEdge) / (rightEdge - leftEdge)));
  const x = Math.min(ROOFTOP_LAYOUT.width - 1, Math.max(0, Math.floor(colT * ROOFTOP_LAYOUT.width)));
  const y = Math.min(ROOFTOP_LAYOUT.height - 1, Math.max(0, Math.floor(rowT * ROOFTOP_LAYOUT.height)));
  return { x, y };
}

function cellWidthAtRow(gy: number): number {
  const a = gridCellToWorldPixel({ x: 0, y: gy });
  const b = gridCellToWorldPixel({ x: 1, y: gy });
  return Math.max(6, Math.abs(b.x - a.x));
}

function facilityStateToRender(state: GameFacilityState): RenderFacilityState {
  switch (state.kind) {
    case 'garden':
      return { growthStage: state.growthStage };
    case 'rainCollector':
      return { waterLevel: state.capacity > 0 ? state.waterLevel / state.capacity : 0 };
    case 'solarPanel':
      return { charge: state.capacity > 0 ? state.chargeLevel / state.capacity : 0 };
    default:
      return {};
  }
}

export function buildWorldSnapshot(state: GameState, buildModeUi: BuildModeUiState | null): WorldSnapshot {
  const facilities: RenderFacilityInstance[] = state.facilities.map((facility) => {
    const { x, y } = gridCellToWorldPixel(facility.position);
    return { id: facility.id, type: facility.type, x, y, state: facilityStateToRender(facility.state) };
  });

  let buildMode: BuildModeState | undefined;
  if (buildModeUi?.active) {
    const gridCells: GridCellMarker[] = [];
    for (let gy = 0; gy < ROOFTOP_LAYOUT.height; gy++) {
      const size = cellWidthAtRow(gy);
      for (let gx = 0; gx < ROOFTOP_LAYOUT.width; gx++) {
        if (ROOFTOP_LAYOUT.blockedCells.some((blocked) => blocked.x === gx && blocked.y === gy)) continue;
        const { x, y } = gridCellToWorldPixel({ x: gx, y: gy });
        gridCells.push({ x, y, size });
      }
    }

    let footprintCells: GridCellMarker[] = [];
    let validPlacement = false;
    if (buildModeUi.selectedType && buildModeUi.hoveredCell) {
      const footprint = getFootprintCells(buildModeUi.selectedType, buildModeUi.hoveredCell);
      footprintCells = footprint.map((cell) => {
        const { x, y } = gridCellToWorldPixel(cell);
        return { x, y, size: cellWidthAtRow(cell.y) };
      });
      validPlacement = canPlaceFacility(state, buildModeUi.selectedType, buildModeUi.hoveredCell).valid;
    }

    buildMode = {
      active: true,
      selectedType: buildModeUi.selectedType,
      gridCells,
      footprintCells,
      validPlacement,
    };
  }

  return {
    timeOfDay: state.timeMinutes / 1440,
    gameDay: state.day,
    weather: state.weather,
    facilities,
    buildMode,
  };
}
