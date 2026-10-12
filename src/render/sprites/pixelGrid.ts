export interface PixelSprite {
  width: number;
  height: number;
  legend: Record<string, string>;
  rows: string[];
}

export function rasterizeSprite(sprite: PixelSprite): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = sprite.width;
  canvas.height = sprite.height;
  const ctx = canvas.getContext('2d')!;
  for (let y = 0; y < sprite.height; y++) {
    const row = sprite.rows[y] ?? '';
    for (let x = 0; x < sprite.width; x++) {
      const ch = row[x];
      if (!ch || ch === '.') continue;
      const color = sprite.legend[ch];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  return canvas;
}
