import express, { Response } from 'express'
import AsyncHandler from '@src/utils/AsyncHandler'
import RequireDevAdminAccessLevelMiddleware from '@src/middleware/RequireDevAdminAccessLevelMiddleware'

const router = express.Router()

router.use(RequireDevAdminAccessLevelMiddleware)

const multer = require('multer')
const imageUpload = multer({
	dest: 'images',
})

router.post(
	'/card/artwork',
	imageUpload.single('image'),
	AsyncHandler(async (req, res: Response) => {
		console.log(req.file)
		res.status(204).send()
	})
)

module.exports = router
