/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
	pgm.db.query(`
		ALTER TABLE editor_decks DROP CONSTRAINT "fkPlayerId";
		ALTER TABLE game_history DROP CONSTRAINT fk_victoriousplayer;
		ALTER TABLE player_in_game_history DROP CONSTRAINT fk_game;
		ALTER TABLE player_in_game_history DROP CONSTRAINT fk_player;
		ALTER TABLE error_in_game_history DROP CONSTRAINT fk_game;

		ALTER TABLE editor_decks ADD CONSTRAINT fk_player_id FOREIGN KEY ("playerId") REFERENCES players(id) ON DELETE CASCADE ON UPDATE CASCADE;
		ALTER TABLE game_history ADD CONSTRAINT fk_vict_player_id FOREIGN KEY ("victoriousPlayer") REFERENCES players(id) ON DELETE CASCADE ON UPDATE CASCADE;
		ALTER TABLE player_in_game_history ADD CONSTRAINT fk_game_id FOREIGN KEY ("gameId") REFERENCES game_history(id) ON DELETE CASCADE ON UPDATE CASCADE;
		ALTER TABLE player_in_game_history ADD CONSTRAINT fk_player_id FOREIGN KEY ("playerId") REFERENCES players(id) ON DELETE CASCADE ON UPDATE CASCADE;
		ALTER TABLE error_in_game_history ADD CONSTRAINT fk_game FOREIGN KEY ("gameId") REFERENCES game_history(id) ON DELETE CASCADE ON UPDATE CASCADE;

		UPDATE game_history SET id = substr(id, 5) WHERE starts_with(id, 'game:');

		UPDATE players SET id = concat('player:', id);
		UPDATE game_history SET id = concat('game:', id);
		UPDATE editor_decks SET id = concat('deck:', id);
		UPDATE shared_decks SET id = concat('share:', id);
    `)
}

exports.down = (pgm) => {
	pgm.db.query(`
		UPDATE players SET id = substr(id, 7);
		UPDATE game_history SET id = substr(id, 5);
		UPDATE editor_decks SET id = substr(id, 5);
		UPDATE shared_decks SET id = concat(id, 5);

		ALTER TABLE editor_decks DROP CONSTRAINT fk_player_id;
		ALTER TABLE game_history DROP CONSTRAINT fk_vict_player_id;
		ALTER TABLE player_in_game_history DROP CONSTRAINT fk_game_id;
		ALTER TABLE player_in_game_history DROP CONSTRAINT fk_player_id;
		ALTER TABLE error_in_game_history DROP CONSTRAINT fk_game;

		ALTER TABLE editor_decks ADD CONSTRAINT "fkPlayerId" FOREIGN KEY ("playerId") REFERENCES players(id);
		ALTER TABLE game_history ADD CONSTRAINT fk_victoriousplayer FOREIGN KEY ("victoriousPlayer") REFERENCES players(id);
		ALTER TABLE player_in_game_history ADD CONSTRAINT fk_game FOREIGN KEY ("gameId") REFERENCES game_history(id);
		ALTER TABLE player_in_game_history ADD CONSTRAINT fk_player FOREIGN KEY ("playerId") REFERENCES players(id);
		ALTER TABLE error_in_game_history ADD CONSTRAINT fk_game FOREIGN KEY ("gameId") REFERENCES game_history(id);
	`)
}
