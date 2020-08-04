/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
	pgm.db.query(`
		ALTER TABLE players ADD COLUMN "renderQuality" VARCHAR(1024) NOT NULL DEFAULT 'default';
	`)
}

exports.down = (pgm) => {
	pgm.db.query(`
		ALTER TABLE players DROP COLUMN "renderQuality";
	`)
}
