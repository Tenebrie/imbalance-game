import RulesetCategory from '@shared/enums/RulesetCategory'
import HiddenPlayerMessage from '@shared/models/network/player/HiddenPlayerMessage'
import {
	RitesPlayerCharacter,
	RitesProgressionRunState,
	RitesProgressionRunStatePlayer,
	RitesProgressionState,
} from '@shared/models/progression/RitesProgressionState'
import PlayerDatabase from '@src/database/PlayerDatabase'
import CardLibrary from '@src/game/libraries/CardLibrary'
import { RulesetConstructor } from '@src/game/libraries/RulesetLibrary'
import ServerPlayer from '@src/game/players/ServerPlayer'
import { getClassFromConstructor, getLabyrinthItemSlots } from '@src/utils/Utils'

import ServerGame from './ServerGame'

const CURRENT_VERSION = 7

export class RitesProgression {
	game: ServerGame
	private internalState: RitesProgressionState | null = null

	constructor(game: ServerGame) {
		this.game = game
	}

	public get isLoaded(): boolean {
		return !!this.internalState
	}

	public get state(): RitesProgressionState {
		if (!this.internalState) {
			throw new Error('Trying to fetch Rites state which is not set!')
		}
		return this.internalState
	}

	private get player(): ServerPlayer {
		if (!this.game.owner) {
			throw new Error('Trying to fetch state in a public game!')
		}
		return this.game.owner
	}

	public async loadState(): Promise<void> {
		this.internalState = await RitesProgression.loadStateForPlayer(this.player)
	}

	public async saveState(): Promise<boolean> {
		return await RitesProgression.saveStateForPlayer(this.player, this.state)
	}

	public async resetRunState(): Promise<void> {
		this.internalState = {
			...this.state,
			run: RitesProgression.getDefaultRunState(this.player),
		}
	}

	public setExpectedPlayers(playerCount: number): void {
		this.state.run.playersExpected = playerCount
	}

	public addPlayer(player: ServerPlayer): void {
		this.state.run.players.push(new HiddenPlayerMessage(player))
		this.state.run.playerStates[player.id] = RitesProgression.getDefaultPlayerState()
	}

	public saveCharacter(character: RitesPlayerCharacter): void {
		this.state.meta.character = character
	}

	public addCardToDeck(player: ServerPlayer, card: string, count: number): void {
		this.state.run.playerStates[player.id].cards.push({
			class: card,
			count,
		})
	}

	public addItemToDeck(player: ServerPlayer, cardClass: string): void {
		const card = CardLibrary.findPrototypeFromClass(cardClass)
		const cardSlots = getLabyrinthItemSlots(card)

		this.state.run.playerStates[player.id].items = this.state.run.playerStates[player.id].items.filter((oldItem) => {
			const oldItemCard = CardLibrary.findPrototypeFromClass(oldItem.cardClass)
			const oldItemSlots = getLabyrinthItemSlots(oldItemCard)
			const isBlocking = oldItemSlots.some((slot) => cardSlots.includes(slot))
			return !isBlocking
		})

		this.state.run.playerStates[player.id].items.push({
			cardClass: cardClass,
		})
	}

	public addEncounterToHistory(encounterClass: string): void {
		this.state.run.encounterHistory.push({
			class: encounterClass,
		})
	}

	public popEncounterFromDeck(): void {
		this.state.run.encounterDeck.shift()
	}

	public failRun(): void {
		this.state.meta.runCount += 1
		this.state.lastRun = this.state.run
		this.state.run = RitesProgression.getDefaultRunState(this.player)
	}

	public static async loadStateForPlayer(player: ServerPlayer): Promise<RitesProgressionState> {
		const entry = await PlayerDatabase.selectPlayerLabyrinthProgression(player.id)
		if (!entry || entry.data.version !== CURRENT_VERSION) {
			return RitesProgression.getDefaultState(player)
		}
		return entry.data
	}

	public static async saveStateForPlayer(player: ServerPlayer, state: RitesProgressionState): Promise<boolean> {
		return await PlayerDatabase.updatePlayerLabyrinthProgression(player.id, state)
	}

	public static async resetRunStateForPlayer(player: ServerPlayer): Promise<boolean> {
		const state = await RitesProgression.loadStateForPlayer(player)
		return await PlayerDatabase.updatePlayerLabyrinthProgression(player.id, {
			...state,
			lastRun: state.run,
			meta: {
				...state.meta,
				runCount: state.meta.runCount + 1,
			},
			run: RitesProgression.getDefaultRunState(player),
		})
	}

	private static getDefaultState(player: ServerPlayer): RitesProgressionState {
		return {
			version: CURRENT_VERSION,
			run: this.getDefaultRunState(player),
			lastRun: null,
			meta: {
				runCount: 0,
				character: {
					body: 'humanoid',
					heritage: 'mundane',
					appearance: 'ambigous',
					personality: {
						brave: 0,
						charming: 0,
						honorable: 0,
						nihilistic: 0,
					},
				},
			},
		}
	}

	private static getDefaultRunState(player: ServerPlayer): RitesProgressionRunState {
		const RitesEncounters = require('../../game/rulesets/rites/service/RitesEncounters')

		return {
			playersExpected: 1,
			players: [new HiddenPlayerMessage(player)],
			playerStates: {
				[player.id]: this.getDefaultPlayerState(),
			},
			encounterDeck: RitesEncounters.getRitesEncounterDeck().map((ruleset: RulesetConstructor) => ({
				class: getClassFromConstructor(ruleset),
			})),
			encounterHistory: [],
		}
	}

	private static getDefaultPlayerState(): RitesProgressionRunStatePlayer {
		return {
			cards: [],
			items: [],
		}
	}
}

export default class ServerGameProgression {
	game: ServerGame
	rites: RitesProgression

	constructor(game: ServerGame) {
		this.game = game
		this.rites = new RitesProgression(game)
	}

	public async loadStates(): Promise<void> {
		if (this.game.ruleset.category === RulesetCategory.RITES) {
			await this.rites.loadState()
		}
	}

	public async saveStates(): Promise<void> {
		if (this.game.ruleset.category === RulesetCategory.RITES) {
			await this.rites.saveState()
		}
	}
}
