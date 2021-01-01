import Database from './Database'
import ServerGame from '@src/game/models/ServerGame'
import ServerPlayerInGame from '@src/game/players/ServerPlayerInGame'
import ServerBotPlayerInGame from '@src/game/AI/ServerBotPlayerInGame'
import GameHistoryDatabaseEntry from '@shared/models/GameHistoryDatabaseEntry'

export default {
	async selectGameById(id: string): Promise<GameHistoryDatabaseEntry | null> {
		const query = `
			SELECT *,
				array(
					SELECT row_to_json(subplayers)
					FROM (
						SELECT id, username FROM players WHERE players.id = ANY(
							array(
								SELECT "playerId"
								FROM player_in_game_history
								WHERE player_in_game_history."gameId" = game_history.id
							)
						)
					) AS subplayers
				) AS players,
				(
					SELECT row_to_json(subplayers)
					FROM (
						SELECT id, username FROM players WHERE players.id = game_history."victoriousPlayer"
					) AS subplayers
				) AS "victoriousPlayer"
			FROM game_history
			WHERE id = '${id}';
		`
		return Database.selectRow<GameHistoryDatabaseEntry>(query)
	},

	async selectAllGames(): Promise<GameHistoryDatabaseEntry[] | null> {
		const query = `
			SELECT *,
				array(
					SELECT row_to_json(subplayers)
					FROM (
						SELECT id, username FROM players WHERE players.id = ANY(
							array(
								SELECT "playerId"
								FROM player_in_game_history
								WHERE player_in_game_history."gameId" = game_history.id
							)
						)
					) AS subplayers
				) AS players,
				(
					SELECT row_to_json(subplayers)
					FROM (
						SELECT id, username FROM players WHERE players.id = game_history."victoriousPlayer"
					) AS subplayers
				) AS "victoriousPlayer"
			FROM game_history
			ORDER BY "startedAt" DESC
			LIMIT 500;
		`
		return Database.selectRows<GameHistoryDatabaseEntry>(query)
	},

	async startGame(game: ServerGame): Promise<boolean> {
		let query = `INSERT INTO game_history (id) VALUES('${game.id}');`
		let success = await Database.insertRow(query)
		if (!success) {
			return false
		}

		const players = game.players.filter((playerInGame) => !(playerInGame instanceof ServerBotPlayerInGame))
		for (const playerInGame of players) {
			query = `INSERT INTO player_in_game_history("gameId", "playerId") VALUES('${game.id}', '${playerInGame.player.id}')`
			success = await Database.updateRows(query)
			if (!success) {
				return false
			}
		}
		return true
	},

	async closeGame(game: ServerGame, reason: string, victoriousPlayer: ServerPlayerInGame | null): Promise<boolean> {
		const query = `
			UPDATE game_history
			SET
				"closedAt" = current_timestamp,
				"eventLog" = '${JSON.stringify(game.events.eventLog)}',
				"closeReason" = '${reason}'
				${victoriousPlayer ? `,"victoriousPlayer" = '${victoriousPlayer.player.id}'` : ''}
			WHERE id = '${game.id}'
		`
		return await Database.updateRows(query)
	},

	async closeAbandonedGames(): Promise<boolean> {
		const query = `
			UPDATE game_history
			SET
				"closedAt" = "startedAt",
				"eventLog" = '[]',
				"closeReason" = 'Abandoned game cleanup'
			WHERE "closedAt" is NULL
		`
		return await Database.updateRows(query)
	},

	async logGameError(game: ServerGame, error: Error): Promise<boolean> {
		const query = `INSERT INTO error_in_game_history ("gameId", message, stack) VALUES('${game.id}', '${error.message}', '${JSON.stringify(
			error.stack
		)}');`
		return await Database.insertRow(query)
	},
}
