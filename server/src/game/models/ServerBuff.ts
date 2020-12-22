import { v4 as uuidv4 } from 'uuid'
import Buff from '@shared/models/Buff'
import ServerGame from './ServerGame'
import ServerCard from './ServerCard'
import ServerUnit from './ServerUnit'
import TargetDefinition from './targetDefinitions/TargetDefinition'
import OutgoingCardUpdateMessages from '../handlers/outgoing/OutgoingCardUpdateMessages'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import CardLocation from '@shared/enums/CardLocation'
import GameHookType from './events/GameHookType'
import GameEventType from '@shared/enums/GameEventType'
import BuffFeature from '@shared/enums/BuffFeature'
import GameEventCreators, { TurnEndedEventArgs, TurnStartedEventArgs } from './events/GameEventCreators'
import BuffAlignment from '@shared/enums/BuffAlignment'
import StandardTargetDefinitionBuilder from './targetDefinitions/StandardTargetDefinitionBuilder'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import { EventSubscription } from './events/EventSubscription'
import { EventHook } from './events/EventHook'
import { CardSelectorBuilder } from './events/selectors/CardSelectorBuilder'
import { CardSelector } from './events/selectors/CardSelector'

export type ServerBuffProps = {
	alignment: BuffAlignment
	duration?: number
	features?: BuffFeature[]
	cardTribes?: CardTribe[]
	cardFeatures?: CardFeature[]
}

export type BuffConstructorParams = {
	card: ServerCard
	source: ServerCard | null
	selector: CardSelector | null
	duration: number | 'default'
}

export default class ServerBuff implements Buff {
	public readonly id: string
	public readonly game: ServerGame
	public readonly card: ServerCard
	public readonly class: string
	public readonly source: ServerCard | null
	public readonly selector: CardSelector | null
	public readonly alignment: BuffAlignment
	public readonly cardTribes: CardTribe[]
	public readonly buffFeatures: BuffFeature[]
	public readonly cardFeatures: CardFeature[]

	public readonly name: string
	public readonly description: string
	public readonly baseDuration: number

	private __duration: number

	constructor(params: BuffConstructorParams, props: ServerBuffProps) {
		this.id = uuidv4()
		this.game = params.card.game
		this.card = params.card
		this.class = this.constructor.name.substr(0, 1).toLowerCase() + this.constructor.name.substr(1)
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

		this.createCallback<TurnStartedEventArgs>(GameEventType.TURN_STARTED)
			.require(({ player }) => player === this.card.owner)
			.require(() => this.__duration < Infinity)
			.perform(() => this.onTurnChanged())

		this.createCallback<TurnEndedEventArgs>(GameEventType.TURN_ENDED)
			.require(({ player }) => player === this.card.owner)
			.require(() => this.__duration < Infinity)
			.perform(() => this.onTurnChanged())
	}

	public get duration(): number {
		return this.__duration
	}

	private onTurnChanged(): void {
		this.setDuration(this.duration - 1)
	}

	protected get unit(): ServerUnit | undefined {
		return this.game.board.findUnitById(this.card.id)
	}

	public get location(): CardLocation {
		return this.card.location
	}

	public setDuration(value: number): void {
		this.__duration = value
		OutgoingCardUpdateMessages.notifyAboutCardBuffDurationChanged(this.card, this)
		if (this.__duration <= 0) {
			this.card.buffs.removeByReference(this)
		}
		OutgoingMessageHandlers.notifyAboutCardStatsChange(this.card)
	}

	/* Subscribe to a game event
	 * -------------------------
	 * Create a callback for a global game event. By default, this callback will trigger regardless
	 * of which card has triggered the event or where the subscriber is located.
	 *
	 * Subscribers must **NOT** modify the event that triggered the callback. See `createHook` for
	 * event modifications.
	 */
	protected createCallback<ArgsType>(event: GameEventType): EventSubscription<ArgsType> {
		return this.game.events.createCallback(this, event)
	}

	/* Subscribe to a game event triggered by this buff
	 * ------------------------------------------------
	 * `createEffect` is equivalent to `createCallback`, but it will only trigger when
	 * the `effectSource` is set to the subscriber.
	 */
	protected createEffect<ArgsType>(event: GameEventType): EventSubscription<ArgsType> {
		return this.game.events
			.createCallback<ArgsType>(this, event)
			.require((args, rawEvent) => !!rawEvent.effectSource && rawEvent.effectSource === this)
	}

	/* Subscribe to a game hook
	 * ------------------------
	 * Game hooks are callbacks that allow the event to be modified. For example, using the
	 * `GameHookType.CARD_TAKES_DAMAGE` hook it is possible to increase or decrease the damage a card
	 * takes from any source.
	 */
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

	getMaxPowerOverride(baseValue: number): number {
		return baseValue
	}
	getMaxArmorOverride(baseValue: number): number {
		return baseValue
	}
	getUnitCostOverride(baseValue: number): number {
		return baseValue
	}
	getSpellCostOverride(baseValue: number): number {
		return baseValue
	}

	getSoloUnitDamageOverride(baseValue: number): number {
		return baseValue
	}
	getMassUnitDamageOverride(baseValue: number): number {
		return baseValue
	}
	getSoloSpellDamageOverride(baseValue: number): number {
		return baseValue
	}
	getMassSpellDamageOverride(baseValue: number): number {
		return baseValue
	}
	getSoloHealingPotencyOverride(baseValue: number): number {
		return baseValue
	}
	getMassHealingPotencyOverride(baseValue: number): number {
		return baseValue
	}
	getSoloBuffPotencyOverride(baseValue: number): number {
		return baseValue
	}
	getMassBuffPotencyOverride(baseValue: number): number {
		return baseValue
	}
	getSoloEffectDurationOverride(baseValue: number): number {
		return baseValue
	}
	getMassEffectDurationOverride(baseValue: number): number {
		return baseValue
	}
	getTargetCountOverride(baseValue: number): number {
		return baseValue
	}
	getCriticalHitChanceOverride(baseValue: number): number {
		return baseValue
	}
	getCriticalBuffChanceOverride(baseValue: number): number {
		return baseValue
	}
	getCriticalHealChanceOverride(baseValue: number): number {
		return baseValue
	}

	definePlayValidTargetsMod(): StandardTargetDefinitionBuilder {
		return TargetDefinition.none(this.game)
	}
	defineValidOrderTargetsMod(): StandardTargetDefinitionBuilder {
		return TargetDefinition.none(this.game)
	}
	definePostPlayRequiredTargetsMod(): StandardTargetDefinitionBuilder {
		return TargetDefinition.none(this.game)
	}
	definePlayValidTargetsOverride(targetDefinition: StandardTargetDefinitionBuilder): StandardTargetDefinitionBuilder {
		return targetDefinition
	}
	defineValidOrderTargetsOverride(targetDefinition: StandardTargetDefinitionBuilder): StandardTargetDefinitionBuilder {
		return targetDefinition
	}
	definePostPlayRequiredTargetsOverride(targetDefinition: StandardTargetDefinitionBuilder): StandardTargetDefinitionBuilder {
		return targetDefinition
	}
}
