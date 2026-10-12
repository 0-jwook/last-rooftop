import type { GameState } from '../state/types';

export interface LocationDef {
  id: string;
  name: string;
  description: string;
  unlockCondition: (state: GameState) => boolean;
  eventIds: string[];
}

export const LOCATIONS: LocationDef[] = [
  {
    id: 'convenience_store',
    name: '편의점',
    description: '건물 아래 작은 편의점. 식량과 음료가 남아있을지도 모른다.',
    unlockCondition: () => true,
    eventIds: ['conveniencestore_dusty_shelves', 'conveniencestore_broken_fridge', 'conveniencestore_seed_packet'],
  },
  {
    id: 'apartment',
    name: '아파트',
    description: '사람이 떠난 아파트 단지. 생활용품과 건설 재료가 남아있을 수 있다.',
    unlockCondition: (state) => state.day >= 3,
    eventIds: ['apartment_locked_door', 'apartment_hidden_toolbox', 'apartment_letter'],
  },
  {
    id: 'pharmacy',
    name: '약국',
    description: '구급용품과 회복 자원을 구할 수 있는 약국.',
    unlockCondition: (state) => state.day >= 5 || (state.locations['apartment']?.visitCount ?? 0) >= 2,
    eventIds: ['pharmacy_risky_medicine', 'pharmacy_soaked_supplies', 'pharmacy_old_device'],
  },
];
