import { seededRandom } from './random';

export type DecayStage = 0 | 1 | 2;

const STAGE1_DAY = 10;
const STAGE2_DAY = 30;

export function decayMultiplier(seed: number): number {
  const r = seededRandom(seed)();
  return 0.6 + r * 1.0;
}

export function decayStageForBuilding(seed: number, gameDay: number): DecayStage {
  const effectiveDay = gameDay * decayMultiplier(seed);
  if (effectiveDay < STAGE1_DAY) return 0;
  if (effectiveDay < STAGE2_DAY) return 1;
  return 2;
}
