import { PALETTE } from '../palette';
import { getCachedSprite } from '../spriteCache';
import { rasterizeSprite, type PixelSprite } from './pixelGrid';

function emptyRows(width: number, height: number): string[] {
  return Array.from({ length: height }, () => '.'.repeat(width));
}

function setPixel(rows: string[], x: number, y: number, ch: string): void {
  if (y < 0 || y >= rows.length || x < 0 || x >= rows[y].length) return;
  rows[y] = rows[y].slice(0, x) + ch + rows[y].slice(x + 1);
}

function fillRect(rows: string[], x0: number, y0: number, w: number, h: number, ch: string): void {
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) setPixel(rows, x, y, ch);
  }
}

function buildTentSprite(): PixelSprite {
  const width = 19;
  const height = 11;
  const rows = emptyRows(width, height);
  const apex = 9;
  for (let y = 0; y < height - 1; y++) {
    const left = apex - y;
    const right = apex + y;
    for (let x = left; x <= right; x++) {
      const ch = x === left || x === right ? 'e' : x < apex ? 'f' : x > apex ? 'F' : 'f';
      setPixel(rows, x, y, ch);
    }
  }
  const groundHalf = height - 2;
  fillRect(rows, apex - groundHalf, height - 1, groundHalf * 2 + 1, 1, 'e');
  fillRect(rows, apex - 2, height - 4, 5, 3, 'd');
  return {
    width,
    height,
    legend: { f: PALETTE.fabricTent, F: PALETTE.fabricShadow, e: PALETTE.fabricAccent, d: PALETTE.woodDark },
    rows,
  };
}

function buildGardenSprite(stage: 0 | 1 | 2 | 3): PixelSprite {
  const width = 12;
  const height = 11;
  const rows = emptyRows(width, height);
  fillRect(rows, 0, 7, 12, 1, 'P');
  fillRect(rows, 1, 8, 10, 3, 'p');
  fillRect(rows, 1, 7, 10, 1, 's');

  if (stage >= 1) {
    setPixel(rows, 5, 6, 'l');
    setPixel(rows, 6, 6, 'l');
  }
  if (stage >= 2) {
    fillRect(rows, 4, 4, 1, 3, 'g');
    fillRect(rows, 7, 4, 1, 3, 'g');
    fillRect(rows, 5, 3, 2, 2, 'l');
  }
  if (stage >= 3) {
    setPixel(rows, 4, 3, 'h');
    setPixel(rows, 7, 3, 'h');
    fillRect(rows, 5, 2, 2, 2, 'L');
  }

  return {
    width,
    height,
    legend: {
      p: PALETTE.potClay,
      P: PALETTE.woodDark,
      s: PALETTE.soil,
      g: PALETTE.leafDark,
      l: PALETTE.leafMid,
      L: PALETTE.sprout,
      h: PALETTE.harvestAccent,
    },
    rows,
  };
}

const RAIN_COLLECTOR_WIDTH = 12;
const RAIN_COLLECTOR_HEIGHT = 17;

function buildRainCollectorShell(): PixelSprite {
  const rows = emptyRows(RAIN_COLLECTOR_WIDTH, RAIN_COLLECTOR_HEIGHT);
  fillRect(rows, 0, 0, RAIN_COLLECTOR_WIDTH, 1, 'c');
  fillRect(rows, 1, 1, RAIN_COLLECTOR_WIDTH - 2, RAIN_COLLECTOR_HEIGHT - 2, 'm');
  fillRect(rows, 1, 1, RAIN_COLLECTOR_WIDTH - 2, 1, 'M');
  fillRect(rows, 2, 2, RAIN_COLLECTOR_WIDTH - 4, RAIN_COLLECTOR_HEIGHT - 4, 'i');
  return {
    width: RAIN_COLLECTOR_WIDTH,
    height: RAIN_COLLECTOR_HEIGHT,
    legend: { m: PALETTE.metalDark, M: PALETTE.metalHighlight, c: PALETTE.fabricShadow, i: '#11151c' },
    rows,
  };
}

export const RAIN_COLLECTOR_INNER = {
  x: 2,
  y: 2,
  width: RAIN_COLLECTOR_WIDTH - 4,
  height: RAIN_COLLECTOR_HEIGHT - 4,
};

function buildSolarPanelSprite(): PixelSprite {
  const width = 20;
  const height = 12;
  const rows = emptyRows(width, height);
  fillRect(rows, 1, 0, 18, 7, 'c');
  for (let x = 1; x < 19; x += 4) fillRect(rows, x, 0, 1, 7, 'g');
  for (let y = 1; y < 7; y += 2) fillRect(rows, 1, y, 18, 1, 'g');
  fillRect(rows, 0, 7, 20, 1, 'k');
  fillRect(rows, 8, 7, 4, 5, 'k');
  return {
    width,
    height,
    legend: { c: PALETTE.solarCell, g: PALETTE.solarGrid, k: PALETTE.metalDark },
    rows,
  };
}

function buildLampSprite(): PixelSprite {
  const width = 8;
  const height = 20;
  const rows = emptyRows(width, height);
  fillRect(rows, 3, 4, 2, 15, 'm');
  fillRect(rows, 1, 1, 6, 3, 'h');
  fillRect(rows, 0, 0, 8, 1, 'k');
  fillRect(rows, 1, 18, 6, 1, 'k');
  return {
    width,
    height,
    legend: { m: PALETTE.metalDark, h: PALETTE.metalHighlight, k: PALETTE.railingDark },
    rows,
  };
}

export function getTentSprite(): HTMLCanvasElement {
  return getCachedSprite('tent', () => rasterizeSprite(buildTentSprite()));
}

export function getGardenSprite(stage: 0 | 1 | 2 | 3): HTMLCanvasElement {
  return getCachedSprite(`garden-${stage}`, () => rasterizeSprite(buildGardenSprite(stage)));
}

export function getRainCollectorShellSprite(): HTMLCanvasElement {
  return getCachedSprite('rainCollector-shell', () => rasterizeSprite(buildRainCollectorShell()));
}

export function getSolarPanelSprite(): HTMLCanvasElement {
  return getCachedSprite('solarPanel', () => rasterizeSprite(buildSolarPanelSprite()));
}

export function getLampSprite(): HTMLCanvasElement {
  return getCachedSprite('lamp', () => rasterizeSprite(buildLampSprite()));
}
