import ServerGame from '../game/models/ServerGame'

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
