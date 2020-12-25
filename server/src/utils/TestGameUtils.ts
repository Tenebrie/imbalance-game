import ServerGame from '../game/models/ServerGame'

export const startNextTurn = (game: ServerGame) => (): void => {
	game.players[0].endTurn()
	game.advanceCurrentTurn()
	game.players[1].endTurn()
	game.advanceCurrentTurn()
	game.events.resolveEvents()
	game.events.evaluateSelectors()
}

export const startNextRound = (game: ServerGame) => (): void => {
	game.players[0].endRound()
	game.players[1].endRound()
	game.advanceCurrentTurn()
	game.players[0].finishMulligan()
	game.players[1].finishMulligan()
	game.advanceMulliganPhase()
	game.events.resolveEvents()
	game.events.evaluateSelectors()
}

export const playerAction = (game: ServerGame) => (callback: () => void): void => {
	callback()
	game.events.resolveEvents()
	game.events.evaluateSelectors()
}
