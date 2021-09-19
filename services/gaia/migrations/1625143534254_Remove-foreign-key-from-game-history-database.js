/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
	pgm.db.query(`
        ALTER TABLE game_history DROP CONSTRAINT fk_vict_player_id;

		CREATE TABLE victorious_player_in_game_history (
			"gameId" VARCHAR(64) NOT NULL,
			"playerId" VARCHAR(64) NOT NULL,
			CONSTRAINT fk_game
				FOREIGN KEY ("gameId")
					REFERENCES game_history (id)
					ON UPDATE CASCADE ON DELETE CASCADE,
			CONSTRAINT fk_player
				FOREIGN KEY ("playerId")
					REFERENCES players (id)
					ON UPDATE CASCADE ON DELETE CASCADE
		);
	`)
}

exports.down = (pgm) => {
	pgm.db.query(`
		ALTER TABLE game_history ADD CONSTRAINT fk_vict_player_id FOREIGN KEY ("victoriousPlayer") REFERENCES players(id) ON DELETE CASCADE ON UPDATE CASCADE;

		DROP TABLE player_in_game_history;
	`)
}
