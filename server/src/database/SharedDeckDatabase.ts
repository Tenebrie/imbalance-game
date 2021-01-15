import Database from './Database'
import EditorDeck from '@shared/models/EditorDeck'

export default {
	async insertSharedDeck(id: string, deck: EditorDeck): Promise<boolean> {
		const cards = JSON.stringify(deck.cards)
		const query = `
			INSERT INTO shared_decks (id, name, cards)
			VALUES($1, $2, $3)
			ON CONFLICT(id)
			DO UPDATE
				SET name = $2, cards = $3, "createdAt" = current_timestamp, "accessedAt" = current_timestamp;
		`
		return Database.insertRow(query, [id, deck.name, cards])
	},

	async updateSharedDeckTimestamp(id: string): Promise<boolean> {
		const query = `UPDATE shared_decks SET "accessedAt" = current_timestamp WHERE id = $1`
		return Database.updateRows(query, [id])
	},

	async selectSharedDeckById(id: string, newId: string): Promise<EditorDeck | null> {
		const query = `SELECT *, $2 as id FROM shared_decks WHERE id = $1`
		return Database.selectRow<EditorDeck>(query, [id, newId])
	},

	async deleteSharedDeck(id: string): Promise<boolean> {
		const query = `DELETE FROM editor_decks WHERE id = $1;`
		return Database.deleteRows(query, [id])
	},
}
