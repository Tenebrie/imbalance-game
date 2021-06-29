import Database from './Database'
import ServerGame from '@src/game/models/ServerGame'
import GameHistoryDatabaseEntry from '@shared/models/GameHistoryDatabaseEntry'
import GameErrorDatabaseEntry from '@shared/models/GameErrorDatabaseEntry'
import ServerPlayerGroup from '@src/game/players/ServerPlayerGroup'

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
					SELECT count(*)
					FROM (
						SELECT id FROM error_in_game_history WHERE "gameId" = game_history.id
					) as subplayers
				) AS "errorCount",
				(
					SELECT row_to_json(subplayers)
					FROM (
						SELECT id, username FROM players WHERE players.id = game_history."victoriousPlayer"
					) AS subplayers
				) AS "victoriousPlayer"
			FROM game_history
			WHERE id = $1;
		`
		return Database.selectRow<GameHistoryDatabaseEntry>(query, [id])
	},

	async selectGameErrors(id: string): Promise<GameErrorDatabaseEntry[] | null> {
		const query = `SELECT * FROM error_in_game_history WHERE "gameId" = $1`
		return Database.selectRows<GameErrorDatabaseEntry>(query, [id])
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
			        SELECT count(*)
			        FROM (
			            SELECT id FROM error_in_game_history WHERE "gameId" = game_history.id
					) as subplayers
				) AS "errorCount",
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
		let query = `INSERT INTO game_history (id) VALUES($1);`
		let success = await Database.insertRow(query, [game.id])
		if (!success) {
			return false
		}

		const players = game.players.filter((playerGroup) => playerGroup.isHuman)
		for (const playerGroup of players) {
			query = `INSERT INTO player_in_game_history("gameId", "playerId") VALUES($1, $2)`
			success = await Database.updateRows(query, [game.id, playerGroup.id])
			if (!success) {
				return false
			}
		}
		return true
	},

	async closeGame(game: ServerGame, reason: string, victoriousPlayer: ServerPlayerGroup | null): Promise<boolean> {
		const eventLog = JSON.stringify(game.events.eventLog)
		if (!victoriousPlayer) {
			const query = `
				UPDATE game_history
				SET
					"closedAt" = current_timestamp,
					"eventLog" = $2,
					"closeReason" = $3
				WHERE id = $1 AND "closedAt" IS NULL
			`
			return await Database.updateRows(query, [game.id, eventLog, reason])
		}
		const query = `
				UPDATE game_history
				SET
					"closedAt" = current_timestamp,
					"eventLog" = $2,
					"closeReason" = $3,
					"victoriousPlayer" = $4
				WHERE id = $1 AND "closedAt" IS NULL
			`
		return await Database.updateRows(query, [game.id, eventLog, reason, victoriousPlayer.id])
	},

	async closeAbandonedGames(): Promise<boolean> {
		const query = `
			UPDATE game_history
			SET
				"closedAt" = "startedAt",
				"eventLog" = '[]',
				"closeReason" = 'Unexpected server shutdown'
			WHERE "closedAt" IS NULL
		`
		return await Database.updateRows(query)
	},

	async pruneOldestRecords(): Promise<boolean> {
		const query = `
			DELETE FROM game_history WHERE id = ANY(
				ARRAY(
					SELECT id FROM game_history ORDER BY "startedAt" DESC OFFSET 1000
					)
				)
		`
		return await Database.deleteRows(query)
	},

	async logGameError(game: ServerGame, error: Error): Promise<boolean> {
		const query = `INSERT INTO error_in_game_history ("gameId", message, stack) VALUES($1, $2, $3);`
		return await Database.insertRow(query, [game.id, error.message, JSON.stringify(error.stack)])
	},
}
