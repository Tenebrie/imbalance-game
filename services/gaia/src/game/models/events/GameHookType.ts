import GameVictoryCondition from '@src/enums/GameVictoryCondition'
import UnitDestructionReason from '@src/enums/UnitDestructionReason'
import ServerGame from '@src/game/models/ServerGame'
import ServerPlayerGroup from '@src/game/players/ServerPlayerGroup'
import ServerPlayerInGame from '@src/game/players/ServerPlayerInGame'

import ServerCard from '../ServerCard'
import ServerDamageInstance from '../ServerDamageSource'
import ServerUnit from '../ServerUnit'

enum GameHookType {
	CARD_PLAYED = 'cardPlayed',
	CARD_TAKES_DAMAGE = 'cardTakesDamage',
	CARD_DESTROYED = 'cardDestroyed',
	UNIT_DESTROYED = 'unitDestroyed',
	ROUND_FINISHED = 'roundFinished',
	GAME_FINISHED = 'gameFinished',
}

export default GameHookType
export interface SharedHookFixedValues {
	game: ServerGame
}

export interface CardPlayedHookFixedValues extends SharedHookFixedValues {
	card: ServerCard
	owner: ServerPlayerInGame
}
export interface CardPlayedHookEditableValues {
	playPrevented: boolean
}

export interface CardTakesDamageHookFixedValues {
	targetCard: ServerCard
	damageInstance: ServerDamageInstance
}
export type CardTakesDamageHookEditableValues = CardTakesDamageHookFixedValues

export interface CardDestroyedHookFixedValues {
	targetCard: ServerCard
}
export interface CardDestroyedHookEditableValues {
	destructionPrevented: boolean
}

export interface UnitDestroyedHookFixedValues {
	targetUnit: ServerUnit
	reason: UnitDestructionReason
}
export interface UnitDestroyedHookEditableValues {
	destructionPrevented: boolean
}

export interface RoundFinishedHookFixedValues extends SharedHookFixedValues {
	group: ServerPlayerGroup
}
export interface RoundFinishedHookEditableValues {
	finishPrevented: boolean
}

export interface GameFinishedHookFixedValues {
	game: ServerGame
	victoryCondition: GameVictoryCondition
	chainImmediately: boolean
	victoriousPlayer: ServerPlayerGroup | null
}
export interface GameFinishedHookEditableValues {
	finishPrevented: boolean
	victoryCondition: GameVictoryCondition
	chainImmediately: boolean
	victoriousPlayer: ServerPlayerGroup | null
}
