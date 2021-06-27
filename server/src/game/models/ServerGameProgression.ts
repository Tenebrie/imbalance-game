import ServerGame from './ServerGame'
import { LabyrinthProgressionRunState, LabyrinthProgressionState } from '@shared/models/progression/LabyrinthProgressionState'
import RulesetCategory from '@shared/enums/RulesetCategory'
import PlayerDatabase from '@src/database/PlayerDatabase'
import ServerPlayer from '@src/game/players/ServerPlayer'
import { getLabyrinthItemSlots } from '@src/utils/Utils'
// import ItemLabyrinthRustedSword from '@src/game/cards/12-labyrinth/items/t0/ItemLabyrinthRustedSword'
// import ItemLabyrinthTatteredRags from '@src/game/cards/12-labyrinth/items/t0/ItemLabyrinthTatteredRags'
// import ItemLabyrinthOldGloves from '@src/game/cards/12-labyrinth/items/t0/ItemLabyrinthOldGloves'
// import ItemLabyrinthOldBoots from '@src/game/cards/12-labyrinth/items/t0/ItemLabyrinthOldBoots'
// import UnitLabyrinthLostArcher from '@src/game/cards/12-labyrinth/cards/UnitLabyrinthLostArcher'
// import UnitLabyrinthLostHound from '@src/game/cards/12-labyrinth/cards/UnitLabyrinthLostHound'
// import UnitLabyrinthLostMage from '@src/game/cards/12-labyrinth/cards/UnitLabyrinthLostMage'
// import UnitLabyrinthLostRaven from '@src/game/cards/12-labyrinth/cards/UnitLabyrinthLostRaven'
// import UnitLabyrinthLostRogue from '@src/game/cards/12-labyrinth/cards/UnitLabyrinthLostRogue'
// import UnitLabyrinthLostShieldbearer from '@src/game/cards/12-labyrinth/cards/UnitLabyrinthLostShieldbearer'
import CardLibrary from '@src/game/libraries/CardLibrary'
import CardFeature from '@shared/enums/CardFeature'

const CURRENT_VERSION = 2

class LabyrinthProgression {
	game: ServerGame
	private __state: LabyrinthProgressionState | null = null

	constructor(game: ServerGame) {
		this.game = game
	}

	public get isLoaded(): boolean {
		return !!this.__state
	}

	public get state(): LabyrinthProgressionState {
		if (!this.__state) {
			throw new Error('Trying to fetch Labyrinth state which is not set!')
		}
		return this.__state
	}

	private get player(): ServerPlayer {
		return this.game.getHumanPlayer().player
	}

	public async loadState(): Promise<void> {
		const player = this.game.getHumanPlayer().player
		const entry = await PlayerDatabase.selectPlayerLabyrinthProgression(player.id)
		if (!entry || entry.data.version !== CURRENT_VERSION) {
			this.__state = await LabyrinthProgression.createDefaultState(player)
			return
		}
		this.__state = entry.data
	}

	public async resetRunState(): Promise<void> {
		this.__state = {
			...this.state,
			run: LabyrinthProgression.getDefaultRunState(),
		}
		await this.save()
	}

	private static async createDefaultState(player: ServerPlayer): Promise<LabyrinthProgressionState> {
		const state: LabyrinthProgressionState = {
			version: CURRENT_VERSION,
			run: LabyrinthProgression.getDefaultRunState(),
			lastRun: null,
			meta: {
				runCount: 0,
			},
		}
		await PlayerDatabase.updatePlayerLabyrinthProgression(player.id, state)
		return state
	}

	private static getDefaultRunState(): LabyrinthProgressionRunState {
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
			encounterHistory: [],
		}
	}

	public addCardToDeck(card: string, count: number): void {
		this.state.run.cards.push({
			class: card,
			count,
		})
		this.save()
	}

	public addItemToDeck(cardClass: string): void {
		const card = CardLibrary.findPrototypeFromClass(cardClass)
		const cardSlots = getLabyrinthItemSlots(card)

		this.state.run.items = this.state.run.items.filter((oldItem) => {
			const oldItemCard = CardLibrary.findPrototypeFromClass(oldItem.cardClass)
			const oldItemSlots = getLabyrinthItemSlots(oldItemCard)
			const isBlocking = oldItemSlots.some((slot) => cardSlots.includes(slot))
			return !isBlocking
		})

		this.state.run.items.push({
			cardClass: cardClass,
		})
		this.save()
	}

	public addEncounterToHistory(encounterClass: string): void {
		this.state.run.encounterHistory.push({
			class: encounterClass,
		})
		this.save()
	}

	public failRun(): void {
		this.state.meta.runCount += 1
		this.state.lastRun = this.state.run
		this.state.run = LabyrinthProgression.getDefaultRunState()
		this.save()
	}

	private save(): Promise<boolean> {
		return PlayerDatabase.updatePlayerLabyrinthProgression(this.player.id, this.state)
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
