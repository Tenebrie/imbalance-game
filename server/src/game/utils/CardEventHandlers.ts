import ServerGame from '@src/game/models/ServerGame'
import GameHistoryDatabase from '@src/database/GameHistoryDatabase'

export function cardRequire(game: ServerGame, func: () => boolean): boolean {
	try {
		return func()
	} catch (error) {
		console.error("Unexpected error in card's Require:", error)
		GameHistoryDatabase.logGameError(game, error)
		return false
	}
}

export function cardPerform(game: ServerGame, func: () => void): void {
	try {
		func()
	} catch (error) {
		console.error("Unexpected error in card's Perform:", error)
		GameHistoryDatabase.logGameError(game, error)
	}
}
