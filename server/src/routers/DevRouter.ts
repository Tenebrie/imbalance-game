import fs from 'fs'
import sharp from 'sharp'
import express, { Response } from 'express'
import AsyncHandler from '@src/utils/AsyncHandler'
import RequireDevAdminAccessLevelMiddleware from '@src/middleware/RequireDevAdminAccessLevelMiddleware'
import RequireOriginalPlayerTokenMiddleware from '@src/middleware/RequireOriginalPlayerTokenMiddleware'

const router = express.Router()

router.use(RequireOriginalPlayerTokenMiddleware)
router.use(RequireDevAdminAccessLevelMiddleware)

const multer = require('multer')
const imageUpload = multer({
	dest: 'upload/images/cards',
})

router.put(
	'/cards/:cardClass/artwork',
	imageUpload.single('image'),
	AsyncHandler(async (req, res: Response) => {
		console.log(req.file)

		const targetCardClass = req.params['cardClass']
		const targetFileName = `/app/client/public/assets/cards/${targetCardClass}.webp`
		await sharp(req.file.path)
			.webp({
				quality: 80,
			})
			.toFile(targetFileName)

		fs.unlink(req.file.path, () => {
			/* Empty */
		})
		res.status(204).send()
	})
)

module.exports = router
