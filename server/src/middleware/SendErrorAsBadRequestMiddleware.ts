import {Request, Response} from 'express'

export default (err: any, req: Request, res: Response) => {
	res.status(400)
	res.json({ error: err })
}
