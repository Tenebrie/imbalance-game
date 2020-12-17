import AsyncHandler from '../utils/AsyncHandler'
import PlayerLibrary from '../game/players/PlayerLibrary'
import AccessLevel from '@shared/enums/AccessLevel'
import {setCookie} from '../utils/Utils'

export default AsyncHandler(async (req, res, next) => {
	const playerToken = req.cookies['playerToken']
	const originalPlayerToken = req.cookies['originalPlayerToken']

	const usedToken = playerToken || originalPlayerToken
	if (!usedToken) {
		throw { status: 400, error: 'Missing \'playerToken\' and \'originalPlayerToken\' cookies' }
	}

	const player = await PlayerLibrary.getPlayerByJwtToken(usedToken)
	if (!player) {
		throw { status: 401, error: 'Token invalid' }
	}

	if (player.accessLevel === AccessLevel.DISABLED) {
		throw { status: 402, error: 'User account disabled' }
	}

	if (playerToken) {
		setCookie(res, 'playerToken', playerToken)
	}
	if (originalPlayerToken) {
		setCookie(res, 'originalPlayerToken', originalPlayerToken)
	}

	req['player'] = player
	next()
})
