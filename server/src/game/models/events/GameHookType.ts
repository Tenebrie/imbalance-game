import ServerUnit from '../ServerUnit'
import ServerDamageInstance from '../ServerDamageSource'
import ServerCard from '../ServerCard'
import ServerPlayerGroup from '@src/game/players/ServerPlayerGroup'
import ServerGame from '@src/game/models/ServerGame'

enum GameHookType {
	CARD_TAKES_DAMAGE = 'cardTakesDamage',
	CARD_DESTROYED = 'cardDestroyed',
	UNIT_DESTROYED = 'unitDestroyed',
	GAME_FINISHED = 'gameFinished',
}

export default GameHookType

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
}
export interface UnitDestroyedHookEditableValues {
	destructionPrevented: boolean
}

export interface GameFinishedHookFixedValues {
	game: ServerGame
	victoryReason: string
	chainImmediately: boolean
	victoriousPlayer: ServerPlayerGroup | null
}
export interface GameFinishedHookEditableValues {
	finishPrevented: boolean
	victoryReason: string
	chainImmediately: boolean
	victoriousPlayer: ServerPlayerGroup | null
}
