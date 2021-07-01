import GameMode from '@shared/enums/GameMode'
import GameEventType from '@src/../../shared/src/enums/GameEventType'
import { EventHook } from '../events/EventHook'
import { EventSubscription } from '../events/EventSubscription'
import GameHookType from '../events/GameHookType'
import { CardSelectorBuilder } from '../events/selectors/CardSelectorBuilder'
import Ruleset from '@shared/models/ruleset/Ruleset'
import ServerGame from '../ServerGame'
import { CardConstructor } from '@src/game/libraries/CardLibrary'
import { RulesetBoard } from './RulesetBoard'
import { RulesetConstants } from '@shared/models/ruleset/RulesetConstants'
import BoardSplitMode from '@src/../../shared/src/enums/BoardSplitMode'
import RulesetCategory from '@src/../../shared/src/enums/RulesetCategory'
import { enumToArray } from '@shared/Utils'
import { RulesetChain } from '@src/game/models/rulesets/RulesetChain'
import { ServerRulesetBuilderProps } from '@src/game/models/rulesets/ServerRulesetBuilder'
import { ServerRulesetSlots } from '@src/game/models/rulesets/ServerRulesetSlots'
import CustomDeckRules from '@shared/enums/CustomDeckRules'
import RulesetLifecycleHook, { RulesetLifecycleCallback } from '@src/game/models/rulesets/RulesetLifecycleHook'

export type RulesetDeckTemplate = (CardConstructor | { card: CardConstructor; count: number })[]

export type ServerRulesetProps = {
	class: string
	gameMode: GameMode
	category: RulesetCategory
	sortPriority: number

	state: Record<string, any>
	constants: Partial<RulesetConstants>
	lifecycleCallbacks: Map<RulesetLifecycleHook, RulesetLifecycleCallback[]>

	board: RulesetBoard | null
	slots: ServerRulesetSlots
	chains: RulesetChain[]
}

/* Ruleset representation for an active ServerGame object and client communications */
export class ServerRuleset implements Ruleset {
	public readonly class: string
	public readonly gameMode: GameMode
	public readonly category: RulesetCategory
	public readonly sortPriority: number

	public state: any
	public readonly constants: RulesetConstants

	public readonly board: RulesetBoard | null = null
	public readonly slots: ServerRulesetSlots
	public readonly chains: RulesetChain[] = []

	private readonly lifecycleCallbacks: Map<RulesetLifecycleHook, RulesetLifecycleCallback[]>

	constructor(props: ServerRulesetProps) {
		this.class = props.class
		this.gameMode = props.gameMode
		this.category = props.category
		this.sortPriority = props.sortPriority

		this.board = props.board
		this.slots = props.slots
		this.chains = props.chains

		this.lifecycleCallbacks = props.lifecycleCallbacks

		this.state = {
			...props.state,
		}

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
}

export type ServerRulesetTemplateProps = ServerRulesetBuilderProps<any> & {
	class: string
	rulesetConstants: Partial<RulesetConstants>

	board: RulesetBoard | null
	slots: ServerRulesetSlots
	chains: RulesetChain[]

	lifecycleCallbacks: Map<RulesetLifecycleHook, RulesetLifecycleCallback[]>
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

	public readonly lifecycleCallbacks: Map<RulesetLifecycleHook, RulesetLifecycleCallback[]>
	public readonly eventSubscriptions: Map<GameEventType, EventSubscription<any>[]>
	public readonly eventHooks: Map<GameHookType, EventHook<any, any>[]>
	public readonly cardSelectorBuilders: CardSelectorBuilder[] = []

	public readonly board: RulesetBoard | null = null
	public readonly slots: ServerRulesetSlots
	public readonly chains: RulesetChain[] = []

	constructor(props: ServerRulesetTemplateProps) {
		this.class = props.class
		this.gameMode = props.gameMode
		this.category = props.category
		this.sortPriority = props.sortPriority || 0

		this.state = props.state

		this.lifecycleCallbacks = props.lifecycleCallbacks
		this.eventSubscriptions = props.eventSubscriptions
		this.eventHooks = props.eventHooks
		this.cardSelectorBuilders = props.cardSelectorBuilders

		this.board = props.board
		this.slots = props.slots
		this.chains = props.chains

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
			board: this.board,
			slots: this.slots,
			chains: this.chains,
			lifecycleCallbacks: this.lifecycleCallbacks,
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
