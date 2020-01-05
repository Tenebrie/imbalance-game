/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
	pgm.createTable('players', {
		id: {
			type: 'varchar(64)',
			notNull: true,
			unique: true
		},
		username: {
			type: 'varchar(1024)',
			notNull: true,
			unique: true
		},
		passwordHash: {
			type: 'varchar(1024)',
			notNull: true
		},
		createdAt: {
			type: 'timestamp',
			notNull: true,
			default: pgm.func('current_timestamp')
		}
	})
}

exports.down = (pgm) => {
	pgm.dropTable('players')
}
