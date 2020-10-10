import * as PIXI from 'pixi.js'
import Core from '@/Pixi/Core'
import RenderedProjectile from '@/Pixi/models/RenderedProjectile'
import TextureAtlas from '@/Pixi/render/TextureAtlas'
import {easeInQuad} from 'js-easing-functions'
import RenderedCard from '@/Pixi/cards/RenderedCard'
import AudioEffectCategory from '@/Pixi/audio/AudioEffectCategory'
import AudioSystem from '@/Pixi/audio/AudioSystem'

export default class ProjectileSystem {
	private projectiles: RenderedProjectile[] = []

	public tick(deltaTime: number, deltaFraction: number): void {
		const endOfLifeProjectiles = this.projectiles.filter(projectile => projectile.currentTime >= projectile.lifetime)
		endOfLifeProjectiles.forEach(projectile => {
			Core.renderer.rootContainer.removeChild(projectile.sprite)
			Core.renderer.rootContainer.removeChild(projectile.trail.rope)
		})

		this.projectiles = this.projectiles.filter(projectile => projectile.currentTime < projectile.lifetime)

		this.projectiles.forEach(projectile => {
			projectile.currentTime += deltaTime
			const targetPoint = projectile.targetCard ? projectile.targetCard.getPosition() : projectile.targetPoint!

			const currentTime = Math.min(projectile.currentTime, projectile.animationDuration)
			const timePosition = currentTime / projectile.animationDuration
			const quadOffset = (-4 * Math.pow(timePosition - 0.5, 2) + 1) * (150 + projectile.randomnessFactor * 250)

			if (projectile.startingPoint.x <= targetPoint.x) {
				targetPoint.x += quadOffset
			} else if (projectile.startingPoint.x > targetPoint.x) {
				targetPoint.x -= quadOffset
			}

			if (projectile.startingPoint.y < targetPoint.y) {
				targetPoint.y -= Math.cos(timePosition * Math.PI / 2) * (300 + projectile.randomnessFactor * 500)
			} else if (projectile.startingPoint.y >= targetPoint.y) {
				targetPoint.y += Math.cos(timePosition * Math.PI / 2) * (300 + projectile.randomnessFactor * 500)
			}

			const distanceVector = {
				x: targetPoint.x - projectile.startingPoint.x,
				y: targetPoint.y - projectile.startingPoint.y
			}

			if (projectile.currentTime < projectile.animationDuration) {
				projectile.sprite.position.x = easeInQuad(currentTime, projectile.startingPoint.x, distanceVector.x, projectile.animationDuration)
				projectile.sprite.position.y = easeInQuad(currentTime, projectile.startingPoint.y, distanceVector.y, projectile.animationDuration)
			}

			projectile.trail.update(new PIXI.Point(projectile.sprite.position.x, projectile.sprite.position.y))
			if (projectile.currentTime >= projectile.animationDuration) {
				projectile.sprite.scale.set(Math.max(0, projectile.sprite.scale.x - 1.2 * deltaFraction))
				if (!projectile.impactPerformed) {
					projectile.impactPerformed = true
					projectile.sprite.position.x = targetPoint.x
					projectile.sprite.position.y = targetPoint.y
					projectile.onImpact()
				}
			}
		})
	}

	private createAttackProjectile(sourcePosition: PIXI.Point, targetCard: RenderedCard, onImpact: () => void): RenderedProjectile {
		const sprite = new PIXI.Sprite(TextureAtlas.getTexture('effects/fireball-static'))
		sprite.zIndex = 100
		sprite.scale.set(0.4)
		sprite.anchor.set(0.5, 0.5)
		const projectile = RenderedProjectile.targetCard(sprite, sourcePosition, targetCard, 500, 1200)
		projectile.onImpact = onImpact
		projectile.trail.rope.zIndex = 99
		Core.renderer.rootContainer.addChild(projectile.sprite)
		Core.renderer.rootContainer.addChild(projectile.trail.rope)
		Core.mainHandler.projectileSystem.projectiles.push(projectile)
		AudioSystem.playEffect(AudioEffectCategory.PROJECTILE)
		return projectile
	}

	public createCardAttackProjectile(sourceCard: RenderedCard, targetCard: RenderedCard): RenderedProjectile {
		return this.createAttackProjectile(sourceCard.getPosition(), targetCard, () => {
			Core.particleSystem.createAttackImpactParticleEffect(targetCard)
			AudioSystem.playEffect(AudioEffectCategory.IMPACT_GENERIC)
		})
	}

	public createUniverseAttackProjectile(targetCard: RenderedCard): RenderedProjectile {
		return this.createAttackProjectile(new PIXI.Point(0, 0), targetCard, () => {
			Core.particleSystem.createAttackImpactParticleEffect(targetCard)
			AudioSystem.playEffect(AudioEffectCategory.IMPACT_GENERIC)
		})
	}

	public createCardAffectProjectile(sourceCard: RenderedCard, targetCard: RenderedCard): RenderedProjectile {
		return this.createAttackProjectile(sourceCard.getPosition(), targetCard, () => { /* Empty */ })
	}

	public createUniverseAffectProjectile(targetCard: RenderedCard): RenderedProjectile {
		return this.createAttackProjectile(new PIXI.Point(0, 0), targetCard, () => { /* Empty */ })
	}

	public createCardHealProjectile(sourceCard: RenderedCard, targetCard: RenderedCard): RenderedProjectile {
		return this.createAttackProjectile(sourceCard.getPosition(), targetCard, () => {
			Core.particleSystem.createHealImpactParticleEffect(targetCard)
			AudioSystem.playEffect(AudioEffectCategory.IMPACT_HEAL)
		})
	}

	public createUniverseHealProjectile(targetCard: RenderedCard): RenderedProjectile {
		return this.createAttackProjectile(new PIXI.Point(0, 0), targetCard, () => {
			Core.particleSystem.createHealImpactParticleEffect(targetCard)
			AudioSystem.playEffect(AudioEffectCategory.IMPACT_HEAL)
		})
	}
}
