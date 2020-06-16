import express from 'express'
const router = express.Router()

router.get('/', (req, res, next) => {
	const games = global.gameLibrary.games

	const params = {
		activeGameCount: games.length,
		activePlayerCount: games.reduce((acc, game) => acc + game.players.length, 0)
	}

	res.render('status', params)
})

module.exports = router
