import CardLibrary from '@src/game/libraries/CardLibrary'
import RequireAdminAccessLevelMiddleware from '@src/middleware/RequireAdminAccessLevelMiddleware'
import RequireDevEnvironmentMiddleware from '@src/middleware/RequireDevEnvironmentMiddleware'
import RequireOriginalPlayerTokenMiddleware from '@src/middleware/RequireOriginalPlayerTokenMiddleware'
import AsyncHandler from '@src/utils/AsyncHandler'
import express, { Response } from 'express'
import fs from 'fs'
import sharp from 'sharp'

const router = express.Router()

router.use(RequireOriginalPlayerTokenMiddleware)
router.use(RequireAdminAccessLevelMiddleware)
router.use(RequireDevEnvironmentMiddleware)

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
				quality: 90,
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

export default router
