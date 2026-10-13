export type Weather = 'clear' | 'cloudy' | 'rain';
export type FacilityType = 'tent' | 'garden' | 'rainCollector' | 'solarPanel' | 'lamp';

export interface RenderFacilityState {
  growthStage?: 0 | 1 | 2 | 3;
  waterLevel?: number; // 0..1
  charge?: number; // 0..1
  underConstruction?: boolean;
}

export interface RenderFacilityInstance {
  id: string;
  type: FacilityType;
  x: number;
  y: number;
  state: RenderFacilityState;
}

export interface GridCellMarker {
  x: number;
  y: number;
  size: number;
}

export interface BuildModeState {
  active: boolean;
  selectedType: FacilityType | null;
  gridCells: GridCellMarker[];
  footprintCells: GridCellMarker[];
  validPlacement: boolean;
}

export interface WorldSnapshot {
  timeOfDay: number;
  gameDay: number;
  weather: Weather;
  facilities: RenderFacilityInstance[];
  buildMode?: BuildModeState;
}
