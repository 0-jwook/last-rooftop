import type { GameAction } from './actions';
import { buildFacility, demolishFacility, tendGarden } from '../domain/facilities';
import {
  declineExploreInvite,
  resolveExploreChoice,
  resolveSurvivorVisit,
  resolveZombieDisguise,
} from '../domain/events';
import { applyTick } from '../domain/tick';
import type { DomainResult } from '../domain/util';
import { createInitialState } from './initialState';
import type { GameState } from './types';

function dispatchDomain(state: GameState, action: GameAction): DomainResult {
  switch (action.type) {
    case 'TICK':
      return { ok: true, state: applyTick(state, action.minutes), message: '' };
    case 'BUILD_FACILITY':
      return buildFacility(state, action.facilityType, action.position);
    case 'DEMOLISH_FACILITY':
      return demolishFacility(state, action.facilityId);
    case 'TEND_GARDEN':
      return tendGarden(state, action.facilityId);
    case 'RESOLVE_EXPLORE_CHOICE':
      return resolveExploreChoice(state, action.locationId);
    case 'DECLINE_EXPLORE_INVITE':
      return declineExploreInvite(state);
    case 'RESOLVE_SURVIVOR_VISIT':
      return resolveSurvivorVisit(state, action.accept);
    case 'RESOLVE_ZOMBIE_DISGUISE':
      return resolveZombieDisguise(state, action.letIn);
    case 'NEW_GAME':
      return { ok: true, state: createInitialState(), message: '새 게임을 시작했다.' };
  }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  const result = dispatchDomain(state, action);
  if (result.ok) {
    return result.message ? { ...result.state, lastMessage: { text: result.message, kind: 'success' } } : result.state;
  }
  return { ...result.state, lastMessage: { text: result.reason, kind: 'error' } };
}
