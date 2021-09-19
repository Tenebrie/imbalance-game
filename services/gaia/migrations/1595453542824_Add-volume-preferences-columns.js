/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
	pgm.db.query(`
		ALTER TABLE players ADD COLUMN "masterVolume" DECIMAL NOT NULL DEFAULT 1.0;
		ALTER TABLE players ADD COLUMN "musicVolume" DECIMAL NOT NULL DEFAULT 0.5;
		ALTER TABLE players ADD COLUMN "effectsVolume" DECIMAL NOT NULL DEFAULT 0.5;
		ALTER TABLE players ADD COLUMN "ambienceVolume" DECIMAL NOT NULL DEFAULT 0.5;
		ALTER TABLE players ADD COLUMN "userInterfaceVolume" DECIMAL NOT NULL DEFAULT 0.5;
	`)
}

exports.down = (pgm) => {
	pgm.db.query(`
		ALTER TABLE players DROP COLUMN "masterVolume";
		ALTER TABLE players DROP COLUMN "musicVolume";
		ALTER TABLE players DROP COLUMN "effectsVolume";
		ALTER TABLE players DROP COLUMN "ambienceVolume";
		ALTER TABLE players DROP COLUMN "userInterfaceVolume";
	`)
}
