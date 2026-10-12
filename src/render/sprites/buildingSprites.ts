import type { DecayStage } from '../decay';
import { PALETTE } from '../palette';
import { seededRandom } from '../random';
import { getCachedSprite } from '../spriteCache';
import { rasterizeSprite, type PixelSprite } from './pixelGrid';

export interface BuildingShape {
  width: number;
  height: number;
  windowCols: number;
  windowRows: number;
  litRatio: number;
  brokenRatio: number;
  wallAlt: boolean;
}

export const ARCHETYPE_SHAPES: BuildingShape[] = [
  { width: 16, height: 70, windowCols: 3, windowRows: 10, litRatio: 0.12, brokenRatio: 0.08, wallAlt: false },
  { width: 20, height: 92, windowCols: 4, windowRows: 13, litRatio: 0.08, brokenRatio: 0.12, wallAlt: true },
  { width: 14, height: 54, windowCols: 2, windowRows: 8, litRatio: 0.15, brokenRatio: 0.06, wallAlt: false },
  { width: 18, height: 60, windowCols: 3, windowRows: 9, litRatio: 0.1, brokenRatio: 0.1, wallAlt: true },
];

export function getArchetypeShape(archetypeId: number): BuildingShape {
  return ARCHETYPE_SHAPES[archetypeId % ARCHETYPE_SHAPES.length];
}

function buildBaseGrid(shape: BuildingShape, seed: number): PixelSprite {
  const { width, height, windowCols, windowRows, litRatio, brokenRatio, wallAlt } = shape;
  const wallChar = wallAlt ? 'W' : 'w';
  const roofHeight = 2;
  const marginX = 1;
  const windowAreaTop = roofHeight + 1;
  const windowAreaHeight = height - windowAreaTop - 1;
  const colSpacing = (width - marginX * 2) / windowCols;
  const rowSpacing = windowAreaHeight / windowRows;

  const rows: string[] = [];
  for (let y = 0; y < height; y++) {
    let row = '';
    for (let x = 0; x < width; x++) {
      if (y < roofHeight) {
        row += x === 0 || x === width - 1 ? '.' : 'r';
        continue;
      }
      if (x === 0 || x === width - 1) {
        row += wallChar;
        continue;
      }
      const relY = y - windowAreaTop;
      const relX = x - marginX;
      const windowRowIndex = Math.floor(relY / rowSpacing);
      const windowColIndex = Math.floor(relX / colSpacing);
      const withinWindowRow = relY >= 0 && relY % rowSpacing < rowSpacing - 1 && windowRowIndex < windowRows;
      const withinWindowCol = relX % colSpacing < colSpacing - 1 && windowColIndex < windowCols;

      if (withinWindowRow && withinWindowCol) {
        const key = windowRowIndex * windowCols + windowColIndex;
        const r = seededRandom(seed * 97 + key + 3)();
        row += r < brokenRatio ? 'x' : r < brokenRatio + litRatio ? 'O' : 'o';
      } else {
        row += wallChar;
      }
    }
    rows.push(row);
  }

  return {
    width,
    height,
    legend: {
      r: PALETTE.metalDark,
      w: PALETTE.wallBase,
      W: PALETTE.wallBaseAlt,
      o: PALETTE.windowDark,
      O: PALETTE.windowLit,
      x: PALETTE.windowBroken,
    },
    rows,
  };
}

function applyDecayOverlay(base: PixelSprite, seed: number, stage: 1 | 2): PixelSprite {
  const rand = seededRandom(seed * 1000 + stage);
  const breakChance = stage === 1 ? 0.25 : 0.55;
  const rows = base.rows.map((row) =>
    row
      .split('')
      .map((ch) => ((ch === 'o' || ch === 'O') && rand() < breakChance ? 'x' : ch))
      .join('')
  );

  const legend = { ...base.legend, v: PALETTE.vineBase, V: PALETTE.vineHighlight };
  if (stage === 2) {
    const vineColumns = Math.floor(rand() * 3) + 3;
    for (let i = 0; i < vineColumns; i++) {
      const col = Math.floor(rand() * base.width);
      const vineHeight = Math.floor(rand() * base.height * 0.5) + 4;
      for (let y = base.height - 1; y >= 0 && y > base.height - 1 - vineHeight; y--) {
        const chars = rows[y].split('');
        if (chars[col] !== '.') {
          chars[col] = rand() < 0.5 ? 'v' : 'V';
          rows[y] = chars.join('');
        }
      }
    }
  }

  return { ...base, legend, rows };
}

export function getBuildingSprite(archetypeId: number, seed: number, stage: DecayStage): HTMLCanvasElement {
  return getCachedSprite(`building-${archetypeId}-${seed}-${stage}`, () => {
    const shape = getArchetypeShape(archetypeId);
    const base = buildBaseGrid(shape, seed);
    const sprite = stage === 0 ? base : applyDecayOverlay(base, seed, stage as 1 | 2);
    return rasterizeSprite(sprite);
  });
}
