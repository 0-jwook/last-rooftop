export type FacilityType = 'tent' | 'garden' | 'rainCollector' | 'solarPanel' | 'lamp';

export type Weather = 'clear' | 'cloudy' | 'rain';

export type TimeOfDay = 'dawn' | 'day' | 'sunset' | 'night';

export interface GridPosition {
  x: number;
  y: number;
}

export type FacilityState =
  | { kind: 'underConstruction'; targetType: FacilityType; completesOnDay: number }
  | { kind: 'tent' }
  | { kind: 'garden'; growthStage: 0 | 1 | 2 | 3; lastTendedDay: number | null }
  | { kind: 'rainCollector'; waterLevel: number; capacity: number }
  | { kind: 'solarPanel'; chargeLevel: number; capacity: number }
  | { kind: 'lamp' };

export interface FacilityInstance {
  id: string;
  type: FacilityType;
  position: GridPosition;
  builtOnDay: number;
  state: FacilityState;
}

export interface SurvivalStats {
  health: number;
  hunger: number;
  thirst: number;
  fatigue: number;
}

export interface Inventory {
  food: number;
  water: number;
  cloth: number;
  wood: number;
  scrap: number;
  seeds: number;
  battery: number;
}

export interface DiaryEntry {
  id: string;
  day: number;
  timeOfDay: TimeOfDay;
  text: string;
  tag?: 'explore' | 'build' | 'survival' | 'milestone' | 'ambient';
}

export interface LastMessage {
  text: string;
  kind: 'success' | 'error';
}

export interface ExploreInviteEvent {
  type: 'explore_invite';
  locationChoices: string[];
}

export interface SurvivorVisitEvent {
  type: 'survivor_visit';
}

export interface ZombieDisguiseEvent {
  type: 'zombie_disguise';
}

export type PendingEvent = ExploreInviteEvent | SurvivorVisitEvent | ZombieDisguiseEvent;

export interface GameState {
  saveVersion: number;
  day: number;
  timeMinutes: number;
  weather: Weather;
  stats: SurvivalStats;
  inventory: Inventory;
  facilities: FacilityInstance[];
  diary: DiaryEntry[];
  isGameOver: boolean;
  lastMessage: LastMessage | null;
  pendingEvent: PendingEvent | null;
}
