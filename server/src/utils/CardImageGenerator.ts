import fs from 'fs'
import path from 'path'
import { CanvasRenderingContext2D, createCanvas, loadImage } from 'canvas'
import CardLibrary from '../game/libraries/CardLibrary'
import createSeededRandom from 'seedrandom'
import rgb2hex from 'rgb-hex'

enum ImageMode {
	SINGLE_PATH,
	DOUBLE_PATH_SPLIT_X,
	DOUBLE_PATH_SPLIT_Y,
	TRIPLE_PATH_SPLIT,
	TRIPLE_PATH_SPLIT_REVERSE,
}

interface RenderColor {
	r: number
	g: number
	b: number
}

class CardImageGenerator {
	public generatePlaceholderImages(): void {
		const productionDir = path.join(__dirname, '../../../../client/assets/cards')
		const placeholderDir = path.join(__dirname, '../../../../client/generated/assets/cards')

		const targetCardClasses = CardLibrary.cards.filter(
			(card) => !fs.existsSync(`${productionDir}/${card.class}.png`) && !fs.existsSync(`${placeholderDir}/${card.class}.png`)
		)
		if (targetCardClasses.length === 0) {
			return
		}

		targetCardClasses.forEach((card) => {
			this.generatePlaceholderImage(card.class, card.generatedArtworkMagicString)
		})
		console.info(`Generated ${targetCardClasses.length} placeholder card image(s)`)
	}

	public generatePlaceholderImage(cardClass: string, magicString: string): void {
		const width = 408
		const height = 584
		const canvas = createCanvas(width, height)
		const ctx = canvas.getContext('2d')

		ctx.translate(0.5, 0.5)

		const filepath = path.join(__dirname, '../../../../assets/bg-clean.png')
		loadImage(filepath).then((image) => {
			ctx.drawImage(image, 0, 0, width, height)

			ctx.globalCompositeOperation = 'source-atop'
			ctx.strokeStyle = 'transparent'

			const seededRandom = createSeededRandom(`${cardClass}${magicString}`)

			const imageMode = this.getImageMode(seededRandom)

			const baseColor: RenderColor = {
				r: 20 + seededRandom() * 180,
				g: 20 + seededRandom() * 180,
				b: 20 + seededRandom() * 180,
			}

			if (imageMode === ImageMode.SINGLE_PATH) {
				this.renderSimplePath(ctx, seededRandom, baseColor, 0, 0, width, height)
			} else if (imageMode === ImageMode.DOUBLE_PATH_SPLIT_X) {
				this.renderSimplePath(ctx, seededRandom, baseColor, 0, 0, width, height / 2 + 50)
				this.renderSimplePath(ctx, seededRandom, baseColor, 0, height / 2 - 50, width, height / 2 + 50)
			} else if (imageMode === ImageMode.DOUBLE_PATH_SPLIT_Y) {
				this.renderSimplePath(ctx, seededRandom, baseColor, 0, 0, width / 2 + 30, height)
				this.renderSimplePath(ctx, seededRandom, baseColor, width / 2 - 30, 0, width / 2 + 30, height)
			} else if (imageMode === ImageMode.TRIPLE_PATH_SPLIT) {
				this.renderSimplePath(ctx, seededRandom, baseColor, 0, 0, width, height / 2 + 50)
				this.renderSimplePath(ctx, seededRandom, baseColor, 0, height / 2 - 50, width / 2 + 30, height / 2 + 50)
				this.renderSimplePath(ctx, seededRandom, baseColor, width / 2 - 30, height / 2 - 50, width / 2 + 30, height / 2 + 50)
			} else if (imageMode === ImageMode.TRIPLE_PATH_SPLIT_REVERSE) {
				this.renderSimplePath(ctx, seededRandom, baseColor, 0, height / 2 - 50, width, height / 2 + 50)
				this.renderSimplePath(ctx, seededRandom, baseColor, 0, 0, width / 2 + 30, height / 2 + 50)
				this.renderSimplePath(ctx, seededRandom, baseColor, width / 2 - 30, 0, width / 2 + 30, height / 2 + 50)
			}

			ctx.fillStyle = '#FFFFFF80'
			ctx.font = '24px Roboto'
			const textMetrics = ctx.measureText('Placeholder artwork')
			ctx.fillText('Placeholder artwork', width / 2 - textMetrics.width / 2, height / 2 - 24 / 2)

			const buffer = canvas.toBuffer('image/png')

			const dir = path.join(__dirname, '../../../../client/generated/assets/cards')
			fs.mkdirSync(dir, { recursive: true })

			fs.writeFileSync(`${dir}/${cardClass}.png`, buffer)
		})
	}

	private renderSimplePath(
		ctx: CanvasRenderingContext2D,
		seededRandom: () => number,
		baseColor: RenderColor,
		x: number,
		y: number,
		width: number,
		height: number
	): void {
		const variation = 40
		const color: RenderColor = {
			r: Math.min(255, Math.max(0, baseColor.r - variation / 2 + seededRandom() * variation)),
			g: Math.min(255, Math.max(0, baseColor.g - variation / 2 + seededRandom() * variation)),
			b: Math.min(255, Math.max(0, baseColor.b - variation / 2 + seededRandom() * variation)),
		}

		ctx.fillStyle = `#${rgb2hex(color.r, color.g, color.b)}`

		const orbCount = seededRandom() * 10 + 12

		ctx.beginPath()
		for (let i = 0; i < orbCount; i++) {
			ctx.lineTo(x + seededRandom() * width, y + seededRandom() * height)
		}
		ctx.fill()
	}

	private getImageMode(seededRandom: () => number): ImageMode {
		const imageModes = [
			{ mode: ImageMode.SINGLE_PATH, weight: 10 },
			{ mode: ImageMode.DOUBLE_PATH_SPLIT_X, weight: 7 },
			{ mode: ImageMode.DOUBLE_PATH_SPLIT_Y, weight: 7 },
			{ mode: ImageMode.TRIPLE_PATH_SPLIT, weight: 5 },
			{ mode: ImageMode.TRIPLE_PATH_SPLIT_REVERSE, weight: 5 },
		]

		const maxRoll = imageModes.reduce((total, current) => total + current.weight, 0)
		const roll = Math.floor(seededRandom() * maxRoll)

		let rollingMinValue = 0
		for (let i = 0; i < imageModes.length; i++) {
			if (roll <= rollingMinValue + imageModes[i].weight) {
				return imageModes[i].mode
			}
			rollingMinValue += imageModes[i].weight
		}
		throw new Error('Unable to roll for image mode')
	}
}

export const cardImageGenerator = new CardImageGenerator()
