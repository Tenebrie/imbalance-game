import GameEventType from '@shared/enums/GameEventType'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import ServerCard from './ServerCard'
import ServerUnit from './ServerUnit'
import ServerDamageInstance from './ServerDamageSource'
import DamageSource from '@shared/enums/DamageSource'
import ServerBoardRow from './ServerBoardRow'
import ServerBuff from './ServerBuff'

export default {
	effectUnitDeploy: (): GameEvent => ({
		type: GameEventType.EFFECT_UNIT_DEPLOY,
		args: {}
	}),
	effectSpellPlay: (): GameEvent => ({
		type: GameEventType.EFFECT_SPELL_PLAY,
		args: {}
	}),
	effectTargetSelected: (args: EffectTargetSelectedEventArgs): GameEvent => ({
		type: GameEventType.EFFECT_TARGET_SELECTED,
		args: args
	}),
	effectTargetsConfirmed: (): GameEvent => ({
		type: GameEventType.EFFECT_TARGETS_CONFIRMED,
		args: {}
	}),
	effectBuffCreated: (): GameEvent => ({
		type: GameEventType.EFFECT_BUFF_CREATED,
		args: {}
	}),
	effectBuffRemoved: (): GameEvent => ({
		type: GameEventType.EFFECT_BUFF_REMOVED,
		args: {}
	}),

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

	unitCreated: (args: UnitCreatedEventArgs): GameEvent => ({
		type: GameEventType.UNIT_CREATED,
		args: args,
		logVariables: {
			triggeringUnit: args.triggeringUnit.card.id
		}
	}),
	unitDestroyed: (args: UnitDestroyedEventArgs): GameEvent => ({
		type: GameEventType.UNIT_DESTROYED,
		args: args,
		logVariables: {
			triggeringUnit: args.triggeringUnit.card.id
		}
	}),

	buffCreated: (args: BuffCreatedEventArgs): GameEvent => ({
		type: GameEventType.BUFF_CREATED,
		args: args,
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
	logSubtype?: string
	logVariables?: Record<string, string | number>
}

export interface EffectTargetSelectedEventArgs {
	targetCard: ServerCard
	targetUnit: ServerUnit
	targetRow: ServerBoardRow
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

export interface UnitCreatedEventArgs {
	triggeringUnit: ServerUnit
}
export interface UnitDestroyedEventArgs {
	triggeringUnit: ServerUnit
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
