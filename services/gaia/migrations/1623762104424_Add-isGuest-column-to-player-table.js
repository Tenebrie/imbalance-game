/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
	pgm.db.query(`
		ALTER TABLE players ADD COLUMN "isGuest" BOOLEAN NOT NULL DEFAULT FALSE;
	`)
}

exports.down = (pgm) => {
	pgm.db.query(`
		ALTER TABLE players DROP COLUMN "isGuest";
	`)
}
