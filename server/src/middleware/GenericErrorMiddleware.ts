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

	let extraProperties = {}
	const filteredKeys = ['code', 'error', 'status']
	if (typeof err === 'object') {
		extraProperties = Object.keys(err)
			.filter((key) => !filteredKeys.includes(key))
			.reduce((obj: any, key) => {
				obj[key] = err[key]
				return obj
			}, {})
	}

	const statusCode = err.status || 500
	const json: ErrorJson = {
		code: err.code,
		error: typeof err === 'object' ? err.error : err,
		...extraProperties,
	}
	res.status(statusCode)
	res.json(json)
}
