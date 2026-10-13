# 개발 문서 — 마지막 옥상 (The Last Rooftop)

게임 자체에 대한 설명은 [README.md](../README.md)를 참고. 이 문서는 코드 구조와 설계 원칙을 다룬다.

## 빠른 시작

```bash
npm install
npm run dev       # 개발 서버 (http://localhost:5173)
npm run build     # 타입체크 + 프로덕션 빌드
npm run preview   # 빌드 결과 미리보기
npm run lint      # oxlint
```

Node 20+ 권장. 외부 이미지 에셋 없이 Canvas 2D로 전부 직접 그린다(의존성은 `react`/`react-dom`뿐).

## 기술 스택

- Vite + React 19 + TypeScript (strict: `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`)
- 상태 관리: 별도 라이브러리 없이 `useReducer` + `Context`
- 렌더링: 순수 Canvas 2D (PixiJS 등 미사용)
- 저장: `localStorage` (버전드 스키마 + 마이그레이션)

## 프로젝트 구조

```
src/
  game/                 게임 로직 — React/Canvas를 전혀 모르는 순수 TS
    state/              GameState 타입, 초기 상태, reducer, 액션 타입
    domain/             실제 상태 변경 로직 (reducer가 호출하는 순수 함수들)
      tick.ts             매 초 실시간 틱 하나를 처리하는 오케스트레이터
      events.ts           무작위 이벤트(탐사 제안/생존자 방문/좀비 위장) 발생·해결
      survival.ts          자동 섭취(허기·갈증 임계치 넘으면 보유 자원으로 자동 해결)
      facilities.ts         건설(공사 지연 포함)·철거·텃밭 돌보기
    data/                정적 데이터 (옥상 격자, 시설 카탈로그, 장소 풀, 배경 플레이버)
    save/                localStorage 저장/불러오기/마이그레이션

  render/               Canvas 2D 월드 렌더러 — GameState를 전혀 모름
    viewModel.ts         ★ GameState -> WorldSnapshot 변환 (game/와의 유일한 접점)
    WorldCanvas.tsx       React 래퍼 (rAF 루프, 포인터 이벤트 -> 그리드 셀 변환)
    drawWorld.ts          메인 draw 루프
    layers/               하늘/도시/옥상/시설/건설모드/비 — 레이어별 그리기 함수
    sprites/              문자-그리드 픽셀아트 정의 + 래스터화 + 캐시

  context/GameContext.tsx  useReducer Provider + 실시간 틱 루프 + 자동저장 + useGame() 훅

  ui/                   React 컴포넌트 (좌 상태 / 중앙 월드 / 우 건설·물자·일기 탭)
    layout/ status/ actions/ events/ common/ landing/
```

### 핵심 설계 원칙

1. **`game/`은 렌더러와 UI를 모른다.** 모든 게임 규칙(자원, 시간, 건설 검증, 이벤트 결과)은 `game/domain/*.ts`의 순수 함수로만 존재한다. 컴포넌트는 `dispatch(action)`과 읽기 전용 쿼리(`canAfford`, `canPlaceFacility`)만 호출하고, 자원이나 상태를 직접 계산하지 않는다.
2. **`render/`은 `game/`을 모른다.** 렌더러는 `WorldSnapshot`(시간/날씨/날짜/시설 좌표·상태)이라는 작은 스냅샷만 입력받는 순수 그리기 함수다. 이 둘을 잇는 유일한 파일이 `render/viewModel.ts`다. 새 시설 종류를 추가할 때는 `game/`과 `render/` 양쪽에 각각 반영해야 한다.
3. **파생값은 저장하지 않는다.** `timeOfDay`(새벽/낮/노을/밤)와 도시 쇠퇴 단계는 `day`/`timeMinutes`로부터 그때그때 계산한다(`game/domain/time.ts`의 `getTimeOfDay`, `render/decay.ts`의 `decayStageForBuilding`). 저장된 값과 어긋나는 버그를 원천 차단하기 위함이다.
4. **픽셀아트는 전부 코드로 생성한다.** `render/sprites/*.ts`에 문자-그리드(`PixelSprite`)로 정의하고 `rasterizeSprite()`로 오프스크린 캔버스에 한 번만 그린 뒤 `spriteCache.ts`에 캐시해 재사용한다. 건물은 하나의 "온전한" 그리드만 손으로 정의하고, 손상/덩굴 단계는 건물별 고정 시드로 결정론적으로 생성한다(`render/sprites/buildingSprites.ts`의 `applyDecayOverlay`).
5. **시간은 실시간으로 흐른다.** `GameContext.tsx`가 1초마다 `TICK` 액션을 디스패치(하루=90초, `MINUTES_PER_DAY / 90`분씩 전진)하고, `document.hidden`이면 디스패치를 건너뛴다(추격 계산 없이 그냥 멈췄다가 이어짐). `game/domain/tick.ts`의 `applyTick`이 매 틱마다 시간 전진 → 자동 섭취/심야 회복 → (날짜가 넘어갔다면) 공사 완료 체크·이벤트 발생 굴림 → 배경 플레이버 굴림 순서로 처리한다. `state.pendingEvent`가 있으면 `applyTick`은 즉시 원래 state를 반환한다(이벤트 팝업이 떠 있는 동안 시간 정지).

## 자주 손댈 만한 지점

| 하고 싶은 것 | 건드릴 파일 |
|---|---|
| 새 시설 종류 추가 | `game/data/facilities.ts`(비용/판정) → `game/domain/facilities.ts`(초기 상태, `BUILD_DURATION_DAYS`) → `render/sprites/facilitySprites.ts`(스프라이트) → `render/layers/facility.ts`(그리기 분기) → `render/viewModel.ts`(상태 변환) |
| 새 탐사 장소 추가 | `game/data/locationPool.ts`에 `LocationProfile` 하나 추가 (UI/로직 변경 불필요 — 이벤트 발생 시 전체 풀에서 무작위로 뽑힘) |
| 하루 중 이벤트(탐사 제안/생존자/좀비) 발생 확률·비중 조정 | `game/domain/events.ts`의 `EVENT_TRIGGER_CHANCE`와 `rollForEvent` 내부 비중 |
| 생존 수치 밸런스(허기·갈증·피로 증가 속도, 심야 회복 속도) 조정 | `game/domain/time.ts` 상단의 `*_RATE_PER_MIN`, `NIGHT_REST_*` 상수 |
| 자동 섭취 임계치 조정 | `game/domain/survival.ts`의 `EAT_HUNGER_THRESHOLD`/`DRINK_THIRST_THRESHOLD` |
| 하루=몇 초인지(틱 속도) 조정 | `context/GameContext.tsx`의 `REAL_SECONDS_PER_GAME_DAY` |
| 건설 완성 기간 조정 | `game/domain/facilities.ts`의 `BUILD_DURATION_DAYS` |
| 건설 비용/환급률 조정 | `game/data/facilities.ts`, `game/domain/facilities.ts`의 `DEMOLISH_REFUND_RATE` |
| 도시 쇠퇴 속도 조정 | `render/decay.ts`의 `STAGE1_DAY`/`STAGE2_DAY` |
| 하루 시간대별 하늘 색/노을 | `render/time.ts`의 `KEYFRAMES` |
| 색상 팔레트 전체 | `render/palette.ts` |
| 옥상 격자 크기/막힌 칸 | `game/data/rooftop.ts` |
| UI 색상/레이아웃 | `src/index.css`(CSS 변수), `src/ui/**/*.module.css` |

## 알려진 제한 사항 / 다음에 할 만한 것

- 생존자/좀비 위장 방문은 일회성 이벤트다 — 받아들인 생존자가 동료로 남아 이후 플레이에 영향을 주는 시스템은 아직 없다.
- "의료품" 전용 자원은 없다 — 병원 테마는 기존 자원(배터리·천)에 가중치를 주는 방식으로만 구현돼 있다.
- 빗물 수집기(`rainCollector`)는 시설 틀과 수위 표시 로직은 있지만, 실제로 비가 올 때 `waterLevel`을 채워주는 연결 고리가 아직 없다.
- 날씨(`weather`)는 상태 타입과 렌더링(비 효과)은 있지만 자동으로 바뀌는 로직이 없다 — 항상 `clear`로 시작해 바뀌지 않는다.
- 저장 슬롯은 1개뿐(localStorage 단일 키). 여러 세이브가 필요하면 `game/save/storage.ts`의 `SAVE_KEY`를 확장해야 한다.
- 이벤트 발생 확률은 플레이테스트 한 바퀴 수준으로만 조정했다 — 초반 2~3일 안에 탐사 기회가 한 번도 안 뜨면 식량이 바닥날 수 있으니, 너무 가혹하면 `EVENT_TRIGGER_CHANCE`를 더 올리는 걸 고려.

## 검증 방법

```bash
npm run build   # 타입 에러 0, 빌드 성공 확인
npm run lint    # oxlint 에러 0 확인
npm run dev     # 브라우저에서 가만히 지켜보며: 시계가 저절로 도는지, 90초 내외로 하루가
                # 넘어가는지, 허기/갈증이 임계치 넘으면 자동으로 해결되는지, 건설 후
                # "공사 중" 표시를 거쳐 며칠 뒤 완성되는지, 무작위 이벤트 팝업(탐사 제안/
                # 생존자 방문/좀비 위장)이 뜨고 뜬 동안 시계가 멈추는지, 다른 탭으로
                # 옮겼다 돌아오면 멈췄다 이어지는지 확인
```
