import AccessLevel from '@shared/enums/AccessLevel'

import PlayerLibrary from '../game/players/PlayerLibrary'
import AsyncHandler from '../utils/AsyncHandler'
import { setCookie } from '../utils/Utils'

export default AsyncHandler(async (req, res, next) => {
	const token = req.cookies['playerToken']
	if (!token) {
		throw { status: 400, error: "Missing 'playerToken' cookie" }
	}

	const player = await PlayerLibrary.getPlayerByJwtToken(token)
	if (!player) {
		throw { status: 401, error: 'Token invalid' }
	}

	if (player.accessLevel === AccessLevel.DISABLED) {
		throw { status: 402, error: 'User account disabled' }
	}

	setCookie(res, 'playerToken', token)

	req['player'] = player
	next()
})
