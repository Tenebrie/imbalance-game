import Database from './Database'
import ServerPlayer from '../game/players/ServerPlayer'
import EditorDeck from '@shared/models/EditorDeck'

const memoryDeckDatabase: { player: ServerPlayer, decks: EditorDeck[] }[] = []

const autonomousDatabaseMode = {
	insert(player: ServerPlayer, id: string, deck: EditorDeck): boolean {
		const playerEntry = memoryDeckDatabase.find(entry => entry.player === player)
		if (!playerEntry) {
			memoryDeckDatabase.push({
				player: player,
				decks: [deck]
			})
		} else {
			playerEntry.decks = playerEntry.decks.filter(deck => deck.id !== id)
			playerEntry.decks.push(deck)
		}
		return true
	},

	selectById(id: string): EditorDeck | null {
		memoryDeckDatabase.forEach(entry => {
			entry.decks.forEach(deck => {
				if (deck.id === id) {
					return deck
				}
			})
		})
		return null
	},

	selectByIdForPlayer(id: string, player: ServerPlayer): EditorDeck | null {
		const playerEntry = memoryDeckDatabase.find(entry => entry.player === player)
		if (!playerEntry) {
			return null
		}
		return playerEntry.decks.find(deck => deck.id === id)
	},

	selectForPlayer(player: ServerPlayer): EditorDeck[] {
		const playerEntry = memoryDeckDatabase.find(entry => entry.player === player)
		if (!playerEntry) {
			return []
		}
		return playerEntry.decks
	},

	delete(id: string, player: ServerPlayer): boolean {
		const playerEntry = memoryDeckDatabase.find(entry => entry.player === player)
		if (!playerEntry) {
			return true
		}
		playerEntry.decks = playerEntry.decks.filter(deck => deck.id !== id)
		return true
	}
}

export default {
	async insertEditorDeck(owner: ServerPlayer, id: string, deck: EditorDeck): Promise<boolean> {
		if (Database.autonomousMode) {
			return autonomousDatabaseMode.insert(owner, id, deck)
		}

		const cards = JSON.stringify(deck.cards)
		const query = `
		INSERT INTO editor_decks (id, "playerId", name, cards)
		VALUES('${id}', '${owner.id}', '${deck.name}', '${cards}')
		ON CONFLICT(id)
		DO UPDATE
			SET name = '${deck.name}', cards = '${cards}';
		`
		return Database.insertRow(query)
	},

	async selectEditorDeckById(id: string): Promise<EditorDeck> {
		if (Database.autonomousMode) {
			return autonomousDatabaseMode.selectById(id)
		}

		const query = `SELECT * FROM editor_decks WHERE id = '${id}'`
		return Database.selectRow<EditorDeck>(query)
	},

	async selectEditorDeckByIdForPlayer(id: string, player: ServerPlayer): Promise<EditorDeck> {
		if (Database.autonomousMode) {
			return autonomousDatabaseMode.selectByIdForPlayer(id, player)
		}

		const query = `SELECT * FROM editor_decks WHERE id = '${id}' AND "playerId" = '${player.id}'`
		return Database.selectRow<EditorDeck>(query)
	},

	async selectEditorDecksForPlayer(player: ServerPlayer): Promise<EditorDeck[]> {
		if (Database.autonomousMode) {
			return autonomousDatabaseMode.selectForPlayer(player)
		}

		const query = `SELECT * FROM editor_decks WHERE "playerId" = '${player.id}'`
		return Database.selectRows<EditorDeck>(query)
	},

	async deleteEditorDeck(id: string, player: ServerPlayer): Promise<boolean> {
		if (Database.autonomousMode) {
			return autonomousDatabaseMode.delete(id, player)
		}

		const query = `DELETE FROM editor_decks WHERE id = '${id}' AND "playerId" = '${player.id}'`
		return Database.deleteRows(query)
	},
}
