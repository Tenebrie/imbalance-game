import * as PIXI from 'pixi.js'

import { getRenderScale } from '@/Pixi/renderer/RendererUtils'
import ObjectTrail from '@/Pixi/vfx/ObjectTrail'

export default class RenderedVelocityProjectile {
	sprite: PIXI.Sprite
	trail: ObjectTrail
	targetMouse = false
	velocity: number
	acceleration: number
	lifetime: number
	onImpact: () => void

	currentTime: number
	impactPerformed: boolean

	private constructor(sprite: PIXI.Sprite, startingPoint: PIXI.Point, velocity: number, acceleration: number, lifetime: number) {
		const scale = getRenderScale().superSamplingLevel
		this.sprite = sprite
		this.trail = new ObjectTrail(new PIXI.Point(sprite.position.x, sprite.position.y))
		this.sprite.addChild(this.trail.rope)
		this.sprite.position.copyFrom(startingPoint)
		this.velocity = velocity * scale
		this.acceleration = acceleration * scale
		this.lifetime = lifetime
		this.onImpact = () => {
			/* Empty */
		}

		this.currentTime = 0
		this.impactPerformed = false
	}

	public static targetMouse(
		sprite: PIXI.Sprite,
		startingPoint: PIXI.Point,
		velocity: number,
		acceleration: number,
		lifetime: number
	): RenderedVelocityProjectile {
		const projectile = new RenderedVelocityProjectile(sprite, startingPoint, velocity, acceleration, lifetime)
		projectile.targetMouse = true
		return projectile
	}
}
