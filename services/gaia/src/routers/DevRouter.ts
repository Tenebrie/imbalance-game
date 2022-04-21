import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardType from '@shared/enums/CardType'
import CardLibrary from '@src/game/libraries/CardLibrary'
import { genericError } from '@src/middleware/GenericErrorMiddleware'
import RequireAdminAccessLevelMiddleware from '@src/middleware/RequireAdminAccessLevelMiddleware'
import RequireDevEnvironmentMiddleware from '@src/middleware/RequireDevEnvironmentMiddleware'
import RequireOriginalPlayerTokenMiddleware from '@src/middleware/RequireOriginalPlayerTokenMiddleware'
import AsyncHandler from '@src/utils/AsyncHandler'
import { generateCardTemplate } from '@src/utils/CardTemplateGenerator'
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

router.post(
	'/cards',
	AsyncHandler(async (req, res: Response) => {
		const cardTypeParam = req.body['cardType'] as CardType | undefined
		const cardColorParam = req.body['cardColor'] as CardColor | undefined
		const cardFactionParam = req.body['cardFaction'] as CardFaction | undefined
		const cardPowerParam = req.body['cardPower'] as number | undefined
		const cardArmorParam = req.body['cardArmor'] as number | undefined
		const cardNameParam = req.body['cardName'] as string | undefined
		const cardTribesParam = req.body['cardTribes'] as string | undefined
		const cardDescriptionParam = req.body['cardDescription'] as string | undefined
		const cardFlavorParam = req.body['cardFlavor'] as string | undefined

		if (cardTypeParam === undefined) {
			throw genericError({ status: 400, error: `Missing 'cardType' parameter.` })
		}

		const missingParams = [
			cardColorParam === undefined ? 'cardColor' : undefined,
			cardFactionParam === undefined ? 'cardFaction' : undefined,
			cardNameParam === undefined ? 'cardName' : undefined,
			cardTribesParam === undefined ? 'cardTribes' : undefined,
			cardDescriptionParam === undefined ? 'cardDescription' : undefined,
			cardFlavorParam === undefined ? 'cardFlavor' : undefined,
		]

		if (cardTypeParam === CardType.UNIT) {
			if (cardPowerParam === undefined) missingParams.push('cardPower')
			if (cardArmorParam === undefined) missingParams.push('cardArmor')
		}

		const filteredMissingParams = missingParams.filter((value) => value !== undefined)
		if (filteredMissingParams.length > 0) {
			throw genericError({ status: 400, error: `Missing parameters`, data: filteredMissingParams })
		}

		const cardType = cardTypeParam as CardType
		const cardColor = cardColorParam as CardColor
		const cardFaction = cardFactionParam as CardFaction
		const cardPower = cardPowerParam || 0
		const cardArmor = cardArmorParam || 0
		const cardName = cardNameParam as string
		const cardTribes = cardTribesParam as string
		const cardDescription = cardDescriptionParam as string
		const cardFlavor = cardFlavorParam as string

		try {
			const cardClass = generateCardTemplate({
				type: cardType,
				color: cardColor,
				faction: cardFaction,
				power: cardPower,
				armor: cardArmor,
				name: cardName,
				tribes: cardTribes,
				description: cardDescription,
				flavor: cardFlavor,
			})
			res.json({
				cardId: cardClass,
			})
		} catch (error) {
			console.error(error)
			res.status(500).send()
		}
	})
)

export default router
