export interface CityBuildingDef {
  id: string;
  archetypeId: number;
  seed: number;
  x: number;
  layer: 'far' | 'near';
}

function generateLayer(layer: 'far' | 'near', count: number, spacing: number, offset: number, seedBase: number): CityBuildingDef[] {
  const result: CityBuildingDef[] = [];
  for (let i = 0; i < count; i++) {
    result.push({
      id: `${layer}-${i}`,
      archetypeId: (i * 3 + (layer === 'near' ? 1 : 0)) % 4,
      seed: seedBase + i * 17 + 1,
      x: offset + i * spacing,
      layer,
    });
  }
  return result;
}

export const CITY_BUILDINGS: CityBuildingDef[] = [
  ...generateLayer('far', 11, 62, -20, 100),
  ...generateLayer('near', 6, 108, -10, 900),
];
