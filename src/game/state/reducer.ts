import { buildFacility, cleanRooftop, demolishFacility, tendGarden } from '../domain/facilities';
import { exploreLocation } from '../domain/exploration';
import { drinkWater, eatFood } from '../domain/survival';
import { advanceTime, sleep } from '../domain/time';
import type { DomainResult } from '../domain/util';
import { createInitialState } from './initialState';
import type { GameAction } from './actions';
import type { GameState } from './types';

function dispatchDomain(state: GameState, action: GameAction): DomainResult {
  switch (action.type) {
    case 'ADVANCE_TIME':
      return { ok: true, state: advanceTime(state, action.minutes), message: '' };
    case 'SLEEP':
      return sleep(state);
    case 'EAT':
      return eatFood(state);
    case 'DRINK':
      return drinkWater(state);
    case 'EXPLORE':
      return exploreLocation(state, action.locationId, action.eventId, action.choiceId);
    case 'BUILD_FACILITY':
      return buildFacility(state, action.facilityType, action.position);
    case 'DEMOLISH_FACILITY':
      return demolishFacility(state, action.facilityId);
    case 'TEND_GARDEN':
      return tendGarden(state, action.facilityId);
    case 'CLEAN_ROOFTOP':
      return cleanRooftop(state);
    case 'REST_IDLE':
      return { ok: true, state: advanceTime(state, action.minutes), message: '시간을 보냈다.' };
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
