import ServerUnit from './ServerUnit'
import ServerDamageInstance from './ServerDamageSource'
import ServerCard from './ServerCard'

enum GameHook {
	CARD_TAKES_DAMAGE,
	CARD_DESTROYED,
	UNIT_DESTROYED
}

export default GameHook

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
