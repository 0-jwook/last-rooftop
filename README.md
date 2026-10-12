# 마지막 옥상 (The Last Rooftop)

좀비 아포칼립스 이후, 작은 옥상에서 하루하루를 보내는 힐링형 생존 웹게임 MVP.
전투 중심이 아니라 생존·정착·탐험·풍경 감상이 중심이다.

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
    data/                정적 데이터 (옥상 격자, 시설 카탈로그, 탐사 장소/이벤트)
    save/                localStorage 저장/불러오기/마이그레이션

  render/               Canvas 2D 월드 렌더러 — GameState를 전혀 모름
    viewModel.ts         ★ GameState -> WorldSnapshot 변환 (game/와의 유일한 접점)
    WorldCanvas.tsx       React 래퍼 (rAF 루프, 포인터 이벤트 -> 그리드 셀 변환)
    drawWorld.ts          메인 draw 루프
    layers/               하늘/도시/옥상/시설/건설모드/비 — 레이어별 그리기 함수
    sprites/              문자-그리드 픽셀아트 정의 + 래스터화 + 캐시

  context/GameContext.tsx  useReducer Provider + 자동저장 + useGame() 훅

  ui/                   React 컴포넌트 (좌 상태 / 중앙 월드 / 우 행동 탭)
    layout/ status/ actions/ common/
```

### 핵심 설계 원칙

1. **`game/`은 렌더러와 UI를 모른다.** 모든 게임 규칙(자원, 시간, 건설 검증, 탐사 결과)은 `game/domain/*.ts`의 순수 함수로만 존재한다. 컴포넌트는 `dispatch(action)`과 읽기 전용 쿼리(`canAfford`, `canPlaceFacility`)만 호출하고, 자원이나 상태를 직접 계산하지 않는다.
2. **`render/`은 `game/`을 모른다.** 렌더러는 `WorldSnapshot`(시간/날씨/날짜/시설 좌표·상태)이라는 작은 스냅샷만 입력받는 순수 그리기 함수다. 이 둘을 잇는 유일한 파일이 `render/viewModel.ts`다. 새 시설 종류를 추가할 때는 `game/`과 `render/` 양쪽에 각각 반영해야 한다.
3. **파생값은 저장하지 않는다.** `timeOfDay`(새벽/낮/노을/밤)와 도시 쇠퇴 단계는 `day`/`timeMinutes`로부터 그때그때 계산한다(`game/domain/time.ts`의 `getTimeOfDay`, `render/decay.ts`의 `decayStageForBuilding`). 저장된 값과 어긋나는 버그를 원천 차단하기 위함이다.
4. **픽셀아트는 전부 코드로 생성한다.** `render/sprites/*.ts`에 문자-그리드(`PixelSprite`)로 정의하고 `rasterizeSprite()`로 오프스크린 캔버스에 한 번만 그린 뒤 `spriteCache.ts`에 캐시해 재사용한다. 건물은 하나의 "온전한" 그리드만 손으로 정의하고, 손상/덩굴 단계는 건물별 고정 시드로 결정론적으로 생성한다(`render/sprites/buildingSprites.ts`의 `applyDecayOverlay`).

## 자주 손댈 만한 지점

| 하고 싶은 것 | 건드릴 파일 |
|---|---|
| 새 시설 종류 추가 | `game/data/facilities.ts`(비용/판정) → `game/domain/facilities.ts`(초기 상태) → `render/sprites/facilitySprites.ts`(스프라이트) → `render/layers/facility.ts`(그리기 분기) → `render/viewModel.ts`(상태 변환) |
| 새 탐사 이벤트/장소 추가 | `game/data/events.ts`, `game/data/locations.ts` — 둘 다 데이터만 추가하면 됨 (UI/로직 변경 불필요) |
| 생존 수치 밸런스 조정 | `game/domain/time.ts` 상단의 `*_RATE_PER_MIN`, `*_HEALTH_LOSS_PER_MIN` 상수 |
| 건설 비용/환급률 조정 | `game/data/facilities.ts`, `game/domain/facilities.ts`의 `DEMOLISH_REFUND_RATE` |
| 도시 쇠퇴 속도 조정 | `render/decay.ts`의 `STAGE1_DAY`/`STAGE2_DAY` |
| 하루 시간대별 하늘 색/노을 | `render/time.ts`의 `KEYFRAMES` |
| 색상 팔레트 전체 | `render/palette.ts` |
| 옥상 격자 크기/막힌 칸 | `game/data/rooftop.ts` |
| UI 색상/레이아웃 | `src/index.css`(CSS 변수), `src/ui/**/*.module.css` |

## 알려진 제한 사항 / 다음에 할 만한 것

- 탐사 이벤트가 장소당 3개(총 9개)뿐이라 반복 플레이 시 금방 소진된다. `game/data/events.ts`에 같은 스키마로 추가하면 된다.
- 빗물 수집기(`rainCollector`)는 시설 틀과 수위 표시 로직은 있지만, 실제로 비가 올 때 `waterLevel`을 채워주는 연결 고리가 아직 없다(`game/domain/facilities.ts`에 날씨 반영 로직 추가 필요).
- 날씨(`weather`)는 상태 타입과 렌더링(비 효과)은 있지만 자동으로 바뀌는 로직이 없다 — 항상 `clear`로 시작해 플레이어 행동으로는 바뀌지 않는다.
- 저장 슬롯은 1개뿐(localStorage 단일 키). 여러 세이브가 필요하면 `game/save/storage.ts`의 `SAVE_KEY`를 확장해야 한다.

## 검증 방법

```bash
npm run build   # 타입 에러 0, 빌드 성공 확인
npm run lint    # oxlint 에러 0 확인
npm run dev     # 브라우저에서 탐사 → 건설 → 생활 → 일기 → 새로고침 후 유지 확인
```
