import uuidv4 from 'uuid/v4'
import Buff from '@shared/models/Buff'
import BuffStackType from '@shared/enums/BuffStackType'
import ServerGame from './ServerGame'
import ServerCard from './ServerCard'
import ServerUnit from './ServerUnit'
import TargetDefinitionBuilder from './targetDefinitions/TargetDefinitionBuilder'
import TargetDefinition from './targetDefinitions/TargetDefinition'
import OutgoingCardUpdateMessages from '../handlers/outgoing/OutgoingCardUpdateMessages'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import CardLocation from '@shared/enums/CardLocation'
import {EventCallback, EventHook} from './ServerGameEvents'
import GameHookType from './GameHookType'
import GameEventType from '@shared/enums/GameEventType'
import BuffFeature from '@shared/enums/BuffFeature'
import GameEventCreators, {TurnEndedEventArgs, TurnStartedEventArgs} from './GameEventCreators'
import BuffAlignment from '@shared/enums/BuffAlignment'

export default class ServerBuff implements Buff {
	id: string
	game: ServerGame
	card: ServerCard
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

		this.createCallback<TurnStartedEventArgs>(GameEventType.TURN_STARTED)
			.require(({ player }) => player === this.card.owner)
			.perform(() => this.onTurnChanged())

		this.createCallback<TurnEndedEventArgs>(GameEventType.TURN_ENDED)
			.require(({ player }) => player === this.card.owner)
			.perform(() => this.onTurnChanged())
	}

	private onTurnChanged(): void {
		this.addDuration(-1)
	}

	protected get unit(): ServerUnit | null {
		return this.game.board.findUnitById(this.card.id)
	}

	public get location(): CardLocation {
		return this.card.location
	}

	public addDuration(delta: number): void {
		this.setDuration(this.duration + delta)
	}

	public setDuration(value: number): void {
		this.duration = value
		OutgoingCardUpdateMessages.notifyAboutCardBuffDurationChanged(this.card, this)
		if (this.duration <= 0) {
			this.card.buffs.removeByReference(this)
		}
	}

	public addIntensity(delta: number): void {
		this.setIntensity(Math.max(0, this.intensity + delta))
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
	}

	/* Subscribe to a game event
	 * -------------------------
	 * Create a callback for a global game event. By default, this callback will trigger regardless
	 * of which card has triggered the event or where the subscriber is located.
	 *
	 * Subscribers must **NOT** modify the event that triggered the callback. See `createHook` for
	 * event modifications.
	 */
	protected createCallback<ArgsType>(event: GameEventType): EventCallback<ArgsType> {
		return this.game.events.createCallback(this, event)
	}

	/* Subscribe to a game event triggered by this buff
	 * ------------------------------------------------
	 * `createEffect` is equivalent to `createCallback`, but it will only trigger when
	 * the `effectSource` is set to the subscriber.
	 */
	protected createEffect<ArgsType>(event: GameEventType): EventCallback<ArgsType> {
		return this.game.events.createCallback<ArgsType>(this, event)
			.require((args, rawEvent) => rawEvent.effectSource && rawEvent.effectSource === this)
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

	getUnitCostOverride(baseCost: number): number { return baseCost }
	getSpellCostOverride(baseCost: number): number { return baseCost }

	definePlayValidTargetsMod(): TargetDefinitionBuilder { return TargetDefinition.none(this.game) }
	defineValidOrderTargetsMod(): TargetDefinitionBuilder { return TargetDefinition.none(this.game) }
	definePostPlayRequiredTargetsMod(): TargetDefinitionBuilder { return TargetDefinition.none(this.game) }
	definePlayValidTargetsOverride(targetDefinition: TargetDefinitionBuilder): TargetDefinitionBuilder { return targetDefinition }
	defineValidOrderTargetsOverride(targetDefinition: TargetDefinitionBuilder): TargetDefinitionBuilder { return targetDefinition }
	definePostPlayRequiredTargetsOverride(targetDefinition: TargetDefinitionBuilder): TargetDefinitionBuilder { return targetDefinition }
}
