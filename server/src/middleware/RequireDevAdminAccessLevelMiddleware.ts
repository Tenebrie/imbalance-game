import AccessLevel from '@shared/enums/AccessLevel'

import AsyncHandler from '../utils/AsyncHandler'
import { getPlayerFromAuthenticatedRequest } from '../utils/Utils'

export default AsyncHandler(async (req, res, next) => {
	const player = getPlayerFromAuthenticatedRequest(req)
	if (player.accessLevel !== AccessLevel.DEVELOPER) {
		throw { status: 402, error: 'Developer access level required' }
	}
	if (process.env.NODE_ENV !== 'development') {
		throw { status: 403, error: 'This endpoint is only available for local development setup' }
	}

	next()
})
