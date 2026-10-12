export type CityDecayStage = 0 | 1 | 2;

const STAGE1_DAY = 10;
const STAGE2_DAY = 30;

export function getCityDecayStage(day: number): CityDecayStage {
  if (day < STAGE1_DAY) return 0;
  if (day < STAGE2_DAY) return 1;
  return 2;
}
