import express, { Request, Response } from 'express'
const router = express.Router()

import ServerPlayer from '../game/players/ServerPlayer'
import UserProfileMessage from '@shared/models/network/UserProfileMessage'

router.get('/', (req: Request, res: Response, next) => {
	const player = req['player'] as ServerPlayer
	res.json({ data: UserProfileMessage.fromPlayerAndEmail(player.email, player.username) })
})

module.exports = router
