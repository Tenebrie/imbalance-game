import { Response } from 'express'

interface ErrorJson {
	code: number | undefined,
	error: string
}

export default (err, req, res: Response, next) => {
	const statusCode = err.status || 400
	const json: ErrorJson = {
		code: err.code,
		error: typeof(err) === 'object' ? err.error : err
	}
	res.status(statusCode)
	res.json(json)
}
