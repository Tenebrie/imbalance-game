import ServerUnit from './ServerUnit'
import ServerDamageInstance from './ServerDamageSource'
import ServerCard from './ServerCard'
import ServerPlayerInGame from '../players/ServerPlayerInGame'

enum GameEvent {
	EFFECT_UNIT_DEPLOY,
	EFFECT_SPELL_PLAY,

	CARD_PLAYED,
	CARD_TAKES_DAMAGE,
	CARD_DESTROYED,
	UNIT_CREATED,
	UNIT_DESTROYED,
}

export default GameEvent

export interface CardPlayedEventArgs {
	owner: ServerPlayerInGame
	playedCard: ServerCard
}

export interface UnitCreatedEventArgs {
	createdUnit: ServerUnit
}

export interface UnitDestroyedEventArgs {
	targetUnit: ServerUnit
}

export interface CardTakesDamageEventArgs {
	targetCard: ServerCard
	damageInstance: ServerDamageInstance
	armorDamageInstance: ServerDamageInstance | null
	powerDamageInstance: ServerDamageInstance | null
}

export interface CardDestroyedEventArgs {
	targetCard: ServerCard
}
