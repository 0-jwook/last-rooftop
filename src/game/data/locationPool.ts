import type { Inventory } from '../state/types';

export interface LocationProfile {
  id: string;
  name: string;
  resourceWeights: Partial<Record<keyof Inventory, [min: number, max: number]>>;
  flavorLines: string[];
  mishapLines: string[];
}

export const LOCATION_POOL: LocationProfile[] = [
  {
    id: 'grocery_store',
    name: '식료품점',
    resourceWeights: { food: [2, 5], water: [0, 2] },
    flavorLines: [
      '식료품점 선반에 남아있던 통조림과 생수를 챙겼다.',
      '유통기한이 지났지만 아직 먹을 만한 것들을 찾았다.',
    ],
    mishapLines: ['선반이 무너지는 소리에 놀라 급히 빠져나왔다. 손에 쥔 건 많지 않았다.'],
  },
  {
    id: 'house',
    name: '가정집',
    resourceWeights: { cloth: [1, 3], wood: [1, 3], seeds: [0, 1] },
    flavorLines: [
      '누군가 살던 집에서 천 조각과 나무 자재를 챙겼다.',
      '베란다 화분 옆에 떨어진 씨앗 봉투를 발견했다.',
    ],
    mishapLines: ['삐걱대는 바닥 소리에 가슴이 철렁했다. 서둘러 나오느라 많이 챙기지 못했다.'],
  },
  {
    id: 'hospital',
    name: '병원',
    resourceWeights: { battery: [1, 3], cloth: [1, 2] },
    flavorLines: [
      '정전된 병원 구석에서 배터리와 붕대 몇 개를 챙겼다.',
      '약품 보관함은 비어 있었지만 전자기기에서 배터리를 뺄 수 있었다.',
    ],
    mishapLines: ['복도 안쪽에서 인기척이 느껴져 서둘러 발길을 돌렸다.'],
  },
  {
    id: 'restaurant',
    name: '식당',
    resourceWeights: { food: [1, 3], water: [1, 3] },
    flavorLines: [
      '문 닫은 식당 주방에서 생수병과 마른 식재료를 찾았다.',
      '냉장고는 상했지만 창고에 쟁여둔 물자가 남아 있었다.',
    ],
    mishapLines: ['주방 안쪽에서 뭔가 부서지는 소리가 나 조용히 물러났다.'],
  },
];

export const EXPLORE_MISHAP_CHANCE = 0.2;
export const EXPLORE_MISHAP_FATIGUE = 10;
