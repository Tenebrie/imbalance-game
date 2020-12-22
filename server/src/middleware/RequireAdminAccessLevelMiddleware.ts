import AsyncHandler from '../utils/AsyncHandler'
import { getPlayerFromAuthenticatedRequest } from '../utils/Utils'
import AccessLevel from '@shared/enums/AccessLevel'

export default AsyncHandler(async (req, res, next) => {
	const player = getPlayerFromAuthenticatedRequest(req)
	if (player.accessLevel !== AccessLevel.ADMIN) {
		throw { status: 402, error: 'Admin access level required' }
	}

	next()
})
