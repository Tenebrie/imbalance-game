import { Response } from 'express'

export default (err, req, res: Response, next) => {
	res.status(400)
	res.json({ error: err })
}
