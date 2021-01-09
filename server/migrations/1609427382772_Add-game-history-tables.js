/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
	pgm.db.query(`
		CREATE TABLE game_history (
			id VARCHAR(64) NOT NULL UNIQUE,
			"startedAt" TIMESTAMP DEFAULT current_timestamp,
			"victoriousPlayer" VARCHAR(64),
			"closedAt" TIMESTAMP,
			"closeReason" TEXT,
			"eventLog" JSONB,
			CONSTRAINT fk_victoriousPlayer
				FOREIGN KEY ("victoriousPlayer")
					REFERENCES players (id)
		);

		CREATE TABLE player_in_game_history (
			"gameId" VARCHAR(64) NOT NULL,
			"playerId" VARCHAR(64) NOT NULL,
			CONSTRAINT fk_game
				FOREIGN KEY ("gameId")
					REFERENCES game_history (id),
			CONSTRAINT fk_player
				FOREIGN KEY ("playerId")
					REFERENCES players (id)
		);

		CREATE TABLE error_in_game_history (
			"gameId" VARCHAR(64) NOT NULL,
			message TEXT NOT NULL,
			stack TEXT NOT NULL,
			CONSTRAINT fk_game
				FOREIGN KEY ("gameId")
					REFERENCES game_history (id)
		);
	`)
}

exports.down = (pgm) => {
	pgm.db.query(`
		DROP TABLE error_in_game_history;
		DROP TABLE player_in_game_history;
		DROP TABLE game_history;
	`)
}
