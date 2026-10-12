import type { FacilityType, GridPosition } from './types';

export type GameAction =
  | { type: 'ADVANCE_TIME'; minutes: number }
  | { type: 'SLEEP' }
  | { type: 'EAT' }
  | { type: 'DRINK' }
  | { type: 'EXPLORE'; locationId: string; eventId: string; choiceId: string }
  | { type: 'BUILD_FACILITY'; facilityType: FacilityType; position: GridPosition }
  | { type: 'DEMOLISH_FACILITY'; facilityId: string }
  | { type: 'TEND_GARDEN'; facilityId: string }
  | { type: 'CLEAN_ROOFTOP' }
  | { type: 'REST_IDLE'; minutes: number }
  | { type: 'NEW_GAME' };
