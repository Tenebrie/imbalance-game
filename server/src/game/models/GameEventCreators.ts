import GameEventType from '@shared/enums/GameEventType'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import ServerCard from './ServerCard'
import ServerUnit from './ServerUnit'
import ServerDamageInstance from './ServerDamageSource'
import DamageSource from '@shared/enums/DamageSource'
import ServerBoardRow from './ServerBoardRow'
import ServerBuff from './ServerBuff'
import MoveDirection from '@shared/enums/MoveDirection'
import TargetType from '@shared/enums/TargetType'
import ServerCardTarget from './ServerCardTarget'

export default {
	roundStarted: (args: RoundStartedEventArgs): GameEvent => ({
		type: GameEventType.ROUND_STARTED,
		args: args,
		logVariables: {
			player: args.player.player.id
		}
	}),
	turnStarted: (args: TurnStartedEventArgs): GameEvent => ({
		type: GameEventType.TURN_STARTED,
		args: args,
		logVariables: {
			player: args.player.player.id
		}
	}),

	cardDrawn: (args: CardDrawnEventArgs): GameEvent => ({
		type: GameEventType.CARD_DRAWN,
		args: args,
		logVariables: {
			owner: args.owner.player.id,
			triggeringCard: args.triggeringCard.id
		}
	}),
	cardPlayed: (args: CardPlayedEventArgs): GameEvent => ({
		type: GameEventType.CARD_PLAYED,
		args: args,
		logVariables: {
			owner: args.owner.player.id,
			triggeringCard: args.triggeringCard.id
		}
	}),
	cardResolved: (args: CardResolvedEventArgs): GameEvent => ({
		type: GameEventType.CARD_RESOLVED,
		args: args,
		logVariables: {
			triggeringCard: args.triggeringCard.id
		}
	}),
	cardTakesDamage: (args: CardTakesDamageEventArgs): GameEvent => ({
		type: GameEventType.CARD_TAKES_DAMAGE,
		args: args,
		logSubtype: args.damageInstance.source === DamageSource.CARD ? 'fromCard' : 'fromUniverse',
		logVariables: {
			damage: args.damageInstance.value,
			sourceCard: args.damageInstance.sourceCard ? args.damageInstance.sourceCard.id : '',
			triggeringCard: args.triggeringCard.id
		}
	}),
	cardDestroyed: (args: CardDestroyedEventArgs): GameEvent => ({
		type: GameEventType.CARD_DESTROYED,
		args: args,
		logVariables: {
			triggeringCard: args.triggeringCard.id
		}
	}),

	cardTargetSelected: (args: CardTargetSelectedEventArgs): GameEvent => ({
		type: GameEventType.CARD_TARGET_SELECTED,
		args: args,
		effectSource: args.triggeringCard,
		logSubtype: args.targetCard ? 'card' : args.targetRow ? 'row' : 'unit',
		logVariables: {
			triggeringCard: args.triggeringCard.id,
			targetCard: args.targetCard ? args.targetCard.id : undefined,
			targetUnit: args.targetUnit ? args.targetUnit.card.id : undefined,
			targetRow: args.targetRow ? args.targetRow.index : undefined
		}
	}),
	cardTargetsConfirmed: (args: CardTargetsConfirmedEventArgs): GameEvent => ({
		type: GameEventType.CARD_TARGETS_CONFIRMED,
		args: args,
		effectSource: args.triggeringCard,
		logVariables: {
			triggeringCard: args.triggeringCard.id
		}
	}),

	unitCreated: (args: UnitCreatedEventArgs): GameEvent => ({
		type: GameEventType.UNIT_CREATED,
		args: args,
		logVariables: {
			triggeringUnit: args.triggeringUnit.card.id
		}
	}),
	unitMoved: (args: UnitMovedEventArgs): GameEvent => ({
		type: GameEventType.UNIT_MOVED,
		args: args,
		logSubtype: args.direction === MoveDirection.FORWARD ? 'forward' : args.direction === MoveDirection.BACK ? 'backward' : 'sameRow',
		logVariables: {
			triggeringUnit: args.triggeringUnit.card.id,
			distance: args.distance,
			direction: args.direction,
		}
	}),
	unitOrdered: (args: UnitOrderedEventArgs): GameEvent => ({
		type: GameEventType.UNIT_ORDERED,
		args: args,
		effectSource: args.triggeringUnit.card,
		logSubtype: args.targetArguments.targetCard ? 'card' : args.targetArguments.targetRow ? 'row' : 'noTarget',
		logVariables: {
			triggeringUnit: args.triggeringUnit.card.id,
			targetCard: args.targetArguments.targetCard?.id,
			targetRow: args.targetArguments.targetRow?.index
		}
	}),
	unitDestroyed: (args: UnitDestroyedEventArgs): GameEvent => ({
		type: GameEventType.UNIT_DESTROYED,
		args: args,
		logVariables: {
			triggeringUnit: args.triggeringUnit.card.id
		}
	}),

	unitDeployed: (args: UnitDeployedEventArgs): GameEvent => ({
		type: GameEventType.UNIT_DEPLOYED,
		effectSource: args.triggeringUnit.card,
		args: args,
		logVariables: {
			triggeringUnit: args.triggeringUnit.card.id,
			owner: args.triggeringUnit.owner.player.id
		}
	}),
	spellDeployed: (args: SpellDeployedEventArgs): GameEvent => ({
		type: GameEventType.SPELL_DEPLOYED,
		effectSource: args.triggeringCard,
		args: args,
		logVariables: {
			triggeringCard: args.triggeringCard.id,
			owner: args.triggeringCard.owner.player.id
		}
	}),

	buffCreated: (args: BuffCreatedEventArgs): GameEvent => ({
		type: GameEventType.BUFF_CREATED,
		args: args,
		effectSource: args.triggeringBuff,
		logSubtype: args.triggeringBuff.source ? 'fromCard' : 'fromUniverse',
		logVariables: {
			triggeringBuffName: args.triggeringBuff.name,
			ownerCard: args.triggeringBuff.card.id,
			sourceCard: args.triggeringBuff.source ? args.triggeringBuff.source.id : undefined,
		}
	}),
	buffRemoved: (args: BuffRemovedEventArgs): GameEvent => ({
		type: GameEventType.BUFF_REMOVED,
		args: args,
		effectSource: args.triggeringBuff,
		logVariables: {
			triggeringBuffName: args.triggeringBuff.name,
			ownerCard: args.triggeringBuff.card.id,
		}
	}),

	turnEnded: (args: TurnEndedEventArgs): GameEvent => ({
		type: GameEventType.TURN_ENDED,
		args: args,
		logVariables: {
			player: args.player.player.id
		}
	}),
	roundEnded: (args: RoundEndedEventArgs): GameEvent => ({
		type: GameEventType.ROUND_ENDED,
		args: args,
		logVariables: {
			player: args.player.player.id
		}
	}),
}

export interface GameEvent {
	type: GameEventType
	args: Record<string, any>
	effectSource?: ServerCard | ServerBuff
	logSubtype?: string
	logVariables?: Record<string, string | number>
}

export interface RoundStartedEventArgs {
	player: ServerPlayerInGame
}
export interface TurnStartedEventArgs {
	player: ServerPlayerInGame
}

export interface CardDrawnEventArgs {
	owner: ServerPlayerInGame
	triggeringCard: ServerCard
}
export interface CardPlayedEventArgs {
	owner: ServerPlayerInGame
	triggeringCard: ServerCard
}
export interface CardResolvedEventArgs {
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

export interface CardTargetSelectedEventArgs {
	triggeringCard: ServerCard
	targetCard: ServerCard
	targetUnit: ServerUnit
	targetRow: ServerBoardRow
}
export interface CardTargetsConfirmedEventArgs {
	triggeringCard: ServerCard
}

export interface UnitCreatedEventArgs {
	triggeringUnit: ServerUnit
}
export interface UnitMovedEventArgs {
	triggeringUnit: ServerUnit
	fromRow: ServerBoardRow
	distance: number
	direction: MoveDirection
}
export interface UnitOrderedEventArgs {
	triggeringUnit: ServerUnit
	targetType: TargetType
	targetArguments: ServerCardTarget
}
export interface UnitDestroyedEventArgs {
	triggeringUnit: ServerUnit
}

export interface UnitDeployedEventArgs {
	triggeringUnit: ServerUnit
}
export interface SpellDeployedEventArgs {
	triggeringCard: ServerCard
}

export interface BuffCreatedEventArgs {
	triggeringBuff: ServerBuff
}
export interface BuffRemovedEventArgs {
	triggeringBuff: ServerBuff
}

export interface TurnEndedEventArgs {
	player: ServerPlayerInGame
}
export interface RoundEndedEventArgs {
	player: ServerPlayerInGame
}
