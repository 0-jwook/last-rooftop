import { LOGICAL_H, LOGICAL_W } from './constants';

export function setupCanvas(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const parent = canvas.parentElement;
  const cssW = parent?.clientWidth || LOGICAL_W;
  const cssH = parent?.clientHeight || LOGICAL_H;
  const scale = Math.max(1, Math.floor(Math.min(cssW / LOGICAL_W, cssH / LOGICAL_H) * 100) / 100);
  const dpr = window.devicePixelRatio || 1;

  canvas.style.width = `${Math.floor(LOGICAL_W * scale)}px`;
  canvas.style.height = `${Math.floor(LOGICAL_H * scale)}px`;
  canvas.width = Math.floor(LOGICAL_W * scale * dpr);
  canvas.height = Math.floor(LOGICAL_H * scale * dpr);

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas context를 생성할 수 없다.');
  ctx.imageSmoothingEnabled = false;
  ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
  return ctx;
}
