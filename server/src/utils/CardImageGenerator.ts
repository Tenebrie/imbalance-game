import fs from 'fs'
import path from 'path'
import { createCanvas, loadImage } from 'canvas'
import CardLibrary from '../game/libraries/CardLibrary'
import createSeededRandom from 'seedrandom'
import rgb2hex from 'rgb-hex'

class CardImageGenerator {
	public generatePlaceholderImages(): void {
		const cardClasses = CardLibrary.cards.map(card => card.class)
		const productionDir = path.join(__dirname, '../../../../client/assets/cards')
		const placeholderDir = path.join(__dirname, '../../../../client/generated/assets/cards')

		const targetCardClasses = cardClasses.filter(cardClass => !fs.existsSync(`${productionDir}/${cardClass}.png`) && !fs.existsSync(`${placeholderDir}/${cardClass}.png`))
		if (targetCardClasses.length === 0) {
			return
		}

		targetCardClasses.forEach(cardClass => {
			this.generatePlaceholderImage(cardClass)
		})
		console.info(`Generated ${targetCardClasses.length} placeholder card image(s)`)
	}

	public generatePlaceholderImage(cardClass: string): void {
		const width = 408
		const height = 584
		const canvas = createCanvas(width, height)
		const ctx = canvas.getContext('2d')

		ctx.translate(0.5, 0.5)

		const filepath = path.join(__dirname, '../../../../assets/bg-clean.png')
		loadImage(filepath).then(image => {
			ctx.drawImage(image, 0, 0, width, height)

			ctx.globalCompositeOperation = 'source-atop'
			ctx.strokeStyle = 'transparent'

			const seededRandom = createSeededRandom(cardClass)
			const baseColor = {
				r: seededRandom() * 255,
				g: seededRandom() * 255,
				b: seededRandom() * 255
			}

			ctx.fillStyle = `#${rgb2hex(baseColor.r, baseColor.g, baseColor.b)}`

			const orbCount = seededRandom() * 20 + 20

			ctx.beginPath()
			for (let i = 0; i < orbCount; i++) {
				ctx.lineTo(seededRandom() * width, seededRandom() * height)
			}
			ctx.fill() 

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
}

export const cardImageGenerator = new CardImageGenerator()
