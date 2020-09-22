import Database from './Database'
import ServerPlayer from '../game/players/ServerPlayer'
import EditorDeck from '@shared/models/EditorDeck'

export default {
	async insertEditorDeck(owner: ServerPlayer, id: string, deck: EditorDeck): Promise<boolean> {
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

	async selectEditorDeckById(id: string): Promise<EditorDeck | null> {
		const query = `SELECT * FROM editor_decks WHERE id = '${id}'`
		return Database.selectRow<EditorDeck>(query)
	},

	async selectEditorDeckByIdForPlayer(id: string, player: ServerPlayer): Promise<EditorDeck | null> {
		const query = `SELECT * FROM editor_decks WHERE id = '${id}' AND "playerId" = '${player.id}'`
		return Database.selectRow<EditorDeck>(query)
	},

	async selectEditorDecksForPlayer(player: ServerPlayer): Promise<EditorDeck[] | null> {
		const query = `SELECT * FROM editor_decks WHERE "playerId" = '${player.id}'`
		return Database.selectRows<EditorDeck>(query)
	},

	async deleteEditorDeck(id: string, player: ServerPlayer): Promise<boolean> {
		const query = `DELETE FROM editor_decks WHERE id = '${id}' AND "playerId" = '${player.id}'`
		return Database.deleteRows(query)
	},
}
