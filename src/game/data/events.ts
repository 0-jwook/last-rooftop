import type { Inventory } from '../state/types';

export interface EventChoice {
  id: string;
  label: string;
  risk: number;
  timeCost: number;
  fatigueCost: number;
  resourceDelta: Partial<Inventory>;
  failureResourceDelta?: Partial<Inventory>;
  outcomeText: string;
  failureText?: string;
  diaryHook?: (outcome: 'success' | 'failure') => string;
}

export interface EventDef {
  id: string;
  locationId: string;
  flavorText: string;
  choices: EventChoice[];
}

export interface ExploreOutcome {
  success: boolean;
  resourceDelta: Partial<Inventory>;
  text: string;
}

export function resolveEvent(event: EventDef, choiceId: string, rng: () => number = Math.random): ExploreOutcome {
  const choice = event.choices.find((c) => c.id === choiceId);
  if (!choice) {
    return { success: false, resourceDelta: {}, text: '아무 일도 일어나지 않았다.' };
  }
  const failed = choice.risk > 0 && rng() < choice.risk;
  if (failed) {
    return {
      success: false,
      resourceDelta: choice.failureResourceDelta ?? {},
      text: choice.failureText ?? choice.outcomeText,
    };
  }
  return { success: true, resourceDelta: choice.resourceDelta, text: choice.outcomeText };
}

export const EVENTS: EventDef[] = [
  // 편의점
  {
    id: 'conveniencestore_dusty_shelves',
    locationId: 'convenience_store',
    flavorText:
      '깨진 유리창 사이로 들어온 햇빛이 먼지 쌓인 진열대를 비춘다. 유통기한이 한참 지난 통조림 몇 개가 선반 구석에 남아있다.',
    choices: [
      {
        id: 'careful_search',
        label: '조심스럽게 뒤져본다',
        risk: 0,
        timeCost: 60,
        fatigueCost: 5,
        resourceDelta: { food: 2 },
        outcomeText: '먼지를 털어내자 녹슬지 않은 통조림 두 개를 찾았다.',
        diaryHook: () => '편의점 구석에서 통조림을 찾았다. 아직 쓸만한 게 남아있다니, 다행이다.',
      },
      {
        id: 'knock_over_shelf',
        label: '선반을 통째로 뒤엎는다',
        risk: 0.4,
        timeCost: 30,
        fatigueCost: 10,
        resourceDelta: { food: 4, scrap: 1 },
        failureResourceDelta: {},
        outcomeText: '선반이 와르르 무너지며 통조림과 고철 조각이 쏟아져 나왔다.',
        failureText: '선반이 무너지며 요란한 소리가 났다. 빈손으로 물러났다.',
        diaryHook: (o) =>
          o === 'success'
            ? '급한 대로 선반을 엎었더니 꽤 많은 걸 건졌다. 소리가 너무 컸던 게 마음에 걸린다.'
            : '선반을 엎었다가 아무것도 못 건지고 소리만 요란했다. 조심해야겠다.',
      },
      {
        id: 'leave',
        label: '그냥 지나친다',
        risk: 0,
        timeCost: 10,
        fatigueCost: 0,
        resourceDelta: {},
        outcomeText: '괜히 위험을 무릅쓰고 싶지 않아 발길을 돌렸다.',
      },
    ],
  },
  {
    id: 'conveniencestore_broken_fridge',
    locationId: 'convenience_store',
    flavorText: '작동을 멈춘 냉장고 문이 반쯤 열려 있다. 안에서 상한 냄새가 희미하게 난다.',
    choices: [
      {
        id: 'search_fridge',
        label: '안을 뒤져본다',
        risk: 0.3,
        timeCost: 40,
        fatigueCost: 10,
        resourceDelta: { water: 2 },
        failureResourceDelta: {},
        outcomeText: '냄새를 참고 뒤지자 밀봉된 생수 몇 병이 남아있었다.',
        failureText: '냄새가 너무 심해 금방 포기했다.',
      },
      {
        id: 'close_fridge',
        label: '문을 닫고 돌아선다',
        risk: 0,
        timeCost: 10,
        fatigueCost: 0,
        resourceDelta: {},
        outcomeText: '괜히 시간을 낭비하고 싶지 않았다.',
      },
    ],
  },
  {
    id: 'conveniencestore_seed_packet',
    locationId: 'convenience_store',
    flavorText: '계산대 옆 작은 바구니에 씨앗 봉투 몇 개가 떨어져 있다.',
    choices: [
      {
        id: 'take_seeds',
        label: '챙긴다',
        risk: 0,
        timeCost: 15,
        fatigueCost: 0,
        resourceDelta: { seeds: 2 },
        outcomeText: '씨앗 봉투를 조심스럽게 챙겼다. 텃밭에 심을 수 있겠다.',
        diaryHook: () => '편의점에서 씨앗 봉투를 발견했다. 언젠가 텃밭에 심어볼 수 있을 것 같다.',
      },
      {
        id: 'leave_seeds',
        label: '그냥 둔다',
        risk: 0,
        timeCost: 5,
        fatigueCost: 0,
        resourceDelta: {},
        outcomeText: '지금 당장은 필요 없어 보여 그냥 두었다.',
      },
    ],
  },

  // 아파트
  {
    id: 'apartment_locked_door',
    locationId: 'apartment',
    flavorText: '복도 끝 집 현관문이 굳게 잠겨 있다. 안쪽에서는 아무 소리도 들리지 않는다.',
    choices: [
      {
        id: 'pick_lock',
        label: '문을 따본다',
        risk: 0.3,
        timeCost: 90,
        fatigueCost: 15,
        resourceDelta: { cloth: 2, battery: 1 },
        failureResourceDelta: {},
        outcomeText: '손잡이를 이리저리 돌리자 딸깍 소리와 함께 문이 열렸다. 쓸만한 물건들을 챙겼다.',
        failureText: '한참을 씨름했지만 문은 꼼짝하지 않았다. 체력만 허비했다.',
        diaryHook: (o) =>
          o === 'success'
            ? '잠긴 문을 겨우 땄다. 쓸만한 배터리를 챙겨서 다행이다.'
            : '잠긴 문과 한참을 씨름했지만 결국 포기했다. 힘만 뺐다.',
      },
      {
        id: 'force_door',
        label: '문을 부순다',
        risk: 0,
        timeCost: 40,
        fatigueCost: 20,
        resourceDelta: { wood: 1 },
        outcomeText: '어깨로 문을 밀어붙여 강제로 열었다. 안으로 들어갈 수 있었다.',
      },
      {
        id: 'skip_door',
        label: '포기하고 다른 곳을 찾는다',
        risk: 0,
        timeCost: 10,
        fatigueCost: 0,
        resourceDelta: {},
        outcomeText: '시간 낭비하지 않기로 했다.',
      },
    ],
  },
  {
    id: 'apartment_hidden_toolbox',
    locationId: 'apartment',
    flavorText: '선반 밑에 먼지 쌓인 공구함이 숨겨져 있다.',
    choices: [
      {
        id: 'open_toolbox',
        label: '공구함을 연다',
        risk: 0.2,
        timeCost: 50,
        fatigueCost: 15,
        resourceDelta: { scrap: 2, wood: 1 },
        failureResourceDelta: {},
        outcomeText: '녹슨 공구함 안에서 고철과 나무 조각을 챙겼다.',
        failureText: '공구함 걸쇠가 부서지며 안의 물건이 못 쓰게 됐다.',
      },
      {
        id: 'skip_toolbox',
        label: '지나친다',
        risk: 0,
        timeCost: 10,
        fatigueCost: 0,
        resourceDelta: {},
        outcomeText: '시간이 없어 지나쳤다.',
      },
    ],
  },
  {
    id: 'apartment_letter',
    locationId: 'apartment',
    flavorText: '책상 위에 누군가 남긴 편지가 놓여 있다.',
    choices: [
      {
        id: 'read_letter',
        label: '편지를 읽는다',
        risk: 0,
        timeCost: 20,
        fatigueCost: 5,
        resourceDelta: {},
        outcomeText: '낯선 이가 가족을 찾아 떠난다는 내용이었다. 마음이 복잡해진다.',
        diaryHook: () =>
          '아파트에서 누군가 남긴 편지를 발견했다. 이 도시에 나 말고도 사람이 있었다는 사실이 이상하게 위로가 됐다.',
      },
      {
        id: 'leave_letter',
        label: '그대로 둔다',
        risk: 0,
        timeCost: 5,
        fatigueCost: 0,
        resourceDelta: {},
        outcomeText: '남의 사정에 끼어들고 싶지 않아 그대로 두었다.',
      },
    ],
  },

  // 약국
  {
    id: 'pharmacy_risky_medicine',
    locationId: 'pharmacy',
    flavorText: '진열장 너머 약품들이 가지런히 남아 있다. 유리가 깨져 있어 손을 뻗으면 다칠 위험이 있다.',
    choices: [
      {
        id: 'risk_reach',
        label: '위험을 감수하고 가져온다',
        risk: 0.35,
        timeCost: 40,
        fatigueCost: 10,
        resourceDelta: { cloth: 1, battery: 1 },
        failureResourceDelta: {},
        outcomeText: '조심스럽게 손을 뻗어 약품과 배터리를 챙겼다. 손끝이 살짝 긁혔지만 괜찮다.',
        failureText: '유리 조각에 손을 베였다. 급히 손을 빼냈다.',
      },
      {
        id: 'give_up_medicine',
        label: '포기한다',
        risk: 0,
        timeCost: 10,
        fatigueCost: 0,
        resourceDelta: {},
        outcomeText: '다치고 싶지 않아 포기했다.',
      },
    ],
  },
  {
    id: 'pharmacy_soaked_supplies',
    locationId: 'pharmacy',
    flavorText: '비에 젖은 상자 안에 물자가 들어있다. 일부는 이미 못 쓰게 된 듯하다.',
    choices: [
      {
        id: 'salvage_supplies',
        label: '건져 올린다',
        risk: 0.2,
        timeCost: 30,
        fatigueCost: 10,
        resourceDelta: { cloth: 2 },
        failureResourceDelta: {},
        outcomeText: '젖은 천 조각이지만 말리면 쓸만해 보인다.',
        failureText: '거의 다 썩어 있어 쓸 수 있는 게 없었다.',
      },
      {
        id: 'discard_supplies',
        label: '버리고 간다',
        risk: 0,
        timeCost: 5,
        fatigueCost: 0,
        resourceDelta: {},
        outcomeText: '시간 낭비라 생각해 버리고 지나쳤다.',
      },
    ],
  },
  {
    id: 'pharmacy_old_device',
    locationId: 'pharmacy',
    flavorText: '낡은 전자기기가 바닥에 널브러져 있다.',
    choices: [
      {
        id: 'disassemble_device',
        label: '분해해서 배터리를 뺀다',
        risk: 0.15,
        timeCost: 35,
        fatigueCost: 10,
        resourceDelta: { battery: 2 },
        failureResourceDelta: {},
        outcomeText: '조심스레 분해하자 쓸만한 배터리가 나왔다.',
        failureText: '분해하다가 부품이 망가져 아무것도 건지지 못했다.',
        diaryHook: (o) =>
          o === 'success'
            ? '낡은 전자기기를 분해해서 배터리를 건졌다. 쓸모를 다한 물건에서도 뭔가 건질 게 있다.'
            : '전자기기를 분해하려다 부품만 망가뜨렸다. 괜한 짓을 했다.',
      },
      {
        id: 'leave_device',
        label: '그냥 둔다',
        risk: 0,
        timeCost: 5,
        fatigueCost: 0,
        resourceDelta: {},
        outcomeText: '손댈 가치가 없어 보여 그냥 두었다.',
      },
    ],
  },
];

export const EVENTS_BY_ID: Record<string, EventDef> = Object.fromEntries(EVENTS.map((e) => [e.id, e]));
