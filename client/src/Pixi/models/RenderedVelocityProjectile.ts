import * as PIXI from 'pixi.js'
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
		this.sprite = sprite
		this.trail = new ObjectTrail(new PIXI.Point(sprite.position.x, sprite.position.y))
		this.sprite.addChild(this.trail.rope)
		this.sprite.position.copyFrom(startingPoint)
		this.velocity = velocity
		this.acceleration = acceleration
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
