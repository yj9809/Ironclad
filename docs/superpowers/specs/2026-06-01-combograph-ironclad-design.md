# ComboGraph — Ironclad 적용 설계 (Phase 1+2)

- **작성일:** 2026-06-01
- **대상 프로젝트:** `D:/Unreal/Wr/Ironclad/` (UE 5.6, Blueprint 기반 + 신규 C++ 모듈)
- **브랜치:** `Combo-test` (`Source/`가 아직 untracked, `Ironclad.uproject` modified)
- **상위 스펙:** Notion 로드맵 「Ironclad 콤보 그래프 + UI 개발 계획」 — 본 문서는 그 **Phase 1(런타임 전환) + Phase 2(라이브 입력 HUD)**의 구현 설계.

---

## 1. 목표

1. 현재 Blueprint 콤보 시스템(`EPlayerState` + `DT_ComboTable`)을 **C++ `UComboGraphAsset` 주도**로 전환하고, **기존 BP와 동일한 거동**을 확인한다.
2. **몬헌식 콤보 UI**(C++ UMG): 현재 콤보 노드 기준으로 "다음에 어떤 입력을 누르면 어디로 가는지"를 라이브로 표시한다.

본 단계는 **사용자가 제시한 구조체 범위까지만** 다룬다. 히트스톱/판정범위/데미지 배율의 그래프 편입은 후속 작업으로 미룬다.

## 2. 핵심 통찰

Ironclad는 **이미 상태머신**이다.

- `EPlayerState` = 현재 상태(= 노드)
- "상태 X에서 L/R 입력 → 상태 Y" = 전이(엣지)
- `DT_ComboTable` = **섹션 이름을 키**로 하는 상태별 데이터(히트스톱·데미지·판정범위)

따라서 그래프 전환은 리버스 엔지니어링이 아니라 **기계적 매핑**이다.

| 기존 BP | → | ComboGraph |
|---|---|---|
| `EPlayerState` 값 | → | `FName NodeID` |
| 상태×입력 → 다음 상태 분기 로직 | → | `FComboTransition` 엣지 |
| `DT_ComboTable` 행 (섹션 키) | → | **그대로 유지, 무수정** |

## 3. 책임 분리 (설계의 핵심)

"최소 구조체"와 "기존 거동 동일"은 아래 분리로 **모순 없이** 성립한다. `DT_ComboTable`이 **섹션 이름 기준**이므로, 그래프는 섹션 전이만 결정하고 히트/히트스톱 경로는 섹션 키로 그대로 살아있다.

### C++가 소유
- `UComboGraphAsset` — 노드/전이/루트 데이터 (사용자 제시 구조체 기반)
- **얇은 BlueprintCallable 질의 API** (런타임과 UI가 공유하는 단일 진입점):
  - `GetTransitionsFrom(FName NodeID) → TArray<FComboTransition>` — 현재 노드에서 나가는 모든 전이. **런타임과 HUD가 동일하게 사용.**
  - `ResolveNext(FName NodeID, FGameplayTag TriggerTag) → 다음 NodeID + SectionName` (+ 전이 존재 여부 bool)
  - `GetRootTransitions() → TArray<FComboTransition>` — Neutral 상태의 가능한 시작 입력
  - 노드 조회: 로드 시 `TMap<FName, FComboNode>` 1회 구축(O(1)) 또는 `FindNode(NodeID)`

### Blueprint이 계속 소유 (무수정 또는 최소 수정)
- 몽타주 재생, 입력 버퍼링 윈도우, Yaw 회전 잠금/복원
- AnimNotify 기반 히트 판정
- 섹션 키 기반 `DT_ComboTable` 조회(히트스톱·데미지·판정범위)

### UI는 거의 공짜
런타임이 쓰는 `GetTransitionsFrom(현재노드)`가 **곧 HUD가 그릴 데이터**다. "현재 노드에서 나가는 엣지 = 다음에 누를 수 있는 입력 + 방향". 동일 API를 런타임과 UI가 공유하므로 Phase 2 HUD는 API 위의 얇은 표현 레이어다.

## 4. 데이터 모델 변경

현재 `FComboNode`/`FComboTransition`은 순수 `USTRUCT()`라 **BP에서 보이지 않는다.** BP 전투/UI가 읽으려면 노출이 필요하다. 더불어 이번 세션에서 **트리거 타입을 enum → GameplayTag로 교체**하고 **표시 라벨 필드를 추가**한다.

**노출 (BP 가시화):**
- `FComboTransition`, `FComboNode`에 `USTRUCT(BlueprintType)` 부여
- 각 필드 `UPROPERTY`에 `BlueprintReadOnly` 추가 (현재는 `EditAnywhere`만)
- 노드 조회용 lookup(PostLoad 맵 또는 `FindNode`) 추가

**트리거: `EComboInput` → `FGameplayTag` (오늘 결정)**
- `FComboTransition.Input`(enum) → `FComboTransition.TriggerTag`(`FGameplayTag`)로 교체. 예: `Input.Light`, `Input.Heavy`. 닫힌 enum의 경직성을 풀어 미래 GAS/스킬 기반(`Skill.*`)까지 동일 체계로 흡수.
- `EComboInput` enum은 제거(또는 입력→태그 매핑 보조용으로만 잔존).
- **셋업 비용(일회성):** `Ironclad.Build.cs`에 `GameplayTags` 모듈 추가 + 태그 등록(`DefaultGameplayTags.ini` 또는 네이티브 태그 선언).

**표시 라벨: `DisplayLabel` 추가 (오늘 결정)**
- `FComboNode`에 `FText DisplayLabel` 신규. UI가 그릴 라벨(예: "LL", "올려베기")을 내부 `NodeID`와 분리 → 표기·현지화 자유. UI는 이 라벨 + 트리거만 보고 그리므로 `SectionName`/`Damage`를 몰라도 깨지지 않는다(의존성 역전 실증).

**flat 유지 (이번 범위에서 확장 안 함):**
- `SectionName`, `Damage`는 노드에 flat으로 둔다. **Instanced UObject 페이로드 분리는 Phase 3**(BladeZ가 2번째 데이터 포인트를 줄 때)로 미룬다. 판별 근거: Phase 1 UI는 페이로드를 안 보고, 소비자가 아직 하나뿐이라 분리 경계가 검증 안 된 추측이 됨.

> **주석 리뷰 메모:** 현재 구조체의 한국어 주석은 적절하고 충분하다. 노출 변경 시 새 질의 API에는 "런타임·UI 공용"임을, `TriggerTag`·`DisplayLabel`에는 각각 "게임 무관 트리거 토큰", "UI 표시 전용 라벨"임을 한 줄로 명시할 것.

## 5. 런타임 흐름

1. Neutral(콤보 없음): 가능한 입력 = `GetRootTransitions()`
2. 입력이 버퍼 윈도우 안에 들어오면: 입력을 `TriggerTag`로 변환 → `ResolveNext(현재NodeID, TriggerTag)` → 다음 NodeID + SectionName
3. 몽타주를 해당 SectionName으로 점프, 현재 NodeID 갱신
4. 해당 입력의 전이가 없으면 무시(또는 콤보 종료) — **기존 BP 거동에 맞춰 결정**
5. 히트스톱/데미지/판정은 기존 섹션 키 `DT_ComboTable` 경로가 변경 없이 처리

현재 상태의 단일 진실원본(source of truth)이 `EPlayerState`에서 **현재 NodeID**로 이동한다.

## 6. UI — 몬헌식 콤보 HUD (C++ UMG)

- **정적 트리(로드맵 Phase 1 인수 테스트):** 루트에서 그래프를 순회(BFS/DFS)해 `LL→{LLL, LLR}` 분기를 렌더. 이게 되면 모델 리팩터가 성립함을 시각적으로 증명.
- **라이브 HUD(Phase 2):** 현재 NodeID에 바인딩 → `GetTransitionsFrom(현재노드)`로 다음 가능한 입력/방향을 표시·하이라이트.
- 구현은 C++ `UUserWidget` 파생. 노드 라벨/입력 표기만 필요하며, 트리거의 *의미*(L/Heavy 등)는 몰라도 깨지지 않도록 라벨 중심으로 그린다.

## 7. 검증 순서 (각 단계 = 체크포인트, 멈출 수 있는 지점)

1. **구조체 노출 + 질의 API** → 콤보 1개(예: L 체인)를 ComboGraph 에셋으로 저작
2. **BP 전이 로직 → 그래프 질의로 교체** → **기존 BP와 거동 대조** *(아래 §8 산출물 필요)*
3. **정적 트리 위젯 렌더** (`LL→{LLL,LLR}`) — 로드맵 Phase 1 인수 테스트
4. **현재 노드 바인딩 → 라이브 몬헌 HUD** (Phase 2)

각 체크포인트는 독립적으로 검증 가능하며, 1단계만으로도 모델이 에디터에서 저작되는지 확인된다.

## 8. 거동 동일 검증에 필요한 산출물 (구현 시 사용자 제공)

`.uasset`은 텍스트로 읽을 수 없으므로 §7 체크포인트 2에서 다음이 필요하다.

- `DT_ComboTable` 내용 (CSV/JSON export 또는 붙여넣기)
- 상태×입력 → 다음 상태 전이 규칙
- 입력 버퍼 윈도우 값

이 산출물이 확보되기 전까지 "기존과 동일 거동"은 **검증된 사실이 아니라 목표**로 둔다.

## 9. 하드 레일 (Notion 로드맵 기준 유지)

- **UI가 데이터 모델의 인수 테스트** — 모델과 UI를 한 덩어리로 출시.
- **저작 툴(EUW)은 만들지 않는다** — 모델 검증 후 후속(v4).
- **플러그인/인터페이스/어댑터 추상화는 지금 만들지 않는다.** 본 단계는 Ironclad 직결로 검증하고, 추상화는 2번째 소비자(BladeZ)가 생기는 Phase 3에서 추출한다.
  - *주의:* Notion Phase 1 체크리스트의 "얇은 adapter → ComboGraph 인터페이스" 항목은 이 하드 레일과 충돌하므로 본 단계에서는 **보류**(사용자 결정 반영).
- **새 프로젝트를 만들지 않는다** — `Combo-test` 브랜치에서 작업.

## 10. 작업 환경 메모

- 이 설계 세션은 빈 폴더 `D:\Unreal\Ironclad\Ironclad`에서 열렸다. 실제 작업/커밋은 **`D:\Unreal\Wr\Ironclad`** 루트에서 진행해야 git·메모리가 올바른 루트를 가리킨다.
- 본 문서는 마크다운 설계만이며 커밋 여부는 사용자 확인 후 결정한다.

## 11. 결정 기록 (이번 세션)

| 항목 | 결정 |
|---|---|
| 콤보-몽타주 매핑 | 단일 몽타주 + 섹션 |
| 트리거 타입 | **`EComboInput` enum → `FGameplayTag`** (GAS/스킬 기반 대비, 닫힌 enum 경직성 제거) |
| 표시 라벨 | **`FComboNode.DisplayLabel`(`FText`) 신규** — 내부 ID와 분리 |
| 노드 게임고유 데이터(SectionName/Damage) | flat 유지, **Instanced 페이로드 분리는 Phase 3** |
| `DT_ComboTable` 키 | 섹션 이름 기준 |
| 위젯 구현 | C++ UMG |
| 추상화(인터페이스/어댑터) | 본 단계 보류, Phase 3로 |
