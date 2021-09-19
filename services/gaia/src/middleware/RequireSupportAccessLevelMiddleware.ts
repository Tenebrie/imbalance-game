import AccessLevel from '@shared/enums/AccessLevel'

import AsyncHandler from '../utils/AsyncHandler'
import { getPlayerFromAuthenticatedRequest } from '../utils/Utils'

export default AsyncHandler(async (req, res, next) => {
	const player = getPlayerFromAuthenticatedRequest(req)
	if (player.accessLevel !== AccessLevel.ADMIN && player.accessLevel !== AccessLevel.SUPPORT) {
		throw { status: 402, error: 'Admin or support access level required' }
	}

	next()
})
