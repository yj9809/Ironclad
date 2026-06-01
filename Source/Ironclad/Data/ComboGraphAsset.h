// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CoreMinimal.h"
#include "Engine/DataAsset.h"
#include "GameplayTagContainer.h"
#include "ComboGraphAsset.generated.h"

USTRUCT(BlueprintType)
struct FComboTransition
{
	GENERATED_BODY()

	// 전이를 발동하는 트리거 토큰, 입력 시스템과 무관 (커맨드/스킬 공용).
	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	FGameplayTag TriggerTag;

	// 다음 이동할 노드.
	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	FName TargetNodeID;
};

USTRUCT(BlueprintType)
struct FComboNode
{
	GENERATED_BODY()

	// 노드 아이디 (내부 식별자).
	UPROPERTY(EditAnywhere, BlueprintReadOnly)
	FName NodeID;

	// UI 표시 전용 라벨, 내부 ID와 분리하여 관리.
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

/**
 * 
 */
UCLASS()
class IRONCLAD_API UComboGraphAsset : public UDataAsset
{
	GENERATED_BODY()

public:
	// NodeID로 노드를 찾는다. 없으면 nullptr.
	const FComboNode* FindNode(FName NodeID) const;
	
	// 현재 노드에서 나가는 모든 전이, NodeID가 None이면 RootTransition 반환.
	UFUNCTION(BlueprintCallable, Category="ComboGraph")
	TArray<FComboTransition> GetTransitionsFrom(FName NodeID) const;
	
	// 현재 노드에서 TriggerTag에 맞는 전이를 해석, 성공 시 Out 값 채우고 true 반환.
	UFUNCTION(BlueprintCallable, Category="ComboGraph")
	bool ResolveNext(FName NodeID, FGameplayTag TriggerTag, FName& OutNextNodeID, FName& OutSectionName) const;
	
public:
	// 데이터 에셋이 가지고 있을 콤보 데이터.
	UPROPERTY(EditAnywhere)
	TArray<FComboNode> Nodes;
	
	// 콤보 시작 데이터.
	UPROPERTY(EditAnywhere)
	TArray<FComboTransition> RootTransitions;
};
