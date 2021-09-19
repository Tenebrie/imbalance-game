/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
	pgm.db.query(`
		ALTER TABLE player_progression ADD COLUMN "type" VARCHAR(64) NOT NULL DEFAULT 'unknown';
	`)
}

exports.down = (pgm) => {
	pgm.db.query(`
		ALTER TABLE player_progression DROP COLUMN "type";
	`)
}
