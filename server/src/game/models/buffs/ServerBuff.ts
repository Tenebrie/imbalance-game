import Buff, { CardBuff, RowBuff } from '@shared/models/Buff'
import ServerGame from '../ServerGame'
import ServerCard from '../ServerCard'
import ServerUnit from '../ServerUnit'
import OutgoingCardUpdateMessages from '../../handlers/outgoing/OutgoingCardUpdateMessages'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import CardLocation from '@shared/enums/CardLocation'
import GameHookType, {
	CardDestroyedHookArgs,
	CardDestroyedHookValues,
	CardTakesDamageHookArgs,
	CardTakesDamageHookValues,
	UnitDestroyedHookArgs,
	UnitDestroyedHookValues,
} from '../events/GameHookType'
import GameEventType from '@shared/enums/GameEventType'
import BuffFeature from '@shared/enums/BuffFeature'
import {
	CardBuffCreatedEventArgs,
	CardBuffRemovedEventArgs,
	CardDestroyedEventArgs,
	CardDrawnEventArgs,
	CardPlayedEventArgs,
	CardTakesDamageEventArgs,
	CardTargetsConfirmedEventArgs,
	CardTargetSelectedCardEventArgs,
	CardTargetSelectedRowEventArgs,
	CardTargetSelectedUnitEventArgs,
	GameStartedEventArgs,
	RoundEndedEventArgs,
	RoundStartedEventArgs,
	RowBuffCreatedEventArgs,
	RowBuffRemovedEventArgs,
	SpellDeployedEventArgs,
	TurnEndedEventArgs,
	TurnStartedEventArgs,
	UnitCreatedEventArgs,
	UnitDeployedEventArgs,
	UnitDestroyedEventArgs,
	UnitMovedEventArgs,
	UnitOrderedCardEventArgs,
	UnitOrderedRowEventArgs,
	UnitOrderedUnitEventArgs,
} from '../events/GameEventCreators'
import BuffAlignment from '@shared/enums/BuffAlignment'
import OutgoingMessageHandlers from '../../handlers/OutgoingMessageHandlers'
import { EventSubscription } from '../events/EventSubscription'
import { EventHook } from '../events/EventHook'
import { CardSelectorBuilder } from '../events/selectors/CardSelectorBuilder'
import { CardSelector } from '../events/selectors/CardSelector'
import { createRandomId } from '@src/utils/Utils'
import ServerBoardRow from '../ServerBoardRow'
import LeaderStatType from '@src/../../shared/src/enums/LeaderStatType'
import { StatOverride, StatOverrideBuilder } from './StatOverride'
import { ServerBuffParent, ServerBuffSource } from '@src/game/models/buffs/ServerBuffContainer'
import OutgoingBoardUpdateMessages from '@src/game/handlers/outgoing/OutgoingBoardUpdateMessages'

export type ServerBuffProps = {
	alignment: BuffAlignment
	duration?: number
	features?: BuffFeature[]
	cardTribes?: CardTribe[]
	cardFeatures?: CardFeature[]
}

export type BuffConstructorParams = {
	parent: ServerBuffParent
	source: ServerBuffParent | null
	selector: CardSelector | null
	duration: number | 'default'
}

export default class ServerBuff implements Buff {
	public readonly id: string
	public readonly game: ServerGame
	public readonly parent: ServerCard | ServerBoardRow
	public readonly class: string
	public readonly source: ServerBuffSource
	public readonly selector: CardSelector | null
	public readonly alignment: BuffAlignment
	public readonly cardTribes: CardTribe[]
	public readonly buffFeatures: BuffFeature[]
	public readonly cardFeatures: CardFeature[]

	private maxPowerOverride: StatOverride | null = null
	private maxArmorOverride: StatOverride | null = null
	private unitCostOverride: StatOverride | null = null
	private spellCostOverride: StatOverride | null = null
	private leaderStatOverrides: Map<LeaderStatType, StatOverride | null> = new Map<LeaderStatType, StatOverride | null>()
	private maxPowerOverrideBuilder: StatOverrideBuilder | null = null
	private maxArmorOverrideBuilder: StatOverrideBuilder | null = null
	private unitCostOverrideBuilder: StatOverrideBuilder | null = null
	private spellCostOverrideBuilder: StatOverrideBuilder | null = null
	private leaderStatOverrideBuilders: { leaderStat: LeaderStatType; builder: StatOverrideBuilder }[] = []

	public readonly name: string
	public readonly description: string
	public readonly baseDuration: number

	private __duration: number

	constructor(params: BuffConstructorParams, props: ServerBuffProps) {
		const buffClass = this.constructor.name.substr(0, 1).toLowerCase() + this.constructor.name.substr(1)

		this.id = createRandomId('buff', buffClass)
		this.game = params.parent.game
		this.parent = params.parent
		this.class = buffClass
		this.source = params.source
		this.selector = params.selector
		this.alignment = props.alignment
		this.cardTribes = props.cardTribes ? props.cardTribes.slice() : []
		this.buffFeatures = props.features ? props.features.slice() : []
		this.cardFeatures = props.cardFeatures ? props.cardFeatures.slice() : []

		this.name = `buff.${this.class}.name`
		this.description = `buff.${this.class}.description`

		const duration = params.duration !== 'default' ? params.duration : props.duration !== undefined ? props.duration : Infinity
		this.__duration = this.baseDuration = duration

		this.createCallback(GameEventType.TURN_STARTED)
			.require(({ group }) => group === this.parent.owner)
			.require(() => this.__duration < Infinity)
			.perform(() => this.onTurnChanged())

		this.createCallback(GameEventType.TURN_ENDED)
			.require(({ group }) => group === this.parent.owner)
			.require(() => this.__duration < Infinity)
			.perform(() => this.onTurnChanged())

		this.game.index.addBuff(this)
	}

	public get duration(): number {
		return this.__duration
	}

	private onTurnChanged(): void {
		this.setDuration(this.duration - 1)
	}

	// public get card(): ServerCard {
	// 	if (this.parent instanceof ServerBoardRow) {
	// 		throw new Error('The card parent requested on board buff')
	// 	}
	// 	return this.parent
	// }

	protected get unit(): ServerUnit | undefined {
		if (this.parent instanceof ServerBoardRow) {
			return undefined
		}
		return this.game.board.findUnitById(this.parent.id)
	}

	public get location(): CardLocation {
		if (this.parent instanceof ServerBoardRow) {
			return CardLocation.UNKNOWN
		}
		return this.parent.location
	}

	public setDuration(value: number): void {
		this.__duration = value
		if (this instanceof ServerCardBuff) {
			OutgoingCardUpdateMessages.notifyAboutCardBuffDurationChanged(this)
		} else if (this instanceof ServerRowBuff) {
			OutgoingBoardUpdateMessages.notifyAboutRowBuffDurationChanged(this)
		}
		if (this.__duration <= 0) {
			this.parent.buffs.removeByReference(this)
		}

		if (this.parent instanceof ServerCard) {
			OutgoingMessageHandlers.notifyAboutCardStatsChange(this.parent)
		}
	}

	public get protected(): boolean {
		return (
			this.buffFeatures.includes(BuffFeature.SERVICE_BUFF) || this.buffFeatures.includes(BuffFeature.PROTECTED) || this.selector !== null
		)
	}

	/* Subscribe to a game event
	 * -------------------------
	 * Create a callback for a global game event. By default, this callback will trigger regardless
	 * of which card has triggered the event or where the subscriber is located.
	 *
	 * Subscribers must **NOT** modify the event that triggered the callback. See `createHook` for
	 * event modifications.
	 */
	protected createCallback(event: GameEventType.GAME_STARTED): EventSubscription<GameStartedEventArgs>
	protected createCallback(event: GameEventType.TURN_STARTED): EventSubscription<TurnStartedEventArgs>
	protected createCallback(event: GameEventType.TURN_ENDED): EventSubscription<TurnEndedEventArgs>
	protected createCallback(event: GameEventType.ROUND_STARTED): EventSubscription<RoundStartedEventArgs>
	protected createCallback(event: GameEventType.ROUND_ENDED): EventSubscription<RoundEndedEventArgs>
	protected createCallback(event: GameEventType.UNIT_MOVED): EventSubscription<UnitMovedEventArgs>
	protected createCallback(event: GameEventType.CARD_TAKES_DAMAGE): EventSubscription<CardTakesDamageEventArgs>
	protected createCallback(event: GameEventType.CARD_TARGET_SELECTED_CARD): EventSubscription<CardTargetSelectedCardEventArgs>
	protected createCallback(event: GameEventType.CARD_TARGET_SELECTED_UNIT): EventSubscription<CardTargetSelectedUnitEventArgs>
	protected createCallback(event: GameEventType.CARD_TARGET_SELECTED_ROW): EventSubscription<CardTargetSelectedRowEventArgs>
	protected createCallback(event: GameEventType.UNIT_ORDERED_CARD): EventSubscription<UnitOrderedCardEventArgs>
	protected createCallback(event: GameEventType.UNIT_ORDERED_ROW): EventSubscription<UnitOrderedRowEventArgs>
	protected createCallback(event: GameEventType.UNIT_CREATED): EventSubscription<UnitCreatedEventArgs>
	protected createCallback(event: GameEventType.CARD_DESTROYED): EventSubscription<CardDestroyedEventArgs>
	protected createCallback(event: GameEventType.UNIT_DESTROYED): EventSubscription<UnitDestroyedEventArgs>
	protected createCallback(event: GameEventType.CARD_PLAYED): EventSubscription<CardPlayedEventArgs>
	protected createCallback<ArgsType>(event: GameEventType): EventSubscription<ArgsType> {
		return this.game.events.createCallback(this, event)
	}

	/* Subscribe to a game event triggered by this buff
	 * ------------------------------------------------
	 * `createEffect` is equivalent to `createCallback`, but it will only trigger when
	 * the `effectSource` is set to the subscriber.
	 */
	protected createEffect(event: GameEventType.CARD_DRAWN): EventSubscription<CardDrawnEventArgs>
	protected createEffect(event: GameEventType.UNIT_DEPLOYED): EventSubscription<UnitDeployedEventArgs>
	protected createEffect(event: GameEventType.SPELL_DEPLOYED): EventSubscription<SpellDeployedEventArgs>
	protected createEffect(event: GameEventType.CARD_TARGET_SELECTED_CARD): EventSubscription<CardTargetSelectedCardEventArgs>
	protected createEffect(event: GameEventType.CARD_TARGET_SELECTED_UNIT): EventSubscription<CardTargetSelectedUnitEventArgs>
	protected createEffect(event: GameEventType.CARD_TARGET_SELECTED_ROW): EventSubscription<CardTargetSelectedRowEventArgs>
	protected createEffect(event: GameEventType.CARD_TARGETS_CONFIRMED): EventSubscription<CardTargetsConfirmedEventArgs>
	protected createEffect(event: GameEventType.UNIT_ORDERED_CARD): EventSubscription<UnitOrderedCardEventArgs>
	protected createEffect(event: GameEventType.UNIT_ORDERED_UNIT): EventSubscription<UnitOrderedUnitEventArgs>
	protected createEffect(event: GameEventType.UNIT_ORDERED_ROW): EventSubscription<UnitOrderedRowEventArgs>
	protected createEffect(event: GameEventType.UNIT_DESTROYED): EventSubscription<UnitDestroyedEventArgs>
	protected createEffect(event: GameEventType.CARD_BUFF_CREATED): EventSubscription<CardBuffCreatedEventArgs>
	protected createEffect(event: GameEventType.CARD_BUFF_REMOVED): EventSubscription<CardBuffRemovedEventArgs>
	protected createEffect(event: GameEventType.ROW_BUFF_CREATED): EventSubscription<RowBuffCreatedEventArgs>
	protected createEffect(event: GameEventType.ROW_BUFF_REMOVED): EventSubscription<RowBuffRemovedEventArgs>
	protected createEffect<ArgsType>(event: GameEventType): EventSubscription<ArgsType> {
		return this.game.events
			.createCallback<ArgsType>(this, event)
			.require(
				(args, rawEvent) =>
					!!rawEvent.effectSource &&
					(rawEvent.effectSource === this || (this.parent instanceof ServerCard && rawEvent.effectSource === this.parent))
			)
	}

	/* Subscribe to a game hook
	 * ------------------------
	 * Game hooks are callbacks that allow the event to be modified. For example, using the
	 * `GameHookType.CARD_TAKES_DAMAGE` hook it is possible to increase or decrease the damage a card
	 * takes from any source.
	 */
	protected createHook(hookType: GameHookType.CARD_TAKES_DAMAGE): EventHook<CardTakesDamageHookValues, CardTakesDamageHookArgs>
	protected createHook(hookType: GameHookType.CARD_DESTROYED): EventHook<CardDestroyedHookValues, CardDestroyedHookArgs>
	protected createHook(hookType: GameHookType.UNIT_DESTROYED): EventHook<UnitDestroyedHookValues, UnitDestroyedHookArgs>
	protected createHook<HookValues, HookArgs>(hook: GameHookType): EventHook<HookValues, HookArgs> {
		return this.game.events.createHook<HookValues, HookArgs>(this, hook)
	}

	/* Create an aura effect
	 * ------------------------
	 * Description
	 */
	protected createSelector(): CardSelectorBuilder {
		return this.game.events.createSelector(this)
	}

	protected createMaxPowerOverride(): StatOverrideBuilder {
		const builder = new StatOverrideBuilder()
		this.maxPowerOverrideBuilder = builder
		return builder
	}
	protected createMaxArmorOverride(): StatOverrideBuilder {
		const builder = new StatOverrideBuilder()
		this.maxArmorOverrideBuilder = builder
		return builder
	}
	protected createUnitCostOverride(): StatOverrideBuilder {
		const builder = new StatOverrideBuilder()
		this.unitCostOverrideBuilder = builder
		return builder
	}
	protected createSpellCostOverride(): StatOverrideBuilder {
		const builder = new StatOverrideBuilder()
		this.spellCostOverrideBuilder = builder
		return builder
	}
	protected createLeaderStatOverride(leaderStat: LeaderStatType): StatOverrideBuilder {
		const builder = new StatOverrideBuilder()
		this.leaderStatOverrideBuilders.push({
			leaderStat,
			builder,
		})
		return builder
	}

	public getMaxPowerOverride(baseValue: number): number {
		if (this.maxPowerOverrideBuilder) {
			this.maxPowerOverride = this.maxPowerOverrideBuilder.__build()
			this.maxPowerOverrideBuilder = null
		}
		if (!this.maxPowerOverride) {
			return baseValue
		}

		return this.maxPowerOverride.apply(baseValue)
	}
	public getMaxArmorOverride(baseValue: number): number {
		if (this.maxArmorOverrideBuilder) {
			this.maxArmorOverride = this.maxArmorOverrideBuilder.__build()
			this.maxArmorOverrideBuilder = null
		}
		if (!this.maxArmorOverride) {
			return baseValue
		}

		return this.maxArmorOverride.apply(baseValue)
	}
	public getUnitCostOverride(baseValue: number): number {
		if (this.unitCostOverrideBuilder) {
			this.unitCostOverride = this.unitCostOverrideBuilder.__build()
			this.unitCostOverrideBuilder = null
		}
		if (!this.unitCostOverride) {
			return baseValue
		}

		return this.unitCostOverride.apply(baseValue)
	}
	public getSpellCostOverride(baseValue: number): number {
		if (this.spellCostOverrideBuilder) {
			this.spellCostOverride = this.spellCostOverrideBuilder.__build()
			this.spellCostOverrideBuilder = null
		}
		if (!this.spellCostOverride) {
			return baseValue
		}

		return this.spellCostOverride.apply(baseValue)
	}
	public getLeaderStatOverride(leaderStat: LeaderStatType, baseValue: number): number {
		if (this.leaderStatOverrideBuilders.length > 0) {
			this.leaderStatOverrideBuilders.forEach((builderWrapper) => {
				this.leaderStatOverrides.set(builderWrapper.leaderStat, builderWrapper.builder.__build())
			})
			this.leaderStatOverrideBuilders = []
		}

		const override = this.leaderStatOverrides.get(leaderStat)
		if (!override) {
			return baseValue
		}

		return override.apply(baseValue)
	}
}

export class ServerCardBuff extends ServerBuff implements CardBuff {
	parent: ServerCard

	constructor(params: BuffConstructorParams, props: ServerBuffProps) {
		super(params, props)
		if (params.parent instanceof ServerBoardRow) {
			throw new Error('Trying to apply card buff to row')
		}
		this.parent = params.parent
	}
}

export class ServerRowBuff extends ServerBuff implements RowBuff {
	parent: ServerBoardRow

	constructor(params: BuffConstructorParams, props: ServerBuffProps) {
		super(params, props)
		if (params.parent instanceof ServerCard) {
			throw new Error('Trying to apply row buff to card')
		}
		this.parent = params.parent
	}
}
