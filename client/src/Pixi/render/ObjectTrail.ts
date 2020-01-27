import * as PIXI from 'pixi.js'
import TextureAtlas from '@/Pixi/render/TextureAtlas'

export default class ObjectTrail {
	rope: PIXI.SimpleRope
	points: PIXI.Point[]
	isInitialized: boolean = false

	constructor(startingPosition: PIXI.Point) {
		this.points = []
		for (let i = 0; i < 30; i++) {
			this.points.push(startingPosition.clone())
		}
		this.rope = new PIXI.SimpleRope(TextureAtlas.getTexture('effects/trail'), this.points)
		this.rope.blendMode = PIXI.BLEND_MODES.ADD
	}

	public update(currentPosition: PIXI.Point): void {
		if (!this.isInitialized) {
			this.isInitialized = true
			this.points.forEach(point => {
				point.x = currentPosition.x
				point.y = currentPosition.y
			})
			return
		}

		this.points.pop()
		this.points.unshift(currentPosition.clone())
	}

	public postDeathUpdate(): void {
		this.update(this.points[0])
	}
}
