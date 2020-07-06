import ServerUnit from './ServerUnit'
import ServerDamageInstance from './ServerDamageSource'
import ServerCard from './ServerCard'

enum GameEvent {
	EFFECT_UNIT_DEPLOY,

	UNIT_CREATED,
	UNIT_DEPLOYED,
	UNIT_DESTROYED,
	CARD_TAKES_DAMAGE,
	CARD_DESTROYED
}

export default GameEvent

export interface UnitCreatedEventArgs {
	createdUnit: ServerUnit
}

export interface UnitDeployedEventArgs {
	deployedUnit: ServerUnit
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
