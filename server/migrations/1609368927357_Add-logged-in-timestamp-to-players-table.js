/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
	pgm.db.query(`
		ALTER TABLE players ADD COLUMN "accessedAt" TIMESTAMP NOT NULL DEFAULT current_timestamp;
	`)
}

exports.down = (pgm) => {
	pgm.db.query(`
		ALTER TABLE players DROP COLUMN "accessedAt";
	`)
}
