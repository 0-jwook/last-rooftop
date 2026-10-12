import type { GridPosition } from '../state/types';

export interface RooftopLayout {
  width: number;
  height: number;
  blockedCells: GridPosition[];
}

export const ROOFTOP_LAYOUT: RooftopLayout = {
  width: 8,
  height: 6,
  blockedCells: [{ x: 0, y: 0 }],
};
