/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
	pgm.db.query(`
		ALTER TABLE game_history ADD COLUMN ruleset VARCHAR(255) NOT NULL DEFAULT 'unknown';
	`)
}

exports.down = (pgm) => {
	pgm.db.query(`
		ALTER TABLE game_history DROP COLUMN ruleset;
	`)
}
