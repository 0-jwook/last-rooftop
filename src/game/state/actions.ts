import type { FacilityType, GridPosition } from './types';

export type GameAction =
  | { type: 'TICK'; minutes: number }
  | { type: 'BUILD_FACILITY'; facilityType: FacilityType; position: GridPosition }
  | { type: 'DEMOLISH_FACILITY'; facilityId: string }
  | { type: 'TEND_GARDEN'; facilityId: string }
  | { type: 'RESOLVE_EXPLORE_CHOICE'; locationId: string }
  | { type: 'DECLINE_EXPLORE_INVITE' }
  | { type: 'RESOLVE_SURVIVOR_VISIT'; accept: boolean }
  | { type: 'RESOLVE_ZOMBIE_DISGUISE'; letIn: boolean }
  | { type: 'NEW_GAME' };
