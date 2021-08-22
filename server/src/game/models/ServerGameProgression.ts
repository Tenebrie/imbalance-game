import ServerGame from './ServerGame'
import {
	LabyrinthProgressionRunState,
	LabyrinthProgressionRunStatePlayer,
	LabyrinthProgressionState,
} from '@shared/models/progression/LabyrinthProgressionState'
import RulesetCategory from '@shared/enums/RulesetCategory'
import PlayerDatabase from '@src/database/PlayerDatabase'
import ServerPlayer from '@src/game/players/ServerPlayer'
import { getLabyrinthItemSlots } from '@src/utils/Utils'
import CardLibrary from '@src/game/libraries/CardLibrary'
import CardFeature from '@shared/enums/CardFeature'
import HiddenPlayerMessage from '@shared/models/network/player/HiddenPlayerMessage'

const CURRENT_VERSION = 3

class LabyrinthProgression {
	game: ServerGame
	private internalState: LabyrinthProgressionState | null = null

	constructor(game: ServerGame) {
		this.game = game
	}

	public get isLoaded(): boolean {
		return !!this.internalState
	}

	public get state(): LabyrinthProgressionState {
		if (!this.internalState) {
			throw new Error('Trying to fetch Labyrinth state which is not set!')
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
		const player = this.player
		const entry = await PlayerDatabase.selectPlayerLabyrinthProgression(player.id)
		if (!entry || entry.data.version !== CURRENT_VERSION) {
			this.internalState = this.createDefaultState()
			await this.save()
			return
		}
		this.internalState = entry.data
	}

	public async resetRunState(): Promise<void> {
		this.internalState = {
			...this.state,
			run: this.getDefaultRunState(),
		}
		await this.save()
	}

	private createDefaultState(): LabyrinthProgressionState {
		return {
			version: CURRENT_VERSION,
			run: this.getDefaultRunState(),
			lastRun: null,
			meta: {
				runCount: 0,
			},
		}
	}

	private getDefaultRunState(): LabyrinthProgressionRunState {
		const player = this.player
		return {
			playersExpected: 1,
			players: [new HiddenPlayerMessage(player)],
			playerStates: {
				[player.id]: this.getDefaultPlayerState(),
			},
			encounterHistory: [],
		}
	}

	private getDefaultPlayerState(): LabyrinthProgressionRunStatePlayer {
		return {
			cards: [
				{
					class: 'unitLabyrinthLostArcher',
					count: 3,
				},
				{
					class: 'unitLabyrinthLostHound',
					count: 3,
				},
				{
					class: 'unitLabyrinthLostMage',
					count: 2,
				},
				{
					class: 'unitLabyrinthLostRaven',
					count: 2,
				},
				{
					class: 'unitLabyrinthLostRogue',
					count: 3,
				},
				{
					class: 'unitLabyrinthLostShieldbearer',
					count: 3,
				},
			],
			items: CardLibrary.cards
				.filter((card) => card.features.includes(CardFeature.LABYRINTH_ITEM_T0))
				.map((card) => ({
					cardClass: card.class,
				})),
		}
	}

	public setExpectedPlayers(playerCount: number): void {
		this.state.run.playersExpected = playerCount
		this.saveInBackground()
	}

	public addPlayer(player: ServerPlayer): void {
		this.state.run.players.push(new HiddenPlayerMessage(player))
		this.state.run.playerStates[player.id] = this.getDefaultPlayerState()
		this.saveInBackground()
	}

	public addCardToDeck(player: ServerPlayer, card: string, count: number): void {
		this.state.run.playerStates[player.id].cards.push({
			class: card,
			count,
		})
		this.saveInBackground()
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
		this.saveInBackground()
	}

	public addEncounterToHistory(encounterClass: string): Promise<boolean> {
		this.state.run.encounterHistory.push({
			class: encounterClass,
		})
		console.log(`Pushing new encounter. New length: ${this.state.run.encounterHistory.length}`)
		return this.save()
	}

	public failRun(): Promise<boolean> {
		this.state.meta.runCount += 1
		this.state.lastRun = this.state.run
		this.state.run = this.getDefaultRunState()
		return this.save()
	}

	private save(): Promise<boolean> {
		console.log('Saving', this.state)
		console.log('', new Error())
		return PlayerDatabase.updatePlayerLabyrinthProgression(this.player.id, this.state)
	}

	private saveInBackground(): void {
		this.save().then()
	}
}

export default class ServerGameProgression {
	game: ServerGame
	labyrinth: LabyrinthProgression

	constructor(game: ServerGame) {
		this.game = game
		this.labyrinth = new LabyrinthProgression(game)
	}

	public async loadStates(): Promise<void> {
		if (this.game.ruleset.category === RulesetCategory.LABYRINTH) {
			await this.labyrinth.loadState()
		}
	}
}
