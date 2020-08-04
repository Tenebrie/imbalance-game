/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = async (pgm) => {
	pgm.dropConstraint('players', 'players_username_key')

	await pgm.db.query(`
	ALTER TABLE players ADD COLUMN email VARCHAR(1024);
	UPDATE players SET "email"="username";
	`)

	pgm.createConstraint('players', 'players_email_key', {
		unique: ['email'],
	})
	pgm.alterColumn('players', 'email', {
		notNull: true
	})
}

exports.down = (pgm) => {
	pgm.createConstraint('players', 'players_username_key', {
		unique: ['username']
	})

	pgm.dropColumn('players', 'email')
}
