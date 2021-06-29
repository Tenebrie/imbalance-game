import GameMode from '@shared/enums/GameMode'
import GameEventType from '@src/../../shared/src/enums/GameEventType'
import { EventHook } from '../events/EventHook'
import { EventSubscription } from '../events/EventSubscription'
import GameHookType from '../events/GameHookType'
import { CardSelectorBuilder } from '../events/selectors/CardSelectorBuilder'
import { RulesetAI } from './RulesetAI'
import Ruleset from '@shared/models/ruleset/Ruleset'
import ServerGame from '../ServerGame'
import { RulesetDeck } from './RulesetDeck'
import { CardConstructor } from '@src/game/libraries/CardLibrary'
import { RulesetBoard } from './RulesetBoard'
import { RulesetConstants } from '@shared/models/ruleset/RulesetConstants'
import BoardSplitMode from '@src/../../shared/src/enums/BoardSplitMode'
import RulesetCategory from '@src/../../shared/src/enums/RulesetCategory'
import { forEachInEnum } from '@shared/Utils'
import { RulesetChain } from '@src/game/models/rulesets/RulesetChain'
import { ServerRulesetBuilderProps } from '@src/game/models/rulesets/ServerRulesetBuilder'
import { ServerRulesetSlots, RulesetSlotsBuilder } from '@src/game/models/rulesets/ServerRulesetSlots'

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
	slots: ServerRulesetSlots | null
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

	public readonly ai: RulesetAI | null = null
	public readonly deck: RulesetDeck | null = null
	public readonly board: RulesetBoard | null = null
	public readonly slots: ServerRulesetSlots
	public readonly chains: RulesetChain[] = []

	constructor(props: ServerRulesetProps) {
		this.class = props.class
		this.gameMode = props.gameMode
		this.category = props.category
		this.sortPriority = props.sortPriority

		this.ai = props.ai
		this.deck = props.deck
		this.board = props.board
		this.chains = props.chains

		this.state = {
			...props.state,
		}

		if (props.slots) {
			this.slots = props.slots
		} else {
			this.slots = new RulesetSlotsBuilder()
				.addGroup([
					{
						type: 'player',
					},
				])
				.addGroup([
					{
						type: this.gameMode === GameMode.PVP ? 'player' : 'ai',
					},
				])
				.__build()
		}

		this.constants = {
			STARTING_PLAYER_MORALE: 2,
			UNIT_HAND_SIZE_LIMIT: 35,
			UNIT_HAND_SIZE_STARTING: 10,
			UNIT_HAND_SIZE_PER_ROUND: 5,
			SPELL_HAND_SIZE_MINIMUM: 35,
			SPELL_HAND_SIZE_LIMIT: 35,
			SPELL_MANA_PER_ROUND: 0,

			PLAYER_MOVES_FIRST: false,
			AI_MOVES_FIRST: false,

			SKIP_MULLIGAN: false,
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
	slots: ServerRulesetSlots | null
	chains: RulesetChain[]

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
	public readonly slots: ServerRulesetSlots | null = null
	public readonly chains: RulesetChain[] = []

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
		this.slots = props.slots
		this.chains = props.chains

		this.eventSubscriptions = new Map<GameEventType, EventSubscription<any>[]>()
		this.eventHooks = new Map<GameHookType, EventHook<any, any>[]>()
		forEachInEnum(GameEventType, (eventType) => this.eventSubscriptions.set(eventType, []))
		forEachInEnum(GameHookType, (hookType) => this.eventHooks.set(hookType, []))
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
			slots: this.slots,
			chains: this.chains,
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
