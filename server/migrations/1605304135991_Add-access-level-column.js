/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
	pgm.db.query(`
		CREATE TYPE PLAYER_LEVEL AS ENUM ('disabled', 'normal', 'support', 'admin');
		ALTER TABLE players ADD COLUMN "accessLevel" PLAYER_LEVEL NOT NULL DEFAULT 'normal'; 
    `)
}

exports.down = (pgm) => {
	pgm.db.query(`
		ALTER TABLE players DROP COLUMN "accessLevel";
		DROP TYPE PLAYER_LEVEL;
	`)
}
