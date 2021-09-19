import { ErrorJson } from '@shared/models/network/ErrorJson'
import { Request, Response } from 'express'

type ErrorData = {
	status: number
	error: string
	code?: number
	data?: Record<string, any>
}

export const genericError = (data: ErrorData): ErrorData => {
	return data
}

export default (err: ErrorData, req: Request, res: Response, _next: () => void): void => {
	if (err && (!err.status || !err.error)) {
		console.error(err)
	}

	const statusCode = err.status || 500
	const json: ErrorJson = {
		code: err.code,
		error: typeof err === 'object' ? err.error : err,
		errorData: err.data,
	}
	res.status(statusCode)
	res.json(json)
}
