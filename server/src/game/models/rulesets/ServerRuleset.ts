import GameMode from '@shared/enums/GameMode'
import GameEventType from '@src/../../shared/src/enums/GameEventType'
import { EventHook } from '../events/EventHook'
import { EventSubscription } from '../events/EventSubscription'
import GameHookType, { GameFinishedHookEditableValues, GameFinishedHookFixedValues } from '../events/GameHookType'
import { CardSelectorBuilder } from '../events/selectors/CardSelectorBuilder'
import Ruleset from '@shared/models/ruleset/Ruleset'
import ServerGame from '../ServerGame'
import { CardConstructor } from '@src/game/libraries/CardLibrary'
import { RulesetBoard, RulesetBoardBuilder } from './RulesetBoard'
import { RulesetConstants } from '@shared/models/ruleset/RulesetConstants'
import BoardSplitMode from '@src/../../shared/src/enums/BoardSplitMode'
import RulesetCategory from '@src/../../shared/src/enums/RulesetCategory'
import { enumToArray, forEachInEnum } from '@shared/Utils'
import { RulesetChain, RulesetChainBuilder } from '@src/game/models/rulesets/RulesetChain'
import { RulesetSlotsBuilder, ServerRulesetSlots } from '@src/game/models/rulesets/ServerRulesetSlots'
import CustomDeckRules from '@shared/enums/CustomDeckRules'
import RulesetLifecycleHook, { RulesetLifecycleCallback } from '@src/game/models/rulesets/RulesetLifecycleHook'
import { createRandomGuid, getClassFromConstructor } from '@src/utils/Utils'
import { RulesetConstructor } from '@src/game/libraries/RulesetLibrary'
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
} from '@src/game/models/events/GameEventCreators'

export type RulesetDeckTemplate = (CardConstructor | { card: CardConstructor; count: number })[]

export type ServerRulesetProps = {
	gameMode: GameMode
	category: RulesetCategory
	sortPriority?: number
	constants?: Partial<RulesetConstants>
}

export class ServerRuleset implements Ruleset {
	public readonly game: ServerGame
	public readonly class: string
	public readonly gameMode: GameMode
	public readonly category: RulesetCategory
	public readonly sortPriority: number

	public state: Record<string, any> = {}
	public constants: RulesetConstants

	public slotsBuilder: RulesetSlotsBuilder
	public boardBuilder: RulesetBoardBuilder | null = null
	public chainBuilders: RulesetChainBuilder[] = []

	private readonly lifecycleCallbacks: Map<RulesetLifecycleHook, RulesetLifecycleCallback[]>

	constructor(game: ServerGame, props: ServerRulesetProps) {
		this.game = game
		this.class = getClassFromConstructor(this.constructor as RulesetConstructor)
		this.gameMode = props.gameMode
		this.category = props.category
		this.sortPriority = props.sortPriority || 0

		this.constants = {
			ROUND_WINS_REQUIRED: 2,
			UNIT_HAND_SIZE_LIMIT: 35,
			UNIT_HAND_SIZE_STARTING: 10,
			UNIT_HAND_SIZE_PER_ROUND: 5,
			SPELL_HAND_SIZE_MINIMUM: 35,
			SPELL_HAND_SIZE_LIMIT: 35,
			SPELL_MANA_PER_ROUND: 0,

			FIRST_GROUP_MOVES_FIRST: false,
			SECOND_GROUP_MOVES_FIRST: false,

			SKIP_MULLIGAN: false,
			MULLIGAN_INITIAL_CARD_COUNT: 5,
			MULLIGAN_ROUND_CARD_COUNT: 3,

			GAME_BOARD_ROW_COUNT: 6,
			GAME_BOARD_ROW_SPLIT_MODE: BoardSplitMode.SPLIT_IN_HALF,
			...props.constants,
		}

		this.lifecycleCallbacks = new Map<RulesetLifecycleHook, RulesetLifecycleCallback[]>()
		forEachInEnum(RulesetLifecycleHook, (hook) => this.lifecycleCallbacks.set(hook, []))

		this.slotsBuilder = new RulesetSlotsBuilder()
			.addGroup({ type: 'player', deck: CustomDeckRules.STANDARD })
			.addGroup({ type: 'player', deck: CustomDeckRules.STANDARD })
	}

	public get board(): RulesetBoard | null {
		return this.boardBuilder ? this.boardBuilder.__build() : null
	}

	public get slots(): ServerRulesetSlots {
		return this.slotsBuilder.__build()
	}

	public get chains(): RulesetChain[] {
		return this.chainBuilders.map((chainBuilder) => chainBuilder.__build())
	}

	public lifecycleCallback(hook: RulesetLifecycleHook, game: ServerGame): void {
		const callbacks = this.lifecycleCallbacks.get(hook) || []
		callbacks.forEach((callback) => callback(game))
	}

	public get playerDeckRequired(): boolean {
		const deckRulesValues = enumToArray(CustomDeckRules)
		return this.slots.groups
			.flatMap((group) => group.players)
			.some((player) => player.type === 'player' && !Array.isArray(player.deck) && deckRulesValues.includes(player.deck))
	}

	protected onLifecycle(hook: RulesetLifecycleHook, callback: RulesetLifecycleCallback): void {
		this.lifecycleCallbacks.get(hook)!.push(callback)
	}

	protected useState<StateType>(defaultValue: StateType): [getValue: () => StateType, setValue: (value: StateType) => void] {
		let defaultValueSet = false
		const anonValueId = createRandomGuid()
		const getValue = () => {
			if (!defaultValueSet) {
				setValue(defaultValue)
				defaultValueSet = true
			}
			return this.state[anonValueId]
		}
		const setValue = (value: StateType) => {
			this.state[anonValueId] = value
		}
		return [getValue, setValue]
	}

	protected createBoard(): RulesetBoardBuilder {
		const builder = new RulesetBoardBuilder()
		this.boardBuilder = builder
		return builder
	}

	protected createSlots(): RulesetSlotsBuilder {
		const builder = new RulesetSlotsBuilder()
		this.slotsBuilder = builder
		return builder
	}

	protected createChain(): RulesetChainBuilder {
		const builder = new RulesetChainBuilder()
		this.chainBuilders.push(builder)
		return builder
	}

	protected createCallback(event: GameEventType.GAME_CREATED): EventSubscription<GameSetupEventArgs>
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
		return this.game.events.createCallback(null, event)
	}

	protected createHook(hookType: GameHookType.GAME_FINISHED): EventHook<GameFinishedHookEditableValues, GameFinishedHookFixedValues>
	protected createHook<HookValues, HookArgs>(hook: GameHookType): EventHook<HookValues, HookArgs> {
		return this.game.events.createHook(null, hook)
	}

	protected createSelector(): CardSelectorBuilder {
		return this.game.events.createSelector(null)
	}
}
