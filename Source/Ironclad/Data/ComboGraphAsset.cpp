// Fill out your copyright notice in the Description page of Project Settings.


#include "ComboGraphAsset.h"

const FComboNode* UComboGraphAsset::FindNode(FName NodeID) const
{
	return Algo::FindBy(Nodes, NodeID, &FComboNode::NodeID);
}

TArray<FComboTransition> UComboGraphAsset::GetTransitionsFrom(FName NodeID) const
{
	if (NodeID.IsNone())
	{
		return RootTransitions;
	}

	const FComboNode* Node = FindNode(NodeID);
	return Node ? Node->Transitions : TArray<FComboTransition>();
}

bool UComboGraphAsset::ResolveNext(
	FName NodeID,
	FGameplayTag TriggerTag,
	FName& OutNextNodeID,
	FName& OutSectionName
) const
{
	const TArray<FComboTransition> NextTransition = GetTransitionsFrom(NodeID);
	
	for (const FComboTransition& Transition : NextTransition)
	{
		if (Transition.TriggerTag == TriggerTag)
		{
			if (const FComboNode* TargetNode = FindNode(Transition.TargetNodeID))
			{
				OutNextNodeID = Transition.TargetNodeID;
				OutSectionName = TargetNode->SectionName;
				return true;
			}
		}
	}
	
	OutNextNodeID = NAME_None;
	OutSectionName = NAME_None;
	return false;
}
