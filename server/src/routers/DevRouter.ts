import fs from 'fs'
import sharp from 'sharp'
import express, { Response } from 'express'
import AsyncHandler from '@src/utils/AsyncHandler'
import RequireDevAdminAccessLevelMiddleware from '@src/middleware/RequireDevAdminAccessLevelMiddleware'
import RequireOriginalPlayerTokenMiddleware from '@src/middleware/RequireOriginalPlayerTokenMiddleware'
import CardLibrary from '@src/game/libraries/CardLibrary'

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
		const targetCardClass = req.params['cardClass']

		const targetCard = CardLibrary.cards.find((card) => card.class === targetCardClass)
		if (!targetCard) {
			throw { status: 404, error: `No card found with class ${targetCardClass}` }
		}

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

router.delete(
	'/cards/:cardClass/artwork',
	AsyncHandler(async (req, res: Response) => {
		const targetCardClass = req.params['cardClass']

		const targetCard = CardLibrary.cards.find((card) => card.class === targetCardClass)
		if (!targetCard) {
			throw { status: 404, error: `No card found with class ${targetCardClass}` }
		}

		const targetFileName = `/app/client/public/assets/cards/${targetCardClass}.webp`
		fs.unlink(targetFileName, () => {
			/* Empty */
		})
		res.status(204).send()
	})
)

module.exports = router
