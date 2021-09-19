/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
	pgm.db.query(`
		ALTER TABLE players ADD COLUMN "fastMode" BOOLEAN NOT NULL DEFAULT FALSE;
	`)
}

exports.down = (pgm) => {
	pgm.db.query(`
		ALTER TABLE players DROP COLUMN "fastMode";
	`)
}
