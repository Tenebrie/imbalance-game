import express from 'express'
const router = express.Router()

router.get('/', (req, res) => {
	res.status(200)
	res.send({
		version: 'v0.18',
		timestamp: '##BuildTimestamp',
	})
})

export default router
