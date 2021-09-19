import express from 'express'
const router = express.Router()

router.get('/', (req, res) => {
	throw new Error('Boom')
	res.status(200)
	res.send('Still alive')
})

module.exports = router
