/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
	pgm.createTable('shared_decks', {
		id: {
			type: 'varchar(64)',
			notNull: true,
			unique: true,
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
		accessedAt: {
			type: 'timestamp',
			notNull: true,
			default: pgm.func('current_timestamp'),
		},
	})
	pgm.createIndex('shared_decks', 'id')
}

exports.down = (pgm) => {
	pgm.dropTable('shared_decks')
}
