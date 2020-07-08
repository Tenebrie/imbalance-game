import express, { Request, Response } from 'express'
const router = express.Router()

import ServerPlayer from '../game/players/ServerPlayer'
import PlayerDatabase from '../database/PlayerDatabase'
import Language from '@shared/models/Language'
import UserProfileMessage from '@shared/models/network/UserProfileMessage'
import PlayerLibrary from '../game/players/PlayerLibrary'
import AsyncHandler from '../utils/AsyncHandler'
import RenderQuality from '@shared/enums/RenderQuality'

router.get('/', AsyncHandler(async(req: Request, res: Response, next) => {
	const player = req['player'] as ServerPlayer
	const playerDatabaseEntry = await PlayerDatabase.selectPlayerById(player.id)
	res.json({ data: new UserProfileMessage(playerDatabaseEntry) })
}))

router.put('/', (req: Request, res: Response, next) => {
	const player = req['player'] as ServerPlayer

	const password = req.body['password'] as string
	if (password) {
		PlayerLibrary.updatePassword(player, password).then()
	}

	const userLanguage = req.body['userLanguage'] as Language
	if (userLanguage) {
		PlayerDatabase.updatePlayerUserLanguage(player.id, userLanguage).then()
	}

	const renderQuality = req.body['renderQuality'] as RenderQuality
	if (userLanguage) {
		PlayerDatabase.updatePlayerRenderQuality(player.id, renderQuality).then()
	}

	PlayerLibrary.removeFromCache(player)

	res.status(204)
	res.send()
})

module.exports = router
