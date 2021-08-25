import * as PIXI from 'pixi.js'
import RenderedCard from '@/Pixi/cards/RenderedCard'
import ObjectTrail from '@/Pixi/vfx/ObjectTrail'

export default class RenderedProjectile {
	sprite: PIXI.Sprite
	trail: ObjectTrail
	startingPoint: PIXI.Point
	targetCard: RenderedCard | null = null
	targetPoint: PIXI.Point | null = null
	targetMouse = false
	currentTime: number
	animationDuration: number
	lifetime: number
	randomnessFactor: number
	curve: number
	onImpact: () => void

	impactPerformed: boolean

	private constructor(sprite: PIXI.Sprite, startingPoint: PIXI.Point, animationDuration: number, lifetime: number, curve: number) {
		this.sprite = sprite
		this.trail = new ObjectTrail(new PIXI.Point(sprite.position.x, sprite.position.y))
		this.sprite.addChild(this.trail.rope)
		this.startingPoint = startingPoint
		this.currentTime = 0
		this.animationDuration = animationDuration
		this.lifetime = lifetime
		this.randomnessFactor = Math.random()
		this.curve = curve
		this.onImpact = () => {
			/* Empty */
		}

		this.impactPerformed = false
	}

	public static targetCard(
		sprite: PIXI.Sprite,
		startingPoint: PIXI.Point,
		targetCard: RenderedCard,
		animationDuration: number,
		lifetime: number,
		curve = 1
	): RenderedProjectile {
		const projectile = new RenderedProjectile(sprite, startingPoint, animationDuration, lifetime, curve)
		projectile.targetCard = targetCard
		return projectile
	}

	public static targetPoint(
		sprite: PIXI.Sprite,
		startingPoint: PIXI.Point,
		targetPoint: PIXI.Point,
		animationDuration: number,
		lifetime: number,
		curve = 1
	): RenderedProjectile {
		const projectile = new RenderedProjectile(sprite, startingPoint, animationDuration, lifetime, curve)
		projectile.targetPoint = targetPoint.clone()
		return projectile
	}

	public static targetMouse(
		sprite: PIXI.Sprite,
		startingPoint: PIXI.Point,
		animationDuration: number,
		lifetime: number,
		curve = 1
	): RenderedProjectile {
		const projectile = new RenderedProjectile(sprite, startingPoint, animationDuration, lifetime, curve)
		projectile.targetMouse = true
		return projectile
	}
}
