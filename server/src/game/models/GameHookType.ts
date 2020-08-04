import ServerUnit from './ServerUnit'
import ServerDamageInstance from './ServerDamageSource'
import ServerCard from './ServerCard'

enum GameHookType {
	CARD_TAKES_DAMAGE = 'cardTakesDamage',
	CARD_DESTROYED = 'cardDestroyed',
	UNIT_DESTROYED = 'unitDestroyed',
}

export default GameHookType

export interface CardTakesDamageHookArgs {
	targetCard: ServerCard
	damageInstance: ServerDamageInstance
}
export type CardTakesDamageHookValues = CardTakesDamageHookArgs

export interface CardDestroyedHookArgs {
	targetCard: ServerCard
}
export interface CardDestroyedHookValues {
	destructionPrevented: boolean
}

export interface UnitDestroyedHookArgs {
	targetUnit: ServerUnit
}
export interface UnitDestroyedHookValues {
	destructionPrevented: boolean
}
