import * as PIXI from 'pixi.js'
import RichTextBackground from '@/Pixi/render/RichTextBackground'
import TextureAtlas from '@/Pixi/render/TextureAtlas'

export default class DescriptionTextBackground extends PIXI.Container implements RichTextBackground {
	textHeight: number

	onTextRendered(position: PIXI.Point, dimensions: PIXI.Point): void {
		if (dimensions.y === this.textHeight) {
			return
		}

		this.textHeight = dimensions.y
		this.renderBackground(this.textHeight + 30)
	}

	renderBackground(height: number): void {
		while (this.children.length > 0) {
			this.removeChildAt(0)
		}

		const contextPosition = new PIXI.Point(0, 0)

		const topSection = new PIXI.Sprite(TextureAtlas.getTexture('components/bg-description-top'))
		this.addChild(topSection)
		contextPosition.y += topSection.texture.height

		while (height - contextPosition.y > 24) {
			const middleSection = new PIXI.Sprite(TextureAtlas.getTexture('components/bg-description-middle-long'))
			middleSection.position.y = contextPosition.y
			this.addChild(middleSection)
			contextPosition.y += middleSection.texture.height
		}

		while (contextPosition.y < height) {
			const middleSection = new PIXI.Sprite(TextureAtlas.getTexture('components/bg-description-middle-short'))
			middleSection.position.y = contextPosition.y
			this.addChild(middleSection)
			contextPosition.y += middleSection.texture.height
		}
		const bottomSection = new PIXI.Sprite(TextureAtlas.getTexture('components/bg-description-bottom'))
		bottomSection.position.y = contextPosition.y
		this.addChild(bottomSection)
		contextPosition.y += bottomSection.texture.height

		this.children.forEach((child) => {
			child.position.y -= contextPosition.y
		})
	}
}
