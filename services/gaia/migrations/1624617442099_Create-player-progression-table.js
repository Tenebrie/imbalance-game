/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
	pgm.db.query(`
		CREATE TABLE player_progression (
			"playerId" VARCHAR(64) NOT NULL,
            "data" jsonb NOT NULL,
			CONSTRAINT fk_player
				FOREIGN KEY ("playerId")
					REFERENCES players (id)
		);
	`)
}

exports.down = (pgm) => {
	pgm.db.query(`
		DROP TABLE player_progression;
	`)
}
