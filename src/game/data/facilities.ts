import type { FacilityType, GridPosition, Inventory } from '../state/types';

export interface FacilityDef {
  type: FacilityType;
  name: string;
  description: string;
  cost: Partial<Inventory>;
  footprint: GridPosition[];
}

export const FACILITY_CATALOG: Record<FacilityType, FacilityDef> = {
  tent: {
    type: 'tent',
    name: '텐트',
    description: '휴식 효과를 높여주는 작은 텐트.',
    cost: { cloth: 2, wood: 1 },
    footprint: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ],
  },
  garden: {
    type: 'garden',
    name: '작은 텃밭',
    description: '시간이 지나면 자라서 수확할 수 있다.',
    cost: { wood: 2, seeds: 1 },
    footprint: [{ x: 0, y: 0 }],
  },
  rainCollector: {
    type: 'rainCollector',
    name: '빗물 수집기',
    description: '비가 오면 빗물을 모은다.',
    cost: { cloth: 1, scrap: 1 },
    footprint: [{ x: 0, y: 0 }],
  },
  solarPanel: {
    type: 'solarPanel',
    name: '태양광 발전기',
    description: '낮에 전기를 모아 밤에 사용한다.',
    cost: { scrap: 2, battery: 1 },
    footprint: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ],
  },
  lamp: {
    type: 'lamp',
    name: '작은 조명',
    description: '밤에 옥상을 따뜻하게 밝힌다.',
    cost: { scrap: 1, battery: 1 },
    footprint: [{ x: 0, y: 0 }],
  },
};

export const DEMOLISH_REFUND_RATE = 0.5;
