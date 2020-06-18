import express from 'express'
import GameLibrary from '../game/libraries/GameLibrary'
const router = express.Router()

router.get('/', (req, res, next) => {
	const games = GameLibrary.games

	const params = {
		activeGameCount: games.length,
		activePlayerCount: games.reduce((acc, game) => acc + game.players.length, 0)
	}

	res.render('status', params)
})

module.exports = router
