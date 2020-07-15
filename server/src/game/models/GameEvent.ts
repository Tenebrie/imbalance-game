import ServerUnit from './ServerUnit'
import ServerCard from './ServerCard'
import GameEvent, {
	CardDestroyedEventArgsMessage,
	CardPlayedEventArgsMessage,
	CardTakesDamageEventArgsMessage,
	UnitCreatedEventArgsMessage,
	UnitDestroyedEventArgsMessage
} from '@shared/enums/GameEvent'
import ServerDamageInstance from './ServerDamageSource'
import ServerPlayerInGame from '../players/ServerPlayerInGame'

export default GameEvent

export interface CardPlayedEventArgs {
	owner: ServerPlayerInGame
	triggeringCard: ServerCard
}

export interface CardTakesDamageEventArgs {
	triggeringCard: ServerCard
	damageInstance: ServerDamageInstance
	armorDamageInstance: ServerDamageInstance | null
	powerDamageInstance: ServerDamageInstance | null
}

export interface CardDestroyedEventArgs {
	triggeringCard: ServerCard
}

export interface UnitCreatedEventArgs {
	triggeringUnit: ServerUnit
}

export interface UnitDestroyedEventArgs {
	triggeringUnit: ServerUnit
}

export const GameEventSerializers = {
	cardPlayed: (source: CardPlayedEventArgs): CardPlayedEventArgsMessage => ({
		owner: source.owner.player.id,
		triggeringCard: source.triggeringCard.id
	}),
	cardTakesDamage: (source: CardTakesDamageEventArgs): CardTakesDamageEventArgsMessage => ({
		triggeringCard: source.triggeringCard.id
	}),
	cardDestroyed: (source: CardDestroyedEventArgs): CardDestroyedEventArgsMessage => ({
		triggeringCard: source.triggeringCard.id
	}),
	unitCreated: (source: UnitCreatedEventArgs): UnitCreatedEventArgsMessage => ({
		triggeringUnit: source.triggeringUnit.card.id
	}),
	unitDestroyed: (source: UnitDestroyedEventArgs): UnitDestroyedEventArgsMessage => ({
		triggeringUnit: source.triggeringUnit.card.id
	})
}
