import * as PIXI from 'pixi.js'
import RenderedCard from '@/Pixi/cards/RenderedCard'
import ObjectTrail from '@/Pixi/vfx/ObjectTrail'

export default class RenderedProjectile {
	sprite: PIXI.Sprite
	trail: ObjectTrail
	startingPoint: PIXI.Point
	targetCard: RenderedCard | null
	targetPoint: PIXI.Point | null
	currentTime: number
	animationDuration: number
	lifetime: number
	randomnessFactor: number
	onImpact: () => void

	impactPerformed: boolean

	private constructor(sprite: PIXI.Sprite, startingPoint: PIXI.Point, animationDuration: number, lifetime: number) {
		this.sprite = sprite
		this.trail = new ObjectTrail(new PIXI.Point(sprite.position.x, sprite.position.y))
		this.sprite.addChild(this.trail.rope)
		this.startingPoint = startingPoint
		this.currentTime = 0
		this.animationDuration = animationDuration
		this.lifetime = lifetime
		this.randomnessFactor = Math.random()
		this.onImpact = () => { /* Empty */ }

		this.impactPerformed = false
	}

	public static inPlace(sprite: PIXI.Sprite, startingPoint: PIXI.Point, animationDuration: number, lifetime: number): RenderedProjectile {
		return new RenderedProjectile(sprite, startingPoint, animationDuration, lifetime)
	}

	public static targetCard(sprite: PIXI.Sprite, startingPoint: PIXI.Point, targetCard: RenderedCard, animationDuration: number, lifetime: number): RenderedProjectile {
		const projectile = new RenderedProjectile(sprite, startingPoint, animationDuration, lifetime)
		projectile.targetCard = targetCard
		return projectile
	}

	public static targetPoint(sprite: PIXI.Sprite, startingPoint: PIXI.Point, targetPoint: PIXI.Point, animationDuration: number, lifetime: number): RenderedProjectile {
		const projectile = new RenderedProjectile(sprite, startingPoint, animationDuration, lifetime)
		projectile.targetPoint = targetPoint
		return projectile
	}
}
