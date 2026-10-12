import { PALETTE } from '../palette';
import { getCachedSprite } from '../spriteCache';
import { rasterizeSprite, type PixelSprite } from './pixelGrid';

const CHARACTER_SPRITE: PixelSprite = {
  width: 12,
  height: 18,
  legend: {
    h: PALETTE.hair,
    j: PALETTE.jacket,
    J: PALETTE.jacketHighlight,
    p: PALETTE.pants,
    b: PALETTE.boots,
  },
  rows: [
    '....hhhh....',
    '...hhhhhh...',
    '..hhhhhhhh..',
    '..hhhhhhhh..',
    '..jjhhhhjj..',
    '.jjjjjjjjjj.',
    '.jJJJJJJJj.',
    '.jJJJJJJJj.',
    '.jjjjjjjjjj.',
    '.jjjjjjjjjj.',
    '.jjjjjjjjjj.',
    '..jjjjjjjj..',
    '..pppppppp..',
    '..pppppppp..',
    '..pp....pp..',
    '..pp....pp..',
    '..bb....bb..',
    '..bb....bb..',
  ].map((row) => row.padEnd(12, '.').slice(0, 12)),
};

export function getCharacterSprite(): HTMLCanvasElement {
  return getCachedSprite('character-idle', () => rasterizeSprite(CHARACTER_SPRITE));
}

export const CHARACTER_WIDTH = CHARACTER_SPRITE.width;
export const CHARACTER_HEIGHT = CHARACTER_SPRITE.height;
