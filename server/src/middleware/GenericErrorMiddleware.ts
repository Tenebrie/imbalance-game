import { Request, Response } from 'express'

interface ErrorJson {
	code: number | undefined
	error: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/explicit-module-boundary-types
export default (err: any, req: Request, res: Response, next: () => void): void => {
	if (err && !err.status) {
		console.error(err)
	}

	const statusCode = err.status || 500
	const json: ErrorJson = {
		code: err.code,
		error: typeof err === 'object' ? err.error : err,
	}
	res.status(statusCode)
	res.json(json)
}
