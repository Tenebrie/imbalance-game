import GameMode from '@shared/enums/GameMode'
import GameEventType from '@src/../../shared/src/enums/GameEventType'
import { getClassFromConstructor } from '@src/utils/Utils'
import { EventHook } from '../events/EventHook'
import { EventSubscription } from '../events/EventSubscription'
import GameHookType from '../events/GameHookType'
import { CardSelectorBuilder } from '../events/selectors/CardSelectorBuilder'
import { RulesetAIBuilder } from './RulesetAI'
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
import { RulesetDeckBuilder } from './RulesetDeck'
import { RulesetConstructor } from '@src/game/libraries/RulesetLibrary'
import { RulesetBoardBuilder } from './RulesetBoard'
import { RulesetConstants } from '@shared/models/RulesetConstants'
import RulesetCategory from '@src/../../shared/src/enums/RulesetCategory'
import { forEachInEnum } from '@shared/Utils'
import { RulesetChainBuilder } from '@src/game/models/rulesets/RulesetChain'
import { RulesetDeckTemplate, ServerRulesetTemplate } from '@src/game/models/rulesets/ServerRuleset'

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

	private readonly eventSubscriptions: Map<GameEventType, EventSubscription<any>[]>
	private readonly eventHooks: Map<GameHookType, EventHook<any, any>[]>
	private cardSelectorBuilders: CardSelectorBuilder[] = []

	private aiBuilder: RulesetAIBuilder | null = null
	private deckBuilder: RulesetDeckBuilder | null = null
	private boardBuilder: RulesetBoardBuilder | null = null
	private chainBuilder: RulesetChainBuilder | null = null

	private rulesetConstants: Partial<RulesetConstants> = {}

	constructor(props: ServerRulesetBuilderProps<T>) {
		this.props = props
		this.class = getClassFromConstructor(this.constructor as RulesetConstructor)

		this.eventSubscriptions = new Map<GameEventType, EventSubscription<any>[]>()
		this.eventHooks = new Map<GameHookType, EventHook<any, any>[]>()
		forEachInEnum(GameEventType, (eventType) => this.eventSubscriptions.set(eventType, []))
		forEachInEnum(GameHookType, (hookType) => this.eventHooks.set(hookType, []))
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

	protected createChain(): RulesetChainBuilder {
		const builder = new RulesetChainBuilder()
		this.chainBuilder = builder
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
			chain: this.chainBuilder ? this.chainBuilder.__build() : null,

			eventSubscriptions: this.eventSubscriptions,
			eventHooks: this.eventHooks,
			cardSelectorBuilders: this.cardSelectorBuilders,
		})
	}
}
