# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Ironclad** is an Unreal Engine 5.6 action game prototype — a **pure Blueprint project** (no C++ source code). It features a player character with combo attacks and dodge mechanics fighting against AI enemies driven by Behavior Trees.

## Building & Running

This project has no build scripts or CLI commands. All development is done through the **Unreal Editor**:

- Open: Double-click `Ironclad.uproject` to launch UE5.6 Editor
- Play: Press `Alt+P` in the editor (or the Play button in toolbar)
- Default map: `Content/Map/MainMap.umap`

There are no lint, test, or compile commands — Blueprint validation happens in-editor via **Compile** button in Blueprint editors.

## Architecture

### Core Blueprint Classes

| Blueprint | Location | Role |
|-----------|----------|------|
| `BP_IroncladCharacter` | `Content/Blueprint/Character/` | Player character — movement, combos, dodge, run toggle |
| `ABP_IroncladCharacter` | `Content/Blueprint/Character/` | Player animation Blueprint |
| `BP_IroncladGameMode` | `Content/Blueprint/` | Game mode |
| `BP_IroncladController` | `Content/Blueprint/` | Player controller |
| `BP_Enemy` | `Content/Blueprint/Monster/` | Enemy character |
| `ABP_Enemy` | `Content/Blueprint/Monster/` | Enemy animation Blueprint |
| `BP_EnemyController` | `Content/Blueprint/Monster/` | Enemy AI controller |

### Input System (Enhanced Input)

Mapping context `IMC_Ironclad` maps to actions in `Content/Blueprint/Character/Input/`:
- `IA_Move`, `IA_View` — movement & camera
- `IA_LeftAttack`, `IA_RightAttack` — combo attacks
- `IA_Dodge` — dodge roll
- `IA_Run` — run **toggle** (not hold)

### Player Combat System

- Combo state tracked via `EPlayerState` enum and `DT_ComboTable` data table
- Attack montages: `AM_Attack.uasset`
- Dodge montage: `AM_Dodge.uasset`
- Weapon: `BP_Sword` attached to character

### Enemy AI System

Behavior Tree (`BT_Enemy`) + Blackboard (`BB_Enemy`) in `Content/Blueprint/Monster/AI/`:
- **BTTask_SelectPatrolLocation** — picks random nav mesh point
- **BTTask_ChaseTarget** — moves toward detected player
- **BTTask_SetState** — transitions `EEnemyState` (Idle / Patrol / Chase / Attack)

### Enabled Plugins

- `PoseSearch` — motion matching for animation
- `MotionTrajectory` — animation trajectory prediction
- `ModelingToolsEditorMode` — editor modeling tools

## Asset Sources

Large marketplace assets are **gitignored** and must be re-imported locally:

| Asset | Content Path | Notes |
|-------|-------------|-------|
| Dark Knight | `Content/Dark_Knight/` | Player character model (~481MB) |
| Whisper | `Content/Whisper/` | Enemy character model (~104MB) |
| AwesomeSwordAnimationV4 | `Content/AwesomeSwordAnimationV4/` | Combat animations (~395MB) |
| SwordTrailVFX | `Content/SwordTrailVFX/` | Sword particle effects (~165MB) |
| ParagonRampage | `Content/ParagonRampage/` | Additional VFX (~3GB) |
| DodgeItComponent | `Content/DodgeItComponent/` | Dodge system (~36MB) |

## Key Config

`Config/DefaultEngine.ini` notable settings:
- Game default map: `/Game/Map/MainMap`
- Default game mode: `BP_IroncladGameMode`
- Ray tracing: enabled
- Substrate materials: enabled
- Target hardware: Desktop / Maximum quality
