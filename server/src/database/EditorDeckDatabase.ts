import EditorDeck from '@shared/models/EditorDeck'
import PlayerDatabaseEntry from '@shared/models/PlayerDatabaseEntry'

import ServerPlayer from '../game/players/ServerPlayer'
import Database from './Database'

export default {
	async insertEditorDeck(owner: ServerPlayer | PlayerDatabaseEntry, deck: EditorDeck): Promise<boolean> {
		const cards = JSON.stringify(deck.cards)
		const query = `
			INSERT INTO editor_decks (id, "playerId", name, cards)
			VALUES($1, $2, $3, $4)
			ON CONFLICT(id)
			DO UPDATE
				SET name = $3, cards = $4;
		`
		return Database.insertRow(query, [deck.id, owner.id, deck.name, cards])
	},

	async selectEditorDeckById(id: string): Promise<EditorDeck | null> {
		const query = `SELECT * FROM editor_decks WHERE id = $1`
		return Database.selectRow<EditorDeck>(query, [id])
	},

	async selectEditorDeckByIdForPlayer(id: string, player: ServerPlayer): Promise<EditorDeck | null> {
		const query = `SELECT * FROM editor_decks WHERE id = $1 AND "playerId" = $2`
		return Database.selectRow<EditorDeck>(query, [id, player.id])
	},

	async selectEditorDecksForPlayer(player: ServerPlayer): Promise<EditorDeck[] | null> {
		const query = `SELECT * FROM editor_decks WHERE "playerId" = $1`
		return Database.selectRows<EditorDeck>(query, [player.id])
	},

	async deleteEditorDeck(id: string, player: ServerPlayer): Promise<boolean> {
		const query = `DELETE FROM editor_decks WHERE id = $1 AND "playerId" = $2`
		return Database.deleteRows(query, [id, player.id])
	},
}
