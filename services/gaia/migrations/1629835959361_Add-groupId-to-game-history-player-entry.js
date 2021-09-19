/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
	pgm.db.query(`
		ALTER TABLE player_in_game_history ADD COLUMN "groupId" VARCHAR(64) NOT NULL DEFAULT '';
	`)
}

exports.down = (pgm) => {
	pgm.db.query(`
		ALTER TABLE player_in_game_history DROP COLUMN "groupId";
	`)
}
