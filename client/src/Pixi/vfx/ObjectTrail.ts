import * as PIXI from 'pixi.js'

import TextureAtlas from '@/Pixi/render/TextureAtlas'
import { getRenderScale } from '@/Pixi/renderer/RendererUtils'

export default class ObjectTrail {
	public readonly rope: PIXI.SimpleRope
	private readonly points: PIXI.Point[]
	private isInitialized = false

	public constructor(startingPosition: PIXI.Point) {
		this.points = []
		for (let i = 0; i < 50; i++) {
			this.points.push(startingPosition.clone())
		}
		const scale = getRenderScale().superSamplingLevel
		const texture = scale >= 2 ? 'trail-large' : 'trail-normal'
		this.rope = new PIXI.SimpleRope(TextureAtlas.getTexture(`effects/${texture}`), this.points)
		this.rope.blendMode = PIXI.BLEND_MODES.ADD
	}

	public update(currentPosition: PIXI.Point): void {
		if (!this.isInitialized) {
			this.isInitialized = true
			this.points.forEach((point) => {
				point.x = currentPosition.x
				point.y = currentPosition.y
			})
			return
		}

		this.points.pop()
		this.points.unshift(currentPosition.clone())
	}
}
