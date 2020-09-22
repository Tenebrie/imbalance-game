import Database from './Database'
import EditorDeck from '@shared/models/EditorDeck'

export default {
	async insertSharedDeck(id: string, deck: EditorDeck): Promise<boolean> {
		const cards = JSON.stringify(deck.cards)
		const query = `
		INSERT INTO shared_decks (id, name, cards)
		VALUES('${id}', '${deck.name}', '${cards}')
		ON CONFLICT(id)
		DO UPDATE
			SET name = '${deck.name}', cards = '${cards}', "createdAt"=current_timestamp, "accessedAt"=current_timestamp;
		`
		return Database.insertRow(query)
	},

	async updateSharedDeckTimestamp(id: string): Promise<boolean> {
		const query = `UPDATE shared_decks SET "accessedAt"=current_timestamp WHERE id=${id}`
		return Database.updateRows(query)
	},

	async selectSharedDeckById(id: string): Promise<EditorDeck | null> {
		const query = `SELECT * FROM shared_decks WHERE id = '${id}'`
		return Database.selectRow<EditorDeck>(query)
	},

	async deleteSharedDeck(id: string): Promise<boolean> {
		const query = `DELETE FROM editor_decks WHERE id = '${id}';`
		return Database.deleteRows(query)
	},
}
