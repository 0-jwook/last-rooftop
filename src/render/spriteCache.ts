const cache = new Map<string, HTMLCanvasElement>();

export function getCachedSprite(key: string, build: () => HTMLCanvasElement): HTMLCanvasElement {
  let sprite = cache.get(key);
  if (!sprite) {
    sprite = build();
    cache.set(key, sprite);
  }
  return sprite;
}
