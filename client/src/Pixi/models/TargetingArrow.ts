import * as PIXI from 'pixi.js'
import Core from '@/Pixi/Core'
import TextureAtlas from '@/Pixi/render/TextureAtlas'

export default class TargetingLine {
	arrowSprite: PIXI.Sprite

	constructor() {
		this.arrowSprite = new PIXI.Sprite(TextureAtlas.getTexture('components/overlay-move'))
		this.arrowSprite.anchor.set(0.5, 0.5)
		this.arrowSprite.position.set(-1000, -1000)
	}

	public create() {
		Core.renderer.rootContainer.addChild(this.arrowSprite)
	}

	public destroy() {
		Core.renderer.rootContainer.removeChild(this.arrowSprite)
	}
}
