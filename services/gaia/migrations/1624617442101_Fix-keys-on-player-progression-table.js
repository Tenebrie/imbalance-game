/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
	pgm.db.query(`
		ALTER TABLE player_progression DROP CONSTRAINT fk_player;
		ALTER TABLE player_progression ADD CONSTRAINT fk_player FOREIGN KEY ("playerId") REFERENCES players(id) ON DELETE CASCADE ON UPDATE CASCADE;
		CREATE UNIQUE INDEX player_progression_index ON player_progression ("playerId", type);
		ALTER TABLE player_progression
			ADD CONSTRAINT player_type_unique
				UNIQUE USING INDEX player_progression_index;
	`)
}

exports.down = (pgm) => {
	pgm.db.query(`
		ALTER TABLE player_progression DROP CONSTRAINT fk_player;
		ALTER TABLE player_progression ADD CONSTRAINT fk_player FOREIGN KEY ("playerId") REFERENCES players(id);
		ALTER TABLE player_progression DROP CONSTRAINT player_type_unique;
	`)
}
