exports.shorthands = undefined

exports.up = (pgm) => {
	pgm.createTable('editor_decks', {
		id: {
			type: 'varchar(64)',
			notNull: true,
			unique: true,
		},
		playerId: {
			type: 'varchar(64)',
			notNull: true,
		},
		name: {
			type: 'varchar(255)',
			notNull: true,
		},
		cards: {
			type: 'jsonb',
			notNull: true,
		},
		createdAt: {
			type: 'timestamp',
			notNull: true,
			default: pgm.func('current_timestamp'),
		},
	})
	pgm.createIndex('editor_decks', 'id')
}

exports.down = (pgm) => {
	pgm.dropTable('editor_decks')
}
