import { Response } from 'express'

interface ErrorJson {
	code: number | undefined,
	error: string
}

export default (err, req, res: Response, next) => {
	if (err && !err.status) {
		console.error(err)
	}

	const statusCode = err.status || 500
	const json: ErrorJson = {
		code: err.code,
		error: typeof(err) === 'object' ? err.error : err
	}
	res.status(statusCode)
	res.json(json)
}
