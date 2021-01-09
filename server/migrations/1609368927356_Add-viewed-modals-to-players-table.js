/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
	pgm.db.query(`
		ALTER TABLE players ADD COLUMN "welcomeModalSeenAt" TIMESTAMP DEFAULT null;
		ALTER TABLE players ADD COLUMN "mobileModalSeenAt" TIMESTAMP DEFAULT null;
	`)
}

exports.down = (pgm) => {
	pgm.db.query(`
		ALTER TABLE players DROP COLUMN "welcomeModalSeenAt";
		ALTER TABLE players DROP COLUMN "mobileModalSeenAt";
	`)
}
