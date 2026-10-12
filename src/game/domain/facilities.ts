import { DEMOLISH_REFUND_RATE, FACILITY_CATALOG } from '../data/facilities';
import { ROOFTOP_LAYOUT } from '../data/rooftop';
import type { FacilityInstance, FacilityState, FacilityType, GameState, GridPosition, Inventory } from '../state/types';
import { pushDiaryEntry } from './diary';
import { addResources, canAfford, deductResources } from './inventory';
import { advanceTime, getTimeOfDay } from './time';
import { clamp, generateId, particleEulReul, type DomainResult } from './util';

const BUILD_TIME_MINUTES = 45;
const DEMOLISH_TIME_MINUTES = 20;
const TEND_TIME_MINUTES = 20;
const CLEAN_TIME_MINUTES = 30;
const GARDEN_MAX_STAGE = 3;
const GARDEN_HARVEST_YIELD: Partial<Inventory> = { food: 3, seeds: 1 };

export function getFootprintCells(type: FacilityType, position: GridPosition): GridPosition[] {
  return FACILITY_CATALOG[type].footprint.map((offset) => ({
    x: position.x + offset.x,
    y: position.y + offset.y,
  }));
}

function isWithinBounds(cells: GridPosition[]): boolean {
  return cells.every(
    (cell) => cell.x >= 0 && cell.x < ROOFTOP_LAYOUT.width && cell.y >= 0 && cell.y < ROOFTOP_LAYOUT.height
  );
}

function overlapsBlocked(cells: GridPosition[]): boolean {
  return cells.some((cell) =>
    ROOFTOP_LAYOUT.blockedCells.some((blocked) => blocked.x === cell.x && blocked.y === cell.y)
  );
}

function overlapsExisting(cells: GridPosition[], facilities: FacilityInstance[]): boolean {
  const occupied = facilities.flatMap((facility) => getFootprintCells(facility.type, facility.position));
  return cells.some((cell) => occupied.some((o) => o.x === cell.x && o.y === cell.y));
}

export function canPlaceFacility(
  state: GameState,
  type: FacilityType,
  position: GridPosition
): { valid: true } | { valid: false; reason: string } {
  const cells = getFootprintCells(type, position);
  if (!isWithinBounds(cells)) {
    return { valid: false, reason: '옥상 영역을 벗어난 위치다.' };
  }
  if (overlapsBlocked(cells)) {
    return { valid: false, reason: '구조물이 있는 자리에는 지을 수 없다.' };
  }
  if (overlapsExisting(cells, state.facilities)) {
    return { valid: false, reason: '이미 다른 시설이 있는 자리다.' };
  }
  return { valid: true };
}

function createInitialFacilityState(type: FacilityType): FacilityState {
  switch (type) {
    case 'tent':
      return { kind: 'tent' };
    case 'garden':
      return { kind: 'garden', growthStage: 0, lastTendedDay: null };
    case 'rainCollector':
      return { kind: 'rainCollector', waterLevel: 0, capacity: 10 };
    case 'solarPanel':
      return { kind: 'solarPanel', chargeLevel: 0, capacity: 10 };
    case 'lamp':
      return { kind: 'lamp' };
  }
}

export function buildFacility(state: GameState, type: FacilityType, position: GridPosition): DomainResult {
  const placement = canPlaceFacility(state, type, position);
  if (!placement.valid) {
    return { ok: false, state, reason: placement.reason };
  }
  const def = FACILITY_CATALOG[type];
  if (!canAfford(state.inventory, def.cost)) {
    return { ok: false, state, reason: '재료가 부족하다.' };
  }

  const advanced = advanceTime(state, BUILD_TIME_MINUTES);
  const facility: FacilityInstance = {
    id: generateId(),
    type,
    position,
    builtOnDay: advanced.day,
    state: createInitialFacilityState(type),
  };
  const nextState: GameState = {
    ...advanced,
    inventory: deductResources(advanced.inventory, def.cost),
    facilities: [...advanced.facilities, facility],
  };
  const withDiary = pushDiaryEntry(
    nextState,
    getTimeOfDay(nextState.timeMinutes),
    `오늘 옥상에 ${def.name}${particleEulReul(def.name)} 설치했다.`,
    'build'
  );
  return { ok: true, state: withDiary, message: `${def.name}${particleEulReul(def.name)} 설치했다.` };
}

export function demolishFacility(state: GameState, facilityId: string): DomainResult {
  const facility = state.facilities.find((f) => f.id === facilityId);
  if (!facility) {
    return { ok: false, state, reason: '철거할 시설을 찾을 수 없다.' };
  }
  const def = FACILITY_CATALOG[facility.type];
  const refund: Partial<Inventory> = {};
  for (const key of Object.keys(def.cost) as (keyof Inventory)[]) {
    refund[key] = Math.floor((def.cost[key] ?? 0) * DEMOLISH_REFUND_RATE);
  }

  const advanced = advanceTime(state, DEMOLISH_TIME_MINUTES);
  const nextState: GameState = {
    ...advanced,
    inventory: addResources(advanced.inventory, refund),
    facilities: advanced.facilities.filter((f) => f.id !== facilityId),
  };
  const withDiary = pushDiaryEntry(
    nextState,
    getTimeOfDay(nextState.timeMinutes),
    `${def.name}${particleEulReul(def.name)} 철거했다.`,
    'build'
  );
  return { ok: true, state: withDiary, message: `${def.name}${particleEulReul(def.name)} 철거하고 재료 일부를 돌려받았다.` };
}

export function tendGarden(state: GameState, facilityId: string): DomainResult {
  const facility = state.facilities.find((f) => f.id === facilityId);
  if (!facility || facility.state.kind !== 'garden') {
    return { ok: false, state, reason: '텃밭을 찾을 수 없다.' };
  }
  if (facility.state.lastTendedDay === state.day) {
    return { ok: false, state, reason: '오늘은 이미 텃밭을 돌봤다.' };
  }

  const advanced = advanceTime(state, TEND_TIME_MINUTES);
  const gardenState = facility.state;
  let nextFacilities: FacilityInstance[];
  let message: string;
  let diaryText: string;

  if (gardenState.growthStage >= GARDEN_MAX_STAGE) {
    nextFacilities = advanced.facilities.map((f) =>
      f.id === facilityId ? { ...f, state: { kind: 'garden', growthStage: 0, lastTendedDay: advanced.day } } : f
    );
    const nextState: GameState = {
      ...advanced,
      inventory: addResources(advanced.inventory, GARDEN_HARVEST_YIELD),
      facilities: nextFacilities,
    };
    message = '텃밭에서 작물을 수확했다.';
    diaryText = '해가 질 무렵 텃밭에서 작물을 수확했다.';
    const withDiary = pushDiaryEntry(nextState, getTimeOfDay(nextState.timeMinutes), diaryText, 'survival');
    return { ok: true, state: withDiary, message };
  }

  const nextStage = (gardenState.growthStage + 1) as 0 | 1 | 2 | 3;
  nextFacilities = advanced.facilities.map((f) =>
    f.id === facilityId ? { ...f, state: { kind: 'garden', growthStage: nextStage, lastTendedDay: advanced.day } } : f
  );
  const nextState: GameState = { ...advanced, facilities: nextFacilities };
  message = '텃밭을 돌봤다.';
  diaryText =
    nextStage === 1
      ? '텃밭에 처음으로 새싹이 돋았다.'
      : nextStage === 2
        ? '텃밭의 작물이 제법 자랐다.'
        : '텃밭의 작물이 수확할 수 있을 만큼 자랐다.';
  const withDiary = pushDiaryEntry(nextState, getTimeOfDay(nextState.timeMinutes), diaryText, 'survival');
  return { ok: true, state: withDiary, message };
}

export function cleanRooftop(state: GameState): DomainResult {
  const advanced = advanceTime(state, CLEAN_TIME_MINUTES);
  const nextState: GameState = {
    ...advanced,
    stats: { ...advanced.stats, fatigue: clamp(advanced.stats.fatigue + 5, 0, 100) },
  };
  const withDiary = pushDiaryEntry(
    nextState,
    getTimeOfDay(nextState.timeMinutes),
    '옥상을 정리했다. 조금씩 내 공간다워진다.',
    'survival'
  );
  return { ok: true, state: withDiary, message: '옥상을 정리했다.' };
}
