exports.shorthands = undefined

exports.up = (pgm) => {
	pgm.createIndex('players', 'id')
	pgm.createIndex('players', 'username')
	pgm.createConstraint('editor_decks', 'fkPlayerId', 'FOREIGN KEY ("playerId") REFERENCES players(id) MATCH FULL ON DELETE CASCADE')
}

exports.down = (pgm) => {
	pgm.dropIndex('players', 'id')
	pgm.dropIndex('players', 'username')
	pgm.dropConstraint('editor_decks', 'fkPlayerId')
}
