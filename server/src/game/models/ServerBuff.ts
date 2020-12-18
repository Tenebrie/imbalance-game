import { v4 as uuidv4 } from 'uuid'
import Buff from '@shared/models/Buff'
import BuffStackType from '@shared/enums/BuffStackType'
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
import GameEventCreators, {TurnEndedEventArgs, TurnStartedEventArgs} from './events/GameEventCreators'
import BuffAlignment from '@shared/enums/BuffAlignment'
import StandardTargetDefinitionBuilder from './targetDefinitions/StandardTargetDefinitionBuilder'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import {CardSelector, CardSelectorBuilder} from './events/CardSelector'
import {EventSubscription} from './events/EventSubscription'
import {EventHook} from './events/EventHook'

export default class ServerBuff implements Buff {
	id: string
	game: ServerGame
	source: ServerCard | null
	buffClass: string
	alignment: BuffAlignment
	stackType: BuffStackType
	cardTribes: CardTribe[]
	buffFeatures: BuffFeature[]
	cardFeatures: CardFeature[]

	name: string
	description: string

	duration: number
	intensity: number
	baseDuration: number
	baseIntensity: number

	__card: ServerCard | null

	constructor(game: ServerGame, stackType: BuffStackType) {
		this.id = uuidv4()
		this.game = game
		this.stackType = stackType
		this.alignment = BuffAlignment.NEUTRAL
		this.baseDuration = Infinity
		this.baseIntensity = 1
		this.cardTribes = []
		this.buffFeatures = []
		this.cardFeatures = []

		this.name = ''
		this.description = ''
		this.duration = this.baseDuration
		this.intensity = this.baseIntensity

		this.__card = null
		this.source = null
		this.buffClass = ''

		this.createCallback<TurnStartedEventArgs>(GameEventType.TURN_STARTED)
			.require(({ player }) => player === this.card.owner)
			.require(() => this.duration < Infinity)
			.perform(() => this.onTurnChanged())

		this.createCallback<TurnEndedEventArgs>(GameEventType.TURN_ENDED)
			.require(({ player }) => player === this.card.owner)
			.require(() => this.duration < Infinity)
			.perform(() => this.onTurnChanged())
	}

	public get card(): ServerCard {
		if (!this.__card) {
			throw new Error('Buff is not assigned to a card yet')
		}
		return this.__card
	}

	public set card(value: ServerCard) {
		this.__card = value
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
		this.duration = value
		OutgoingCardUpdateMessages.notifyAboutCardBuffDurationChanged(this.card, this)
		if (this.duration <= 0) {
			this.card.buffs.removeByReference(this)
		}
		OutgoingMessageHandlers.notifyAboutCardStatsChange(this.card)
	}

	public setIntensity(value: number): void {
		value = Math.max(0, value)
		if (value === this.intensity) {
			return
		}

		const delta = value - this.intensity
		this.intensity = value
		OutgoingCardUpdateMessages.notifyAboutCardBuffIntensityChanged(this.card, this)
		if (delta > 0) {
			for (let i = 0; i < delta; i++) {
				this.game.events.postEvent(GameEventCreators.buffCreated({
					triggeringBuff: this
				}))
			}
		} else if (delta < 0) {
			for (let i = 0; i < Math.abs(delta); i++) {
				this.game.events.postEvent(GameEventCreators.buffRemoved({
					triggeringBuff: this
				}))
			}
		}

		if (this.intensity <= 0) {
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
		return this.game.events.createCallback<ArgsType>(this, event)
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

	getMaxPowerOverride(baseValue: number): number { return baseValue }
	getMaxArmorOverride(baseValue: number): number { return baseValue }
	getUnitCostOverride(baseValue: number): number { return baseValue }
	getSpellCostOverride(baseValue: number): number { return baseValue }

	getSoloUnitDamageOverride(baseValue: number): number { return baseValue }
	getMassUnitDamageOverride(baseValue: number): number { return baseValue }
	getSoloSpellDamageOverride(baseValue: number): number { return baseValue }
	getMassSpellDamageOverride(baseValue: number): number { return baseValue }
	getSoloHealingPotencyOverride(baseValue: number): number { return baseValue }
	getMassHealingPotencyOverride(baseValue: number): number { return baseValue }
	getSoloBuffPotencyOverride(baseValue: number): number { return baseValue }
	getMassBuffPotencyOverride(baseValue: number): number { return baseValue }
	getSoloEffectDurationOverride(baseValue: number): number { return baseValue }
	getMassEffectDurationOverride(baseValue: number): number { return baseValue }
	getTargetCountOverride(baseValue: number): number { return baseValue }
	getCriticalHitChanceOverride(baseValue: number): number { return baseValue }
	getCriticalBuffChanceOverride(baseValue: number): number { return baseValue }
	getCriticalHealChanceOverride(baseValue: number): number { return baseValue }

	definePlayValidTargetsMod(): StandardTargetDefinitionBuilder { return TargetDefinition.none(this.game) }
	defineValidOrderTargetsMod(): StandardTargetDefinitionBuilder { return TargetDefinition.none(this.game) }
	definePostPlayRequiredTargetsMod(): StandardTargetDefinitionBuilder { return TargetDefinition.none(this.game) }
	definePlayValidTargetsOverride(targetDefinition: StandardTargetDefinitionBuilder): StandardTargetDefinitionBuilder { return targetDefinition }
	defineValidOrderTargetsOverride(targetDefinition: StandardTargetDefinitionBuilder): StandardTargetDefinitionBuilder { return targetDefinition }
	definePostPlayRequiredTargetsOverride(targetDefinition: StandardTargetDefinitionBuilder): StandardTargetDefinitionBuilder { return targetDefinition }
}
