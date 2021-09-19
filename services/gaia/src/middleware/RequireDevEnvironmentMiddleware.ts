import { genericError } from '@src/middleware/GenericErrorMiddleware'

import AsyncHandler from '../utils/AsyncHandler'

export default AsyncHandler(async (req, res, next) => {
	if (process.env.NODE_ENV !== 'development') {
		throw genericError({ status: 403, error: 'This endpoint is only available for local development setup' })
	}

	next()
})
