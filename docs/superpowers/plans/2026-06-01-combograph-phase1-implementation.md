# ComboGraph Phase 1 구현 계획

> **워커 안내:** 본 계획은 **사용자가 직접 코드를 작성**한다. 각 태스크는 "무엇을·어디에·왜"와 **시그니처/구조 + 동작 로직 설명**만 제공하고, **함수 본문은 사용자가 채운다.** 함수 본문을 대신 작성하지 않는다(사용자 전역 규칙: "코드 작성" 지시 전까지 코드 작성 금지).
>
> **검증 방식:** 이 프로젝트는 단위 테스트 하네스가 없다(CLAUDE.md). pytest식 TDD 대신 **① 에디터 컴파일 성공 ② 인-에디터 동작 확인**을 각 태스크의 체크포인트로 사용한다.

**목표:** Ironclad의 flat 콤보 로직을 `UComboGraphAsset`(GameplayTag 트리거) 주도의 그래프 순회로 전환하고, `LL→{LLL, LLR}` 분기를 그리는 read-only 트리 위젯으로 모델을 시각 증명한다(Phase 1 인수 테스트).

**아키텍처:** 그래프 데이터(`UComboGraphAsset`)를 직접 저작 → C++ 질의 API(`GetTransitionsFrom`/`ResolveNext`)를 런타임과 UI가 공유 → BP는 몽타주 재생·히트 판정·섹션 키 `DT_ComboTable` 조회를 그대로 유지. 플러그인/어댑터 추상화 없음(Phase 3로 보류).

**기술 스택:** UE 5.6 C++, GameplayTags, C++ UMG(`UUserWidget`), 기존 Blueprint 전투 시스템.

**상위 스펙:** [docs/superpowers/specs/2026-06-01-combograph-ironclad-design.md](../specs/2026-06-01-combograph-ironclad-design.md)

**작업 루트:** `D:/Unreal/Wr/Ironclad/` (브랜치 `Combo-test`). 빈 폴더 `D:/Unreal/Ironclad/Ironclad`가 아님.

---

## 파일 구조

| 파일 | 책임 | 작업 |
|---|---|---|
| `Source/Ironclad/Ironclad.Build.cs` | 모듈 의존성 | 수정 (GameplayTags, UMG, Slate, SlateCore 추가) |
| `Config/DefaultGameplayTags.ini` | 입력/스킬 트리거 태그 등록 | 생성 |
| `Source/Ironclad/Data/ComboGraphAsset.h` | 그래프 데이터 모델 + 질의 API 선언 | 수정 |
| `Source/Ironclad/Data/ComboGraphAsset.cpp` | 질의 API 구현 + 노드 lookup 구축 | 수정 |
| `Content/.../DA_IroncladCombo.uasset` | 저작된 콤보 그래프 데이터 | 에디터에서 생성 |
| 기존 플레이어 BP(`BP_IroncladCharacter`) | 런타임 전이를 그래프 질의로 교체 | 수정 (인-에디터) |
| `Source/Ironclad/UI/ComboTreeWidget.h/.cpp` | read-only 트리 위젯 | 생성 |
| `Content/.../WBP_ComboTree.uasset` | 위젯 BP(C++ 파생) | 에디터에서 생성 |

> **의존성 주의:** Task 5(BP 런타임 교체)와 그 동작 동일 검증은 **사용자만 가진 인-에디터 데이터**(현재 전이 규칙, 입력 버퍼 윈도우 값, `DT_ComboTable` 내용)가 필요하다. 스펙 §8 참조. Task 1~4와 6은 그 데이터 없이도 진행 가능하다.

---

## Task 1: 모듈 의존성 추가 + 트리거 태그 등록

**Files:**
- Modify: `Source/Ironclad/Ironclad.Build.cs:11`
- Create: `Config/DefaultGameplayTags.ini`

- [ ] **Step 1: `Build.cs`에 모듈 추가**

`PublicDependencyModuleNames`에 `"GameplayTags"`를, UMG 위젯용으로 `"UMG"`를 추가한다. `PrivateDependencyModuleNames`에는 `"Slate"`, `"SlateCore"`를 추가한다(현재 비어 있음). 11번 줄과 13번 줄을 다음 형태로:

```cpp
PublicDependencyModuleNames.AddRange(new string[] { "Core", "CoreUObject", "Engine", "InputCore", "GameplayTags", "UMG" });
PrivateDependencyModuleNames.AddRange(new string[] { "Slate", "SlateCore" });
```

- [ ] **Step 2: 트리거 태그 등록**

`Config/DefaultGameplayTags.ini`를 생성하고 콤보 입력 트리거 태그를 등록한다. Ironclad는 L/R 두 입력이므로 최소:

```ini
[/Script/GameplayTags.GameplayTagsSettings]
+GameplayTagList=(Tag="Input.Light",DevComment="좌클릭 계열 콤보 입력")
+GameplayTagList=(Tag="Input.Heavy",DevComment="우클릭 계열 콤보 입력")
```

> 대안: C++ 네이티브 태그(`UE_DEFINE_GAMEPLAY_TAG`) 선언도 가능. ini 방식이 에디터 자동완성·검증에 더 단순하므로 우선 권장. 미래 스킬 기반은 `Skill.*` 계층을 같은 파일에 추가하면 됨.

- [ ] **Step 3: 컴파일 검증**

에디터를 닫고 IDE(또는 `Build` 버튼)로 Ironclad 모듈을 빌드한다.
기대: 빌드 성공. 실패 시 `GameplayTags` 모듈명 오타/위치 확인.

- [ ] **Step 4: 태그 인식 확인**

에디터 재실행 → `Project Settings → GameplayTags`에서 `Input.Light`, `Input.Heavy`가 보이는지 확인.

- [ ] **Step 5: 커밋** (사용자 판단)

```bash
git add Source/Ironclad/Ironclad.Build.cs Config/DefaultGameplayTags.ini
git commit -m "feat(combo): add GameplayTags/UMG module deps and register combo input tags"
```

---

## Task 2: 구조체 BP 노출 + 트리거 GameplayTag 전환 + DisplayLabel 추가

**Files:**
- Modify: `Source/Ironclad/Data/ComboGraphAsset.h`

- [ ] **Step 1: 헤더 인클루드 추가**

`ComboGraphAsset.h` 상단에 GameplayTag 컨테이너 헤더를 추가한다:

```cpp
#include "GameplayTagContainer.h"
```

- [ ] **Step 2: `FComboTransition` 수정 — BP 노출 + 트리거 교체**

- 구조체에 `USTRUCT(BlueprintType)` 부여
- `EComboInput Input` 필드를 **제거**하고 `FGameplayTag TriggerTag`로 교체
- 각 `UPROPERTY`에 `BlueprintReadOnly` 추가

결과 선언(본문은 없음, 구조체이므로 이 형태가 완성):

```cpp
USTRUCT(BlueprintType)
struct FComboTransition
{
    GENERATED_BODY()

    // 전이를 발동하는 트리거 토큰. 게임 무관(커맨드/스킬 공용).
    UPROPERTY(EditAnywhere, BlueprintReadOnly)
    FGameplayTag TriggerTag;

    // 다음 이동할 노드.
    UPROPERTY(EditAnywhere, BlueprintReadOnly)
    FName TargetNodeID;
};
```

- [ ] **Step 3: `FComboNode` 수정 — BP 노출 + DisplayLabel 추가 (flat 유지)**

- `USTRUCT(BlueprintType)` 부여, 각 필드 `BlueprintReadOnly` 추가
- `FText DisplayLabel` **신규** 필드 추가 (UI 표시 전용, 내부 `NodeID`와 분리)
- `SectionName`, `Damage`는 **flat 유지** (Instanced 분리는 Phase 3)

```cpp
USTRUCT(BlueprintType)
struct FComboNode
{
    GENERATED_BODY()

    // 노드 아이디(내부 식별자).
    UPROPERTY(EditAnywhere, BlueprintReadOnly)
    FName NodeID;

    // UI 표시 전용 라벨. 내부 ID와 분리(표기·현지화 자유).
    UPROPERTY(EditAnywhere, BlueprintReadOnly)
    FText DisplayLabel;

    // 몽타주 섹션 이름.
    UPROPERTY(EditAnywhere, BlueprintReadOnly)
    FName SectionName;

    // 데미지.
    UPROPERTY(EditAnywhere, BlueprintReadOnly)
    float Damage = 0.0f;

    // 다음으로 이동 가능한 노드.
    UPROPERTY(EditAnywhere, BlueprintReadOnly)
    TArray<FComboTransition> Transitions;
};
```

- [ ] **Step 4: `EComboInput` enum 처리**

`TriggerTag`로 전환했으므로 `EComboInput` enum은 더 이상 전이에서 쓰이지 않는다. 입력→태그 매핑 보조로 남길 필요가 없으면 **제거**한다(BP/런타임에서 입력을 직접 `FGameplayTag`로 만들 예정). 남길지 여부는 Task 5에서 입력 처리 방식을 정할 때 확정.

- [ ] **Step 5: 컴파일 검증**

Run: 에디터 닫고 빌드.
기대: 성공. (이 시점에서 기존에 `EComboInput`/`Input`을 참조하던 코드가 있다면 컴파일 에러로 드러난다 — 있으면 목록화해 Task 5에서 처리.)

- [ ] **Step 6: 커밋** (사용자 판단)

```bash
git add Source/Ironclad/Data/ComboGraphAsset.h
git commit -m "feat(combo): expose combo structs to BP, swap trigger to GameplayTag, add DisplayLabel"
```

---

## Task 3: 노드 lookup + 런타임·UI 공용 질의 API

**Files:**
- Modify: `Source/Ironclad/Data/ComboGraphAsset.h` (선언)
- Modify: `Source/Ironclad/Data/ComboGraphAsset.cpp` (구현 — 사용자 작성)

- [ ] **Step 1: 질의 API 선언 추가 (`ComboGraphAsset.h`의 `UComboGraphAsset` 안)**

아래 시그니처를 `UComboGraphAsset`에 추가한다. **본문은 사용자 작성**, 여기서는 인터페이스만 확정:

```cpp
public:
    // NodeID로 노드를 찾는다. 없으면 nullptr.
    const FComboNode* FindNode(FName NodeID) const;

    // 현재 노드에서 나가는 모든 전이. NodeID가 NAME_None이면 RootTransitions 반환.
    // 런타임과 트리/HUD 위젯이 공용으로 사용한다.
    UFUNCTION(BlueprintCallable, Category = "ComboGraph")
    TArray<FComboTransition> GetTransitionsFrom(FName NodeID) const;

    // 현재 노드에서 TriggerTag에 맞는 전이를 해석한다.
    // 반환: 전이 존재 여부(bool). 성공 시 OutNextNodeID/OutSectionName 채움.
    UFUNCTION(BlueprintCallable, Category = "ComboGraph")
    bool ResolveNext(FName NodeID, FGameplayTag TriggerTag, FName& OutNextNodeID, FName& OutSectionName) const;
```

> **lookup 전략:** `FindNode`를 매번 선형 탐색해도 노드 수가 적어 무방하다. 성능이 필요하면 `TMap<FName, int32>`(또는 `TMap<FName, FComboNode>`)를 `PostLoad()`에서 1회 구축. 선형부터 시작 권장(YAGNI).

- [ ] **Step 2: 구현 로직 설계 (본문은 사용자 작성)**

`ComboGraphAsset.cpp`에 위 세 함수를 구현한다. 각 동작:

- `FindNode(NodeID)`: `Nodes` 배열에서 `NodeID`가 일치하는 원소의 주소를 반환, 없으면 `nullptr`.
- `GetTransitionsFrom(NodeID)`: `NodeID == NAME_None`이면 `RootTransitions` 반환. 아니면 `FindNode(NodeID)`로 노드를 찾아 그 `Transitions` 반환. 노드가 없으면 빈 배열.
- `ResolveNext(NodeID, TriggerTag, ...)`: `GetTransitionsFrom(NodeID)`를 순회하며 `Transition.TriggerTag == TriggerTag`(정확 일치)인 첫 전이를 찾는다. 찾으면 `OutNextNodeID = Transition.TargetNodeID`, 대상 노드의 `SectionName`을 `OutSectionName`에 넣고 `true`. 없으면 출력값 초기화 후 `false`.

> **주석 메모:** 세 함수에 "런타임·UI 공용 질의 API"임을 1줄 주석으로 명시(스펙 §4 주석 메모).
> **태그 매칭 주의:** 우선 정확 일치(`==`)로 시작. 계층 매칭(`MatchesTag`/부모 태그 허용)은 필요해질 때 도입(YAGNI).

- [ ] **Step 3: 컴파일 검증**

Run: 빌드. 기대: 성공.

- [ ] **Step 4: 커밋** (사용자 판단)

```bash
git add Source/Ironclad/Data/ComboGraphAsset.h Source/Ironclad/Data/ComboGraphAsset.cpp
git commit -m "feat(combo): add shared query API (FindNode/GetTransitionsFrom/ResolveNext)"
```

---

## Task 4: 콤보 그래프 데이터 저작 (에디터, `LL`은 한 번만)

**Files:**
- Create (에디터): `Content/Blueprint/Character/Combat/DA_IroncladCombo.uasset` (경로는 기존 컨벤션에 맞춤)

- [ ] **Step 1: 데이터 에셋 생성**

에디터 콘텐츠 브라우저 → `Miscellaneous → Data Asset` → 클래스 `ComboGraphAsset` 선택 → `DA_IroncladCombo` 생성.

- [ ] **Step 2: 노드 저작 (DRY: 공유 프리픽스 1회만)**

기존 콤보 2~3개를 그래프로 입력한다. 예시(L 체인 + 분기):

| NodeID | DisplayLabel | SectionName | Transitions |
|---|---|---|---|
| `L`   | "L"   | (해당 섹션)  | `Input.Light`→`LL` |
| `LL`  | "LL"  | (해당 섹션)  | `Input.Light`→`LLL`, `Input.Heavy`→`LLR` |
| `LLL` | "LLL" | (해당 섹션)  | (없음/종료) |
| `LLR` | "LLR" | (해당 섹션)  | (없음/종료) |

`RootTransitions`: `Input.Light`→`L` (그리고 R 계열 시작이 있으면 `Input.Heavy`→`R`).

핵심: `LL`은 **노드 하나로만 존재**하고 `LLL`/`LLR`은 거기서 나가는 두 전이. (Notion의 DRY 위반 해소 지점.)

- [ ] **Step 3: 저작 검증**

에셋 저장 후 다시 열어 트리거 태그가 드롭다운에서 정상 선택되고 `TargetNodeID`가 실제 노드를 가리키는지 육안 확인.

> `.uasset`은 텍스트 검증 불가 → 이 단계는 인-에디터 육안 확인이 검증 수단.

---

## Task 5: BP 런타임 전이 → 그래프 질의 교체 (동작 동일 검증)

> ⚠️ **선행 필요(사용자 제공):** 현재 상태×입력→다음 상태 전이 규칙, 입력 버퍼 윈도우 값, `DT_ComboTable` 내용(CSV/JSON export). 이게 없으면 "기존과 동일 거동"은 검증된 사실이 아니라 목표로만 남는다(스펙 §8).

**Files:**
- Modify (인-에디터): `BP_IroncladCharacter`

- [ ] **Step 1: 현재 노드 상태 변수 도입**

플레이어 BP에 "현재 콤보 NodeID"(`FName`, 초기 `None`)를 단일 진실원본으로 둔다. 기존 `EPlayerState` 기반 분기를 이 NodeID로 대체할 준비.

- [ ] **Step 2: 입력 → 트리거 태그 변환**

`IA_LeftAttack` → `Input.Light`, `IA_RightAttack` → `Input.Heavy`로 매핑(BP에서 태그 상수 사용). 입력 버퍼 윈도우 안에서만 처리(기존 값 유지).

- [ ] **Step 3: 전이 해석을 질의 API로 교체**

입력 발생 시: `DA_IroncladCombo.ResolveNext(현재NodeID, 트리거태그)` 호출 → 성공이면 반환된 `SectionName`으로 몽타주 점프 + 현재 NodeID를 `OutNextNodeID`로 갱신. 실패면 기존 거동대로 무시 또는 콤보 종료.

- [ ] **Step 4: 콤보 리셋 경로**

몽타주 종료/타임아웃 시 현재 NodeID를 `None`으로 리셋(= Neutral). 히트스톱·데미지·판정은 **변경 없이** 기존 섹션 키 `DT_ComboTable` 경로로 처리.

- [ ] **Step 5: 동작 동일 검증 (인-에디터)**

`Alt+P`로 플레이 → L, LL, LLL, LLR(및 R 계열) 콤보를 실제로 눌러보며 **교체 전 BP와 동일한 몽타주·히트·전이**가 나오는지 대조. GIF 캡처(기존 `docs/gifs/` 컨벤션)로 전/후 비교.

- [ ] **Step 6: 커밋** (사용자 판단 — BP 에셋 포함)

---

## Task 6: read-only 콤보 트리 위젯 (C++ UMG) — Phase 1 인수 테스트

**Files:**
- Create: `Source/Ironclad/UI/ComboTreeWidget.h`
- Create: `Source/Ironclad/UI/ComboTreeWidget.cpp`
- Create (에디터): `Content/.../WBP_ComboTree.uasset` (C++ 클래스 파생)

- [ ] **Step 1: 위젯 클래스 선언 (`ComboTreeWidget.h`)**

`UUserWidget` 파생 클래스를 선언한다. **본문은 사용자 작성**, 인터페이스만 확정:

```cpp
UCLASS()
class IRONCLAD_API UComboTreeWidget : public UUserWidget
{
    GENERATED_BODY()

public:
    // 그릴 콤보 그래프.
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "ComboGraph")
    TObjectPtr<UComboGraphAsset> ComboGraph;

    // 그래프를 순회해 트리 UI를 구성한다.
    UFUNCTION(BlueprintCallable, Category = "ComboGraph")
    void BuildTree();
};
```

- [ ] **Step 2: 순회 로직 설계 (본문은 사용자 작성)**

`BuildTree()`는 `ComboGraph->GetTransitionsFrom(NAME_None)`(루트)부터 시작해 BFS/DFS로 순회한다. 각 노드에서:
- 노드 표시 = `FindNode(TargetNodeID)->DisplayLabel`
- 엣지 표시 = `Transition.TriggerTag`의 라벨(태그 이름 마지막 세그먼트 또는 별도 표기)
- 자식 = 그 노드의 `GetTransitionsFrom(NodeID)`

`LL` 노드에서 `LLL`/`LLR` 두 자식이 갈라지도록 렌더. **`SectionName`/`Damage`는 읽지 않는다**(뼈대+라벨만 → 의존성 역전 실증).

> 시각 트리는 `UVerticalBox`/`UHorizontalBox` 중첩 또는 들여쓰기 텍스트로 단순 시작. 화려한 그래프 레이아웃은 YAGNI.

- [ ] **Step 3: 컴파일 검증**

Run: 빌드. 기대: 성공.

- [ ] **Step 4: 위젯 BP 생성 + 그래프 지정 (에디터)**

`WBP_ComboTree`를 `ComboTreeWidget` 파생으로 생성, `ComboGraph`에 `DA_IroncladCombo` 지정. 디버그용으로 화면/에디터 프리뷰에 띄움.

- [ ] **Step 5: 인수 테스트 — `LL→{LLL, LLR}` 분기 렌더 확인**

위젯을 표시했을 때 `LL`에서 `LLL`과 `LLR`로 갈라지는 분기가 보이면 **Phase 1 인수 테스트 통과 = 모델 리팩터 성립 증명.** GIF 캡처 → 포폴 추가.

- [ ] **Step 6: 커밋** (사용자 판단)

```bash
git add Source/Ironclad/UI/ComboTreeWidget.h Source/Ironclad/UI/ComboTreeWidget.cpp
git commit -m "feat(combo): add read-only combo tree widget (Phase 1 acceptance)"
```

---

## 범위 밖 (이 계획에 포함 안 함)

- **Phase 2** 라이브 입력 HUD (현재 노드 바인딩 + 다음 분기 하이라이트) — 같은 질의 API 위의 얇은 레이어, 별도 계획.
- **Phase 3** 플러그인 모듈 분리 + BladeZ 어댑터 + Instanced 페이로드 추출.
- **Phase 4** EUW 콤보 저작 툴.

## 검증 체크포인트 요약

| 태스크 | 검증 | 멈출 수 있는 지점 |
|---|---|---|
| 1 | 빌드 성공 + 태그 등록 확인 | ✓ |
| 2 | 빌드 성공(참조 깨짐 노출) | ✓ |
| 3 | 빌드 성공 | ✓ |
| 4 | 에셋 육안 확인 | ✓ (모델 저작 가능 확인) |
| 5 | 인-에디터 동작 동일 대조 | ✓ (사용자 데이터 필요) |
| 6 | `LL→{LLL,LLR}` 트리 렌더 | ✅ **Phase 1 인수 테스트** |
