import * as PIXI from 'pixi.js'
import Core from '@/Pixi/Core'
import RenderedProjectile from '@/Pixi/models/RenderedProjectile'
import RenderedCardOnBoard from '@/Pixi/board/RenderedCardOnBoard'
import TextureAtlas from '@/Pixi/render/TextureAtlas'
import { easeInQuad } from 'js-easing-functions'

export default class ProjectileSystem {
	projectiles: RenderedProjectile[] = []

	public tick(deltaTime: number, deltaFraction: number): void {
		const impactProjectiles = this.projectiles.filter(projectile => projectile.currentTime >= projectile.animationDuration)
		impactProjectiles.forEach(projectile => {
			Core.renderer.rootContainer.removeChild(projectile.sprite)
		})

		const endOfLifeProjectiles = this.projectiles.filter(projectile => projectile.currentTime >= projectile.lifetime)
		endOfLifeProjectiles.forEach(projectile => {
			Core.renderer.rootContainer.removeChild(projectile.trail.rope)
		})

		this.projectiles = this.projectiles.filter(projectile => projectile.currentTime < projectile.lifetime)

		this.projectiles.forEach(projectile => {
			projectile.currentTime += deltaTime
			let targetPoint = projectile.targetCard ? projectile.targetCard.getPosition() : projectile.targetPoint!

			const currentTime = Math.min(projectile.currentTime, projectile.animationDuration)
			const timePosition = currentTime / projectile.animationDuration
			const offsetX = (-4 * Math.pow(timePosition - 0.5, 2) + 1) * (150 + projectile.randomnessFactor * 250)
			const offsetY = offsetX

			if (projectile.startingPoint.x < targetPoint.x) {
				targetPoint.x += offsetX
			} else if (projectile.startingPoint.x > targetPoint.x) {
				targetPoint.x -= offsetX
			} else {
				const mod = Math.floor(projectile.randomnessFactor * 1000000) % 2 === 0 ? 1 : -1
				targetPoint.x += offsetX * mod
			}

			if (projectile.startingPoint.y < targetPoint.y) {
				targetPoint.y -= offsetY
			} else {
				targetPoint.y += offsetY
			}

			const distanceVector = {
				x: targetPoint.x - projectile.startingPoint.x,
				y: targetPoint.y - projectile.startingPoint.y
			}
			projectile.sprite.position.x = easeInQuad(currentTime, projectile.startingPoint.x, distanceVector.x, projectile.animationDuration)
			projectile.sprite.position.y = easeInQuad(currentTime, projectile.startingPoint.y, distanceVector.y, projectile.animationDuration)

			if (projectile.currentTime < projectile.animationDuration) {
				projectile.trail.update(new PIXI.Point(projectile.sprite.position.x, projectile.sprite.position.y))
			} else {
				projectile.trail.postDeathUpdate()
				if (!projectile.impactPerformed) {
					projectile.impactPerformed = true
					projectile.onImpact()
				}
			}
		})
	}

	public createUnitAttackProjectile(sourceUnit: RenderedCardOnBoard, targetUnit: RenderedCardOnBoard): void {
		const sprite = new PIXI.Sprite(TextureAtlas.getTexture('effects/fireball-static'))
		sprite.zIndex = 100
		sprite.scale.set(0.5)
		sprite.anchor.set(0.5)
		const projectile = RenderedProjectile.targetCard(sprite, sourceUnit.card.getPosition(), targetUnit.card, 300, 800)
		projectile.trail.rope.zIndex = 99
		projectile.onImpact = () => {
			targetUnit.card.power -= 1
		}
		Core.renderer.rootContainer.addChild(projectile.sprite)
		Core.renderer.rootContainer.addChild(projectile.trail.rope)
		Core.mainHandler.projectileSystem.projectiles.push(projectile)
	}
}
