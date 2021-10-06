import CardLocation from '@shared/enums/CardLocation'
import DamageSource from '@shared/enums/DamageSource'
import GameEventType from '@shared/enums/GameEventType'
import MoveDirection from '@shared/enums/MoveDirection'
import TargetMode from '@shared/enums/TargetMode'
import TargetType from '@shared/enums/TargetType'
import { EventSubscriber } from '@src/game/models/ServerGameEvents'
import ServerPlayerGroup from '@src/game/players/ServerPlayerGroup'

import ServerPlayerInGame from '../../players/ServerPlayerInGame'
import ServerBuff, { ServerCardBuff, ServerRowBuff } from '../buffs/ServerBuff'
import ServerBoardRow from '../ServerBoardRow'
import ServerCard from '../ServerCard'
import { ServerCardTargetCard, ServerCardTargetPosition, ServerCardTargetRow } from '../ServerCardTarget'
import ServerDamageInstance from '../ServerDamageSource'
import ServerGame from '../ServerGame'
import ServerUnit from '../ServerUnit'

export default {
	gameCreated: (args: GameSetupEventArgs): GameEvent => ({
		type: GameEventType.GAME_CREATED,
		args: args,
	}),
	gameSetup: (args: GameSetupEventArgs): GameEvent => ({
		type: GameEventType.GAME_SETUP,
		args: args,
		hiddenFromLogs: true,
	}),
	postGameSetup: (args: GameSetupEventArgs): GameEvent => ({
		type: GameEventType.POST_GAME_SETUP,
		args: args,
		hiddenFromLogs: true,
	}),
	gameStarted: (args: GameStartedEventArgs): GameEvent => ({
		type: GameEventType.GAME_STARTED,
		args: args,
		logVariables: {
			group: args.group.id,
		},
	}),

	roundStarted: (args: RoundStartedEventArgs): GameEvent => ({
		type: GameEventType.ROUND_STARTED,
		args: args,
		logVariables: {
			group: args.group.id,
		},
	}),
	postRoundStarted: (args: RoundStartedEventArgs): GameEvent => ({
		type: GameEventType.POST_ROUND_STARTED,
		args: args,
		hiddenFromLogs: true,
	}),
	turnStarted: (args: TurnStartedEventArgs): GameEvent => ({
		type: GameEventType.TURN_STARTED,
		args: args,
		logVariables: {
			group: args.group.id,
		},
	}),

	cardDrawn: (args: CardDrawnEventArgs): GameEvent => ({
		type: GameEventType.CARD_DRAWN,
		args: args,
		effectSource: args.triggeringCard,
		logVariables: {
			owner: args.owner.player.id,
			triggeringCard: args.triggeringCard.id,
		},
	}),
	cardReturned: (args: CardReturnedEventArgs): GameEvent => ({
		type: GameEventType.CARD_RETURNED,
		args: args,
		effectSource: args.triggeringCard,
		logVariables: {
			owner: args.owner.player.id,
			location: args.location,
			triggeringCard: args.triggeringCard.id,
		},
	}),
	cardPlayed: (args: CardPlayedEventArgs): GameEvent => ({
		type: GameEventType.CARD_PLAYED,
		args: args,
		effectSource: args.triggeringCard,
		logVariables: {
			owner: args.owner.player.id,
			triggeringCard: args.triggeringCard.id,
		},
	}),
	cardPreResolved: (args: CardPreResolvedEventArgs): GameEvent => ({
		type: GameEventType.CARD_PRE_RESOLVED,
		args: args,
		effectSource: args.triggeringCard,
		logVariables: {
			triggeringCard: args.triggeringCard.id,
		},
		hiddenFromLogs: true,
	}),
	cardResolved: (args: CardResolvedEventArgs): GameEvent => ({
		type: GameEventType.CARD_RESOLVED,
		args: args,
		effectSource: args.triggeringCard,
		logVariables: {
			triggeringCard: args.triggeringCard.id,
		},
	}),
	cardTakesDamage: (args: CardTakesDamageEventArgs): GameEvent => ({
		type: GameEventType.CARD_TAKES_DAMAGE,
		args: args,
		effectSource: args.triggeringCard,
		logSubtype: args.damageInstance.source === DamageSource.CARD ? 'fromCard' : 'fromUniverse',
		logVariables: {
			damage: args.damageInstance.value,
			sourceCard: args.damageInstance.sourceCard ? args.damageInstance.sourceCard.id : '',
			triggeringCard: args.triggeringCard.id,
		},
	}),
	cardPowerRestored: (args: CardPowerRestoredEventArgs): GameEvent => ({
		type: GameEventType.CARD_POWER_RESTORED,
		args: args,
		effectSource: args.triggeringCard,
		logSubtype: args.healingInstance.source === DamageSource.CARD ? 'fromCard' : 'fromUniverse',
		logVariables: {
			healing: args.healingInstance.value,
			sourceCard: args.healingInstance.sourceCard ? args.healingInstance.sourceCard.id : '',
			triggeringCard: args.triggeringCard.id,
		},
	}),
	cardArmorRestored: (args: CardArmorRestoredEventArgs): GameEvent => ({
		type: GameEventType.CARD_ARMOR_RESTORED,
		args: args,
		effectSource: args.triggeringCard,
		logSubtype: args.restorationInstance.source === DamageSource.CARD ? 'fromCard' : 'fromUniverse',
		logVariables: {
			healing: args.restorationInstance.value,
			sourceCard: args.restorationInstance.sourceCard ? args.restorationInstance.sourceCard.id : '',
			triggeringCard: args.triggeringCard.id,
		},
	}),
	cardDiscarded: (args: CardDrawnEventArgs): GameEvent => ({
		type: GameEventType.CARD_DISCARDED,
		args: args,
		effectSource: args.triggeringCard,
		logVariables: {
			owner: args.owner.player.id,
			triggeringCard: args.triggeringCard.id,
		},
	}),
	cardDestroyed: (args: CardDestroyedEventArgs): GameEvent => ({
		type: GameEventType.CARD_DESTROYED,
		args: args,
		effectSource: args.triggeringCard,
		logVariables: {
			triggeringCard: args.triggeringCard.id,
		},
	}),

	cardTargetCardSelected: (args: CardTargetSelectedCardEventArgs): GameEvent => ({
		type: GameEventType.CARD_TARGET_SELECTED_CARD,
		args: args,
		effectSource: args.triggeringCard,
		logVariables: {
			triggeringCard: args.triggeringCard.id,
			targetCard: args.targetCard.id,
		},
		hiddenFromLogs: true,
	}),
	cardTargetUnitSelected: (args: CardTargetSelectedUnitEventArgs): GameEvent => ({
		type: GameEventType.CARD_TARGET_SELECTED_UNIT,
		args: args,
		effectSource: args.triggeringCard,
		logVariables: {
			triggeringCard: args.triggeringCard.id,
			targetUnit: args.targetCard.id,
		},
		hiddenFromLogs: true,
	}),
	cardTargetRowSelected: (args: CardTargetSelectedRowEventArgs): GameEvent => ({
		type: GameEventType.CARD_TARGET_SELECTED_ROW,
		args: args,
		effectSource: args.triggeringCard,
		logVariables: {
			triggeringCard: args.triggeringCard.id,
			targetRow: args.targetRow.index,
		},
		hiddenFromLogs: true,
	}),
	cardTargetPositionSelected: (args: CardTargetSelectedPositionEventArgs): GameEvent => ({
		type: GameEventType.CARD_TARGET_SELECTED_POSITION,
		args: args,
		effectSource: args.triggeringCard,
		logVariables: {
			triggeringCard: args.triggeringCard.id,
			targetRow: args.targetRow.index,
			targetPosition: args.targetPosition,
		},
		hiddenFromLogs: true,
	}),
	cardTargetsConfirmed: (args: CardTargetsConfirmedEventArgs): GameEvent => ({
		type: GameEventType.CARD_TARGETS_CONFIRMED,
		args: args,
		effectSource: args.triggeringCard,
		logVariables: {
			triggeringCard: args.triggeringCard?.id,
		},
		hiddenFromLogs: true,
	}),

	playerMulliganedCard: (args: PlayerTargetCardSelectedEventArgs): GameEvent => ({
		type: GameEventType.PLAYER_TARGET_SELECTED_CARD,
		args: args,
		logSubtype: 'mulligan',
		logVariables: {
			triggeringPlayer: args.triggeringPlayer.player.id,
			targetCard: args.targetCard.id,
		},
	}),

	unitCreated: (args: UnitCreatedEventArgs): GameEvent => ({
		type: GameEventType.UNIT_CREATED,
		args: args,
		logVariables: {
			triggeringUnit: args.triggeringUnit.card.id,
		},
	}),
	unitMoved: (args: UnitMovedEventArgs): GameEvent => ({
		type: GameEventType.UNIT_MOVED,
		args: args,
		logSubtype: args.direction === MoveDirection.FORWARD ? 'forward' : args.direction === MoveDirection.BACK ? 'backward' : 'sameRow',
		logVariables: {
			triggeringUnit: args.triggeringUnit.card.id,
			distance: args.distance,
			direction: args.direction,
		},
	}),
	unitIssuedOrderTargetingCard: (args: UnitOrderedCardEventArgs): GameEvent => ({
		type: GameEventType.UNIT_ORDERED_CARD,
		args: args,
		effectSource: args.triggeringUnit.card,
		logVariables: {
			triggeringUnit: args.triggeringUnit.card.id,
			targetCard: args.targetArguments.targetCard.id,
		},
	}),
	unitIssuedOrderTargetingUnit: (args: UnitOrderedUnitEventArgs): GameEvent => ({
		type: GameEventType.UNIT_ORDERED_UNIT,
		args: args,
		effectSource: args.triggeringUnit.card,
		logVariables: {
			triggeringUnit: args.triggeringUnit.card.id,
			targetCard: args.targetArguments.targetCard.id,
		},
	}),
	unitIssuedOrderTargetingRow: (args: UnitOrderedRowEventArgs): GameEvent => ({
		type: GameEventType.UNIT_ORDERED_ROW,
		args: args,
		effectSource: args.triggeringUnit.card,
		logVariables: {
			triggeringUnit: args.triggeringUnit.card.id,
			targetRow: args.targetArguments.targetRow.index,
		},
	}),
	unitIssuedOrderTargetingPosition: (args: UnitOrderedPositionEventArgs): GameEvent => ({
		type: GameEventType.UNIT_ORDERED_POSITION,
		args: args,
		effectSource: args.triggeringUnit.card,
		logVariables: {
			triggeringUnit: args.triggeringUnit.card.id,
			targetRow: args.targetArguments.targetRow.index,
			targetPosition: args.targetArguments.targetPosition,
		},
	}),
	unitDestroyed: (args: UnitDestroyedEventArgs): GameEvent => ({
		type: GameEventType.UNIT_DESTROYED,
		args: args,
		effectSource: args.triggeringCard,
		logVariables: {
			triggeringUnit: args.triggeringUnit.card.id,
		},
	}),

	unitDeployed: (args: UnitDeployedEventArgs): GameEvent => ({
		type: GameEventType.UNIT_DEPLOYED,
		effectSource: args.triggeringUnit.card,
		args: args,
		logVariables: {
			triggeringUnit: args.triggeringUnit.card.id,
			owner: args.owner.player.id,
		},
	}),
	spellDeployed: (args: SpellDeployedEventArgs): GameEvent => ({
		type: GameEventType.SPELL_DEPLOYED,
		effectSource: args.triggeringCard,
		args: args,
		logVariables: {
			triggeringCard: args.triggeringCard.id,
			owner: args.owner.player.id,
		},
	}),

	cardBuffCreated: (args: CardBuffCreatedEventArgs): GameEvent => ({
		type: GameEventType.CARD_BUFF_CREATED,
		args: args,
		effectSource: args.triggeringBuff,
		logSubtype:
			args.triggeringBuff.source instanceof ServerCard
				? 'fromCard'
				: args.triggeringBuff.source instanceof ServerBoardRow
				? 'fromRow'
				: 'fromUniverse',
		logVariables: {
			triggeringBuff: args.triggeringBuff.id,
			parentCard: args.triggeringBuff.parent.id,
			sourceCard: args.triggeringBuff.source instanceof ServerCard ? args.triggeringBuff.source.id : undefined,
			sourceRow: args.triggeringBuff.source instanceof ServerBoardRow ? args.triggeringBuff.source.index : undefined,
		},
	}),
	cardBuffRemoved: (args: CardBuffRemovedEventArgs): GameEvent => ({
		type: GameEventType.CARD_BUFF_REMOVED,
		args: args,
		effectSource: args.triggeringBuff,
		logVariables: {
			triggeringBuff: args.triggeringBuff.id,
			parentCard: args.triggeringBuff.parent.id,
		},
	}),
	rowBuffCreated: (args: RowBuffCreatedEventArgs): GameEvent => ({
		type: GameEventType.ROW_BUFF_CREATED,
		args: args,
		effectSource: args.triggeringBuff,
		logSubtype:
			args.triggeringBuff.source instanceof ServerCard
				? 'fromCard'
				: args.triggeringBuff.source instanceof ServerBoardRow
				? 'fromRow'
				: 'fromUniverse',
		logVariables: {
			triggeringBuff: args.triggeringBuff.id,
			parentRow: args.triggeringBuff.parent.index,
			sourceCard: args.triggeringBuff.source instanceof ServerCard ? args.triggeringBuff.source.id : undefined,
			sourceRow: args.triggeringBuff.source instanceof ServerBoardRow ? args.triggeringBuff.source.index : undefined,
		},
	}),
	rowBuffRemoved: (args: RowBuffRemovedEventArgs): GameEvent => ({
		type: GameEventType.ROW_BUFF_REMOVED,
		args: args,
		effectSource: args.triggeringBuff,
		logVariables: {
			triggeringBuff: args.triggeringBuff.id,
			parentRow: args.triggeringBuff.parent.index,
		},
	}),

	spellManaGenerated: (args: SpellManaGeneratedEventArgs): GameEvent => ({
		type: GameEventType.SPELL_MANA_GENERATED,
		args: args,
		effectSource: args.source,
		hiddenFromLogs: true,
	}),

	turnEnded: (args: TurnEndedEventArgs): GameEvent => ({
		type: GameEventType.TURN_ENDED,
		args: args,
		logVariables: {
			group: args.group.id,
		},
	}),
	roundEnded: (args: RoundEndedEventArgs): GameEvent => ({
		type: GameEventType.ROUND_ENDED,
		args: args,
		logVariables: {
			group: args.group.id,
		},
	}),

	gameFinished: (args: GameFinishedEventArgs): GameEvent => ({
		type: GameEventType.GAME_FINISHED,
		args: args,
		logSubtype: args.victoriousPlayer ? 'victory' : 'draw',
		logVariables: {
			victoriousGroup: args.victoriousPlayer?.id,
		},
	}),
}

export interface GameEvent {
	type: GameEventType
	args: Record<string, any>
	effectSource?: ServerCard | ServerBuff | null
	logSubtype?: string
	logVariables?: Record<string, string | string[] | number | number[] | undefined>
	hiddenFromLogs?: boolean
}

export interface SharedEventArgs {
	game: ServerGame
}

export type GameSetupEventArgs = SharedEventArgs
export interface GameStartedEventArgs extends SharedEventArgs {
	group: ServerPlayerGroup
}

export interface RoundStartedEventArgs extends SharedEventArgs {
	group: ServerPlayerGroup
}
export interface TurnStartedEventArgs extends SharedEventArgs {
	group: ServerPlayerGroup
}

export interface CardDrawnEventArgs extends SharedEventArgs {
	owner: ServerPlayerInGame
	triggeringCard: ServerCard
}
export interface CardReturnedEventArgs extends SharedEventArgs {
	owner: ServerPlayerInGame
	location: CardLocation
	triggeringCard: ServerCard
}
export interface CardPlayedEventArgs extends SharedEventArgs {
	owner: ServerPlayerInGame
	triggeringCard: ServerCard
}
export interface CardPreResolvedEventArgs extends SharedEventArgs {
	triggeringCard: ServerCard
}
export interface CardResolvedEventArgs extends SharedEventArgs {
	triggeringCard: ServerCard
}
export interface CardTakesDamageEventArgs extends SharedEventArgs {
	triggeringCard: ServerCard
	damageInstance: ServerDamageInstance
	armorDamageInstance: ServerDamageInstance | null
	powerDamageInstance: ServerDamageInstance | null
}
export interface CardPowerRestoredEventArgs extends SharedEventArgs {
	triggeringCard: ServerCard
	healingInstance: ServerDamageInstance
}
export interface CardArmorRestoredEventArgs extends SharedEventArgs {
	triggeringCard: ServerCard
	restorationInstance: ServerDamageInstance
}
export interface CardDiscardedEventArgs extends SharedEventArgs {
	owner: ServerPlayerInGame
	triggeringCard: ServerCard
}
export interface CardDestroyedEventArgs extends SharedEventArgs {
	triggeringCard: ServerCard
	formerOwner: ServerPlayerInGame
}

export interface CardTargetSelectedCardEventArgs extends SharedEventArgs {
	targetMode: TargetMode
	targetType: TargetType
	triggeringCard: ServerCard
	triggeringPlayer: ServerPlayerInGame
	targetCard: ServerCard
}
export interface CardTargetSelectedUnitEventArgs extends SharedEventArgs {
	targetMode: TargetMode
	targetType: TargetType
	triggeringCard: ServerCard
	triggeringPlayer: ServerPlayerInGame
	targetCard: ServerCard
	targetUnit: ServerUnit
}
export interface CardTargetSelectedRowEventArgs extends SharedEventArgs {
	targetMode: TargetMode
	targetType: TargetType
	triggeringCard: ServerCard
	triggeringPlayer: ServerPlayerInGame
	targetRow: ServerBoardRow
}
export interface CardTargetSelectedPositionEventArgs extends SharedEventArgs {
	targetMode: TargetMode
	targetType: TargetType
	triggeringCard: ServerCard
	triggeringPlayer: ServerPlayerInGame
	targetRow: ServerBoardRow
	targetPosition: number
}
export interface CardTargetsConfirmedEventArgs extends SharedEventArgs {
	triggeringCard: ServerCard
	triggeringPlayer: ServerPlayerInGame
}

export interface PlayerTargetCardSelectedEventArgs extends SharedEventArgs {
	targetMode: TargetMode
	targetType: TargetType
	triggeringPlayer: ServerPlayerInGame
	targetCard: ServerCard
}

export interface UnitCreatedEventArgs extends SharedEventArgs {
	owner: ServerPlayerGroup
	triggeringCard: ServerCard
	triggeringUnit: ServerUnit
}
export interface UnitMovedEventArgs extends SharedEventArgs {
	triggeringUnit: ServerUnit
	fromRow: ServerBoardRow
	fromIndex: number
	toRow: ServerBoardRow
	toIndex: number
	distance: number
	direction: MoveDirection
}
export interface UnitOrderedCardEventArgs extends SharedEventArgs {
	triggeringUnit: ServerUnit
	targetType: TargetType
	targetCard: ServerCard
	targetArguments: ServerCardTargetCard
}
export interface UnitOrderedUnitEventArgs extends SharedEventArgs {
	triggeringUnit: ServerUnit
	targetType: TargetType
	targetCard: ServerCard
	targetUnit: ServerUnit
	targetArguments: ServerCardTargetCard
}
export interface UnitOrderedRowEventArgs extends SharedEventArgs {
	triggeringUnit: ServerUnit
	targetType: TargetType
	targetRow: ServerBoardRow
	targetArguments: ServerCardTargetRow
}
export interface UnitOrderedPositionEventArgs extends SharedEventArgs {
	triggeringUnit: ServerUnit
	targetType: TargetType
	targetRow: ServerBoardRow
	targetPosition: number
	targetArguments: ServerCardTargetPosition
}
export interface UnitDestroyedEventArgs extends SharedEventArgs {
	triggeringCard: ServerCard
	triggeringUnit: ServerUnit
}

export interface UnitDeployedEventArgs extends SharedEventArgs {
	owner: ServerPlayerInGame
	triggeringUnit: ServerUnit
}
export interface SpellDeployedEventArgs extends SharedEventArgs {
	owner: ServerPlayerInGame
	triggeringCard: ServerCard
}

export interface CardBuffCreatedEventArgs extends SharedEventArgs {
	triggeringBuff: ServerCardBuff
}
export interface RowBuffCreatedEventArgs extends SharedEventArgs {
	triggeringBuff: ServerRowBuff
}
export interface CardBuffRemovedEventArgs extends SharedEventArgs {
	triggeringBuff: ServerCardBuff
}
export interface RowBuffRemovedEventArgs extends SharedEventArgs {
	triggeringBuff: ServerRowBuff
}

export interface SpellManaGeneratedEventArgs extends SharedEventArgs {
	player: ServerPlayerInGame
	count: number
	source: EventSubscriber
}

export interface TurnEndedEventArgs extends SharedEventArgs {
	group: ServerPlayerGroup
}
export interface RoundEndedEventArgs extends SharedEventArgs {
	group: ServerPlayerGroup
}

export interface GameFinishedEventArgs extends SharedEventArgs {
	victoriousPlayer: ServerPlayerGroup | null
}
