import ServerUnit from './ServerUnit'
import ServerDamageInstance from './ServerDamageSource'
import ServerCard from './ServerCard'

enum GameEvent {
	EFFECT_UNIT_DEPLOY,

	UNIT_PLAYED,
	CARD_TAKES_DAMAGE,
}

export default GameEvent

export interface UnitPlayedEventArgs {
	playedUnit: ServerUnit
}

export interface CardTakesDamageEventArgs {
	targetCard: ServerCard
	damageInstance: ServerDamageInstance
	armorDamageInstance: ServerDamageInstance | null
	powerDamageInstance: ServerDamageInstance | null
}

export interface CardTakesDamageEventOverrideArgs {
	targetCard: ServerCard
	damageInstance: ServerDamageInstance
}
