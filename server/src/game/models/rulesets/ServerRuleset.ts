import GameMode from '@shared/enums/GameMode'
import Constants from '@src/../../shared/src/Constants'
import GameEventType from '@src/../../shared/src/enums/GameEventType'
import Utils, { getClassFromConstructor } from '@src/utils/Utils'
import { EventHook } from '../events/EventHook'
import { EventSubscription } from '../events/EventSubscription'
import GameHookType from '../events/GameHookType'
import { CardSelectorBuilder } from '../events/selectors/CardSelectorBuilder'
import { RulesetAI, RulesetAIBuilder } from './RulesetAI'
import {
	BuffCreatedEventArgs,
	BuffRemovedEventArgs,
	CardDestroyedEventArgs,
	CardPlayedEventArgs,
	CardTakesDamageEventArgs,
	CardTargetSelectedCardEventArgs,
	CardTargetSelectedRowEventArgs,
	CardTargetSelectedUnitEventArgs,
	GameStartedEventArgs,
	RoundEndedEventArgs,
	RoundStartedEventArgs,
	TurnEndedEventArgs,
	TurnStartedEventArgs,
	UnitCreatedEventArgs,
	UnitDestroyedEventArgs,
	UnitMovedEventArgs,
	UnitOrderedCardEventArgs,
	UnitOrderedRowEventArgs,
} from '../events/GameEventCreators'
import ServerGame from '../ServerGame'
import { RulesetDeck, RulesetDeckBuilder } from './RulesetDeck'
import { RulesetConstructor } from '@src/game/libraries/RulesetLibrary'
import { CardConstructor } from '@src/game/libraries/CardLibrary'
import { RulesetBoard, RulesetBoardBuilder } from './RulesetBoard'

type RulesetConstants = {
	STARTING_PLAYER_MORALE: number
	UNIT_HAND_SIZE_LIMIT: number
	UNIT_HAND_SIZE_STARTING: number
	UNIT_HAND_SIZE_PER_ROUND: number
	SPELL_HAND_SIZE_MINIMUM: number
	SPELL_HAND_SIZE_LIMIT: number
	SPELL_MANA_PER_ROUND: number
	GAME_BOARD_ROW_COUNT: number
	MULLIGAN_INITIAL_CARD_COUNT: number
	MULLIGAN_ROUND_CARD_COUNT: number
}

export type RulesetDeckTemplate = (CardConstructor | { card: CardConstructor; count: number })[]

export type ServerRulesetProps = {
	class: string
	gameMode: GameMode
	rulesetConstants: Partial<RulesetConstants>

	ai: RulesetAI | null
	deck: RulesetDeck | null
	board: RulesetBoard | null
}

export class ServerRuleset {
	public readonly class: string
	public readonly gameMode: GameMode

	public readonly rulesetConstants: RulesetConstants

	public readonly ai: RulesetAI | null = null
	public readonly deck: RulesetDeck | null = null
	public readonly board: RulesetBoard | null = null

	constructor(props: ServerRulesetProps) {
		this.class = props.class
		this.gameMode = props.gameMode

		this.ai = props.ai
		this.deck = props.deck
		this.board = props.board

		this.rulesetConstants = {
			STARTING_PLAYER_MORALE: Constants.STARTING_PLAYER_MORALE,
			UNIT_HAND_SIZE_LIMIT: Constants.UNIT_HAND_SIZE_LIMIT,
			UNIT_HAND_SIZE_STARTING: Constants.UNIT_HAND_SIZE_STARTING,
			UNIT_HAND_SIZE_PER_ROUND: Constants.UNIT_HAND_SIZE_PER_ROUND,
			SPELL_HAND_SIZE_MINIMUM: Constants.SPELL_HAND_SIZE_MINIMUM,
			SPELL_HAND_SIZE_LIMIT: Constants.SPELL_HAND_SIZE_LIMIT,
			SPELL_MANA_PER_ROUND: Constants.SPELL_MANA_PER_ROUND,
			GAME_BOARD_ROW_COUNT: Constants.GAME_BOARD_ROW_COUNT,
			MULLIGAN_INITIAL_CARD_COUNT: Constants.MULLIGAN_INITIAL_CARD_COUNT,
			MULLIGAN_ROUND_CARD_COUNT: Constants.MULLIGAN_ROUND_CARD_COUNT,
			...props.rulesetConstants,
		}
	}
}

export type ServerRulesetTemplateProps = ServerRulesetBuilderProps & {
	class: string
	rulesetConstants: Partial<RulesetConstants>

	ai: RulesetAI | null
	deck: RulesetDeck | null
	board: RulesetBoard | null

	eventSubscriptions: Map<GameEventType, EventSubscription<any>[]>
	eventHooks: Map<GameHookType, EventHook<any, any>[]>
	cardSelectorBuilders: CardSelectorBuilder[]
}

export class ServerRulesetTemplate {
	public readonly class: string
	public readonly gameMode: GameMode

	public readonly rulesetConstants: Partial<RulesetConstants>

	public readonly eventSubscriptions: Map<GameEventType, EventSubscription<any>[]>
	public readonly eventHooks: Map<GameHookType, EventHook<any, any>[]>
	public readonly cardSelectorBuilders: CardSelectorBuilder[] = []

	public readonly ai: RulesetAI | null = null
	public readonly deck: RulesetDeck | null = null
	public readonly board: RulesetBoard | null = null

	constructor(props: ServerRulesetTemplateProps) {
		this.class = props.class
		this.gameMode = props.gameMode

		this.eventSubscriptions = props.eventSubscriptions
		this.eventHooks = props.eventHooks
		this.cardSelectorBuilders = props.cardSelectorBuilders

		this.ai = props.ai
		this.deck = props.deck
		this.board = props.board

		this.eventSubscriptions = new Map<GameEventType, EventSubscription<any>[]>()
		this.eventHooks = new Map<GameHookType, EventHook<any, any>[]>()
		Utils.forEachInStringEnum(GameEventType, (eventType) => this.eventSubscriptions.set(eventType, []))
		Utils.forEachInStringEnum(GameHookType, (hookType) => this.eventHooks.set(hookType, []))
		props.eventSubscriptions.forEach((value, key) => {
			this.eventSubscriptions.set(key, this.eventSubscriptions.get(key)!.concat(value))
		})
		props.eventHooks.forEach((value, key) => {
			this.eventHooks.set(key, this.eventHooks.get(key)!.concat(value))
		})
		this.cardSelectorBuilders = props.cardSelectorBuilders

		this.rulesetConstants = props.rulesetConstants
	}

	public __build(): ServerRuleset {
		return new ServerRuleset({
			class: this.class,
			gameMode: this.gameMode,
			rulesetConstants: this.rulesetConstants,
			ai: this.ai,
			deck: this.deck,
			board: this.board,
		})
	}

	public __applyAmplifiers(game: ServerGame): void {
		game.events.insertCallbacks(this.eventSubscriptions)
		game.events.insertHooks(this.eventHooks)
		game.events.insertSelectors(this.cardSelectorBuilders)
	}
}

export type ServerRulesetBuilderProps = {
	gameMode: GameMode
}

export class ServerRulesetBuilder {
	private readonly class: string
	private readonly props: ServerRulesetBuilderProps

	private eventSubscriptions: Map<GameEventType, EventSubscription<any>[]>
	private eventHooks: Map<GameHookType, EventHook<any, any>[]>
	private cardSelectorBuilders: CardSelectorBuilder[] = []

	private aiBuilder: RulesetAIBuilder | null = null
	private deckBuilder: RulesetDeckBuilder | null = null
	private boardBuilder: RulesetBoardBuilder | null = null

	private rulesetConstants: Partial<RulesetConstants> = {}

	constructor(props: ServerRulesetBuilderProps) {
		this.props = props
		this.class = getClassFromConstructor(this.constructor as RulesetConstructor)

		this.eventSubscriptions = new Map<GameEventType, EventSubscription<any>[]>()
		this.eventHooks = new Map<GameHookType, EventHook<any, any>[]>()
		Utils.forEachInStringEnum(GameEventType, (eventType) => this.eventSubscriptions.set(eventType, []))
		Utils.forEachInStringEnum(GameHookType, (hookType) => this.eventHooks.set(hookType, []))
	}

	protected updateConstants(values: Partial<RulesetConstants>): void {
		this.rulesetConstants = values
	}

	protected createAI(cards: RulesetDeckTemplate): RulesetAIBuilder {
		const builder = new RulesetAIBuilder(cards)
		this.aiBuilder = builder
		return builder
	}

	protected createDeck(): RulesetDeckBuilder {
		const builder = new RulesetDeckBuilder()
		this.deckBuilder = builder
		return builder
	}

	protected createBoard(): RulesetBoardBuilder {
		const builder = new RulesetBoardBuilder()
		this.boardBuilder = builder
		return builder
	}

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
	protected createCallback(event: GameEventType.BUFF_CREATED): EventSubscription<BuffCreatedEventArgs>
	protected createCallback(event: GameEventType.BUFF_REMOVED): EventSubscription<BuffRemovedEventArgs>
	protected createCallback<EventArgs>(event: GameEventType): EventSubscription<EventArgs> {
		const eventSubscription = new EventSubscription<EventArgs>(null)
		this.eventSubscriptions.get(event)!.push(eventSubscription)
		return eventSubscription
	}

	public createHook<HookValues, HookArgs>(hook: GameHookType): EventHook<HookValues, HookArgs> {
		const eventHook = new EventHook<HookValues, HookArgs>(null)
		this.eventHooks.get(hook)!.push(eventHook)
		return eventHook
	}

	public createSelector(): CardSelectorBuilder {
		const cardSelector = new CardSelectorBuilder(null)
		this.cardSelectorBuilders.push(cardSelector)
		return cardSelector
	}

	public __build(): ServerRulesetTemplate {
		return new ServerRulesetTemplate({
			...this.props,
			class: this.class,

			rulesetConstants: this.rulesetConstants,

			ai: this.aiBuilder ? this.aiBuilder.__build() : null,
			deck: this.deckBuilder ? this.deckBuilder.__build() : null,
			board: this.boardBuilder ? this.boardBuilder.__build() : null,

			eventSubscriptions: this.eventSubscriptions,
			eventHooks: this.eventHooks,
			cardSelectorBuilders: this.cardSelectorBuilders,
		})
	}
}
