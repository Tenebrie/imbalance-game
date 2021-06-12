import GameMode from '@shared/enums/GameMode'
import GameEventType from '@src/../../shared/src/enums/GameEventType'
import Utils, { getClassFromConstructor } from '@src/utils/Utils'
import { EventHook } from '../events/EventHook'
import { EventSubscription } from '../events/EventSubscription'
import GameHookType from '../events/GameHookType'
import { CardSelectorBuilder } from '../events/selectors/CardSelectorBuilder'
import { RulesetAI, RulesetAIBuilder } from './RulesetAI'
import Ruleset from '@shared/models/Ruleset'
import {
	CardBuffCreatedEventArgs,
	CardBuffRemovedEventArgs,
	CardDestroyedEventArgs,
	CardDrawnEventArgs,
	CardPlayedEventArgs,
	CardTakesDamageEventArgs,
	CardTargetSelectedCardEventArgs,
	CardTargetSelectedRowEventArgs,
	CardTargetSelectedUnitEventArgs,
	GameFinishedEventArgs,
	GameSetupEventArgs,
	GameStartedEventArgs,
	RoundEndedEventArgs,
	RoundStartedEventArgs,
	RowBuffCreatedEventArgs,
	RowBuffRemovedEventArgs,
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
import { RulesetConstants } from '@shared/models/RulesetConstants'
import BoardSplitMode from '@src/../../shared/src/enums/BoardSplitMode'
import RulesetCategory from '@src/../../shared/src/enums/RulesetCategory'

export type RulesetDeckTemplate = (CardConstructor | { card: CardConstructor; count: number })[]

export type ServerRulesetProps = {
	class: string
	gameMode: GameMode
	category: RulesetCategory
	sortPriority: number

	state: Record<string, any>
	constants: Partial<RulesetConstants>

	ai: RulesetAI | null
	deck: RulesetDeck | null
	board: RulesetBoard | null
}

/* Ruleset representation for an active ServerGame object and client communications */
export class ServerRuleset implements Ruleset {
	public readonly class: string
	public readonly gameMode: GameMode
	public readonly category: RulesetCategory
	public readonly sortPriority: number

	public state: any
	public readonly constants: RulesetConstants

	public readonly ai: RulesetAI | null = null
	public readonly deck: RulesetDeck | null = null
	public readonly board: RulesetBoard | null = null

	constructor(props: ServerRulesetProps) {
		this.class = props.class
		this.gameMode = props.gameMode
		this.category = props.category
		this.sortPriority = props.sortPriority

		this.ai = props.ai
		this.deck = props.deck
		this.board = props.board

		this.state = {
			...props.state,
		}

		this.constants = {
			STARTING_PLAYER_MORALE: 2,
			UNIT_HAND_SIZE_LIMIT: 35,
			UNIT_HAND_SIZE_STARTING: 10,
			UNIT_HAND_SIZE_PER_ROUND: 5,
			SPELL_HAND_SIZE_MINIMUM: 10,
			SPELL_HAND_SIZE_LIMIT: 10,
			SPELL_MANA_PER_ROUND: 0,
			MULLIGAN_INITIAL_CARD_COUNT: 5,
			MULLIGAN_ROUND_CARD_COUNT: 3,
			GAME_BOARD_ROW_COUNT: 6,
			GAME_BOARD_ROW_SPLIT_MODE: BoardSplitMode.SPLIT_IN_HALF,
			...props.constants,
		}
	}

	public get playerDeckRequired(): boolean {
		return this.deck === null
	}
}

export type ServerRulesetTemplateProps = ServerRulesetBuilderProps<any> & {
	class: string
	rulesetConstants: Partial<RulesetConstants>

	ai: RulesetAI | null
	deck: RulesetDeck | null
	board: RulesetBoard | null

	eventSubscriptions: Map<GameEventType, EventSubscription<any>[]>
	eventHooks: Map<GameHookType, EventHook<any, any>[]>
	cardSelectorBuilders: CardSelectorBuilder[]
}

/* Ruleset representation stored in RulesetLibrary */
export class ServerRulesetTemplate {
	public readonly class: string
	public readonly gameMode: GameMode
	public readonly category: RulesetCategory
	public readonly sortPriority: number

	public readonly state: Record<string, any>
	public readonly constants: Partial<RulesetConstants>

	public readonly eventSubscriptions: Map<GameEventType, EventSubscription<any>[]>
	public readonly eventHooks: Map<GameHookType, EventHook<any, any>[]>
	public readonly cardSelectorBuilders: CardSelectorBuilder[] = []

	public readonly ai: RulesetAI | null = null
	public readonly deck: RulesetDeck | null = null
	public readonly board: RulesetBoard | null = null

	constructor(props: ServerRulesetTemplateProps) {
		this.class = props.class
		this.gameMode = props.gameMode
		this.category = props.category
		this.sortPriority = props.sortPriority || 0

		this.state = props.state

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
		props.eventSubscriptions.forEach((value: EventSubscription<any>[], key: GameEventType) => {
			this.eventSubscriptions.set(key, this.eventSubscriptions.get(key)!.concat(value))
		})
		props.eventHooks.forEach((value: EventHook<any, any>[], key: GameHookType) => {
			this.eventHooks.set(key, this.eventHooks.get(key)!.concat(value))
		})
		this.cardSelectorBuilders = props.cardSelectorBuilders

		this.constants = props.rulesetConstants
	}

	public __build(): ServerRuleset {
		return new ServerRuleset({
			class: this.class,
			gameMode: this.gameMode,
			category: this.category,
			sortPriority: this.sortPriority,
			constants: this.constants,
			ai: this.ai,
			deck: this.deck,
			board: this.board,
			state: {
				...this.state,
			},
		})
	}

	public __applyAmplifiers(game: ServerGame): void {
		game.events.insertCallbacks(this.eventSubscriptions)
		game.events.insertHooks(this.eventHooks)
		game.events.insertSelectors(this.cardSelectorBuilders)
	}
}

export type ServerRulesetBuilderProps<T> = {
	gameMode: GameMode
	category: RulesetCategory
	sortPriority?: number
	state?: T
}

/* Ruleset representation used in the definition files */
export class ServerRulesetBuilder<T> {
	private readonly class: string
	private readonly props: ServerRulesetBuilderProps<T>

	private eventSubscriptions: Map<GameEventType, EventSubscription<any>[]>
	private eventHooks: Map<GameHookType, EventHook<any, any>[]>
	private cardSelectorBuilders: CardSelectorBuilder[] = []

	private aiBuilder: RulesetAIBuilder | null = null
	private deckBuilder: RulesetDeckBuilder | null = null
	private boardBuilder: RulesetBoardBuilder | null = null

	private rulesetConstants: Partial<RulesetConstants> = {}

	constructor(props: ServerRulesetBuilderProps<T>) {
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

	protected createCallback(event: GameEventType.GAME_SETUP): EventSubscription<GameSetupEventArgs>
	protected createCallback(event: GameEventType.GAME_STARTED): EventSubscription<GameStartedEventArgs>
	protected createCallback(event: GameEventType.TURN_STARTED): EventSubscription<TurnStartedEventArgs>
	protected createCallback(event: GameEventType.TURN_ENDED): EventSubscription<TurnEndedEventArgs>
	protected createCallback(event: GameEventType.ROUND_STARTED): EventSubscription<RoundStartedEventArgs>
	protected createCallback(event: GameEventType.ROUND_ENDED): EventSubscription<RoundEndedEventArgs>
	protected createCallback(event: GameEventType.UNIT_MOVED): EventSubscription<UnitMovedEventArgs>
	protected createCallback(event: GameEventType.CARD_DRAWN): EventSubscription<CardDrawnEventArgs>
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
	protected createCallback(event: GameEventType.CARD_BUFF_CREATED): EventSubscription<CardBuffCreatedEventArgs>
	protected createCallback(event: GameEventType.CARD_BUFF_REMOVED): EventSubscription<CardBuffRemovedEventArgs>
	protected createCallback(event: GameEventType.ROW_BUFF_CREATED): EventSubscription<RowBuffCreatedEventArgs>
	protected createCallback(event: GameEventType.ROW_BUFF_REMOVED): EventSubscription<RowBuffRemovedEventArgs>
	protected createCallback(event: GameEventType.GAME_FINISHED): EventSubscription<GameFinishedEventArgs>
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

	protected getState(game: ServerGame): T {
		return game.ruleset.state as T
	}

	protected setState(game: ServerGame, state: Partial<T>): void {
		game.ruleset.state = {
			...game.ruleset.state,
			...state,
		}
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
