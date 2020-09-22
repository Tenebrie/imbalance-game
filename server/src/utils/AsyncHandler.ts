import {NextFunction} from 'express'

type functionType = (req: any, res: any, next: NextFunction) => Promise<void>

export default (fn: functionType) => (req: Express.Request, res: Express.Response, next: NextFunction): Promise<void> => {
	return Promise
		.resolve(fn(req, res, next))
		.catch(next)
}
