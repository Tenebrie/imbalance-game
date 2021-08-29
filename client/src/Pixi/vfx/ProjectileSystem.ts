import { easeInQuad } from 'js-easing-functions'
import * as PIXI from 'pixi.js'

import AudioEffectCategory from '@/Pixi/audio/AudioEffectCategory'
import AudioSystem from '@/Pixi/audio/AudioSystem'
import RenderedCard from '@/Pixi/cards/RenderedCard'
import RenderedGameBoardRow from '@/Pixi/cards/RenderedGameBoardRow'
import Core from '@/Pixi/Core'
import RenderedProjectile from '@/Pixi/models/RenderedProjectile'
import RenderedVelocityProjectile from '@/Pixi/models/RenderedVelocityProjectile'
import TextureAtlas from '@/Pixi/render/TextureAtlas'
import { getRenderScale } from '@/Pixi/renderer/RendererUtils'
import Utils, { getAnimDurationMod, getDistance } from '@/utils/Utils'
import store from '@/Vue/store'

export default class ProjectileSystem {
	private projectiles: RenderedProjectile[] = []
	private velocityProjectiles: RenderedVelocityProjectile[] = []

	public tick(deltaTime: number, deltaFraction: number): void {
		// Eased projectiles
		this.projectiles = this.filterEndOfLifeProjectiles(this.projectiles)

		this.projectiles.forEach((projectile) => {
			projectile.currentTime += deltaTime
			const targetPoint = projectile.targetCard
				? projectile.targetCard.getPosition()
				: projectile.targetMouse
				? Core.input.mousePosition.clone()
				: projectile.targetPoint
				? projectile.targetPoint.clone()
				: new PIXI.Point(0, 0)

			const currentTime = Math.min(projectile.currentTime, projectile.animationDuration)
			const timePosition = currentTime / projectile.animationDuration
			const quadOffset = projectile.curve * (-4 * Math.pow(timePosition - 0.5, 2) + 1) * (350 + projectile.randomnessFactor * 50)

			if (projectile.startingPoint.x <= targetPoint.x) {
				targetPoint.x += quadOffset
			} else if (projectile.startingPoint.x > targetPoint.x) {
				targetPoint.x -= quadOffset
			}

			if (projectile.startingPoint.y < targetPoint.y) {
				targetPoint.y -= Math.cos((timePosition * Math.PI) / 2) * (300 + projectile.randomnessFactor * 500) * projectile.curve
			} else if (projectile.startingPoint.y >= targetPoint.y) {
				targetPoint.y += Math.cos((timePosition * Math.PI) / 2) * (300 + projectile.randomnessFactor * 500) * projectile.curve
			}

			const distanceVector = {
				x: targetPoint.x - projectile.startingPoint.x,
				y: targetPoint.y - projectile.startingPoint.y,
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

		// Velocity projectiles
		this.velocityProjectiles = this.filterEndOfLifeProjectiles(this.velocityProjectiles)

		this.velocityProjectiles.forEach((projectile) => {
			projectile.currentTime += deltaTime

			const position = projectile.sprite.position
			const targetPosition = projectile.impactPerformed ? position : Core.input.mousePosition.clone()

			projectile.velocity = Math.max(0, projectile.velocity + projectile.acceleration * deltaFraction)
			if (getDistance(projectile.sprite.position, targetPosition) <= projectile.velocity * deltaFraction) {
				projectile.sprite.scale.set(Math.max(0, projectile.sprite.scale.x - 1.2 * deltaFraction))
				if (!projectile.impactPerformed) {
					projectile.impactPerformed = true
					projectile.onImpact()
					projectile.sprite.position.x = targetPosition.x
					projectile.sprite.position.y = targetPosition.y
				}
			} else {
				const angle = Utils.getVectorAngleAsRadians({
					x: targetPosition.x - position.x,
					y: targetPosition.y - position.y,
				})

				const newPosition = Utils.getPointWithOffset(position, angle, projectile.velocity * deltaFraction)
				projectile.sprite.position.copyFrom(newPosition)
			}
			projectile.trail.update(new PIXI.Point(projectile.sprite.position.x, projectile.sprite.position.y))
		})
	}

	private filterEndOfLifeProjectiles<T extends RenderedProjectile | RenderedVelocityProjectile>(targetArray: T[]): T[] {
		const endOfLifeProjectiles = targetArray.filter((projectile) => projectile.currentTime >= projectile.lifetime)
		endOfLifeProjectiles.forEach((projectile) => {
			Core.renderer.rootContainer.removeChild(projectile.sprite)
			Core.renderer.rootContainer.removeChild(projectile.trail.rope)
		})
		return targetArray.filter((projectile) => projectile.currentTime < projectile.lifetime)
	}

	private static createProjectileSprite(): PIXI.Sprite {
		const scale = getRenderScale().superSamplingLevel
		const sprite = new PIXI.Sprite(TextureAtlas.getTexture('effects/fireball-static'))
		sprite.zIndex = 100
		sprite.scale.set(0.2 * scale)
		sprite.anchor.set(0.5, 0.5)
		return sprite
	}

	private static createAttackProjectile(sourcePosition: PIXI.Point, targetCard: RenderedCard, onImpact: () => void): RenderedProjectile {
		const sprite = ProjectileSystem.createProjectileSprite()
		const projectile = RenderedProjectile.targetCard(sprite, sourcePosition, targetCard, 500 * getAnimDurationMod(), 1200)
		ProjectileSystem.registerProjectile(projectile, onImpact)
		AudioSystem.playEffect(AudioEffectCategory.PROJECTILE)
		return projectile
	}

	private static createRowAttackProjectile(
		sourcePosition: PIXI.Point,
		targetRow: RenderedGameBoardRow,
		onImpact: () => void
	): RenderedProjectile {
		const sprite = ProjectileSystem.createProjectileSprite()
		const projectile = RenderedProjectile.targetPoint(
			sprite,
			sourcePosition,
			targetRow.getInteractionVisualPosition(),
			500 * getAnimDurationMod(),
			1200
		)
		ProjectileSystem.registerProjectile(projectile, onImpact)
		AudioSystem.playEffect(AudioEffectCategory.PROJECTILE)
		return projectile
	}

	private static registerProjectile(projectile: RenderedProjectile, onImpact: () => void): void {
		if (store.state.hotkeysModule.ultraFastAnimation) {
			Core.mainHandler.projectileSystem.projectiles.push(projectile)
			onImpact()
			return
		}
		projectile.onImpact = onImpact
		projectile.trail.rope.zIndex = 99
		Core.renderer.rootContainer.addChild(projectile.sprite)
		Core.renderer.rootContainer.addChild(projectile.trail.rope)
		Core.mainHandler.projectileSystem.projectiles.push(projectile)
	}

	public createBoardBoopProjectile(
		sourcePoint: PIXI.Point,
		targetPoint: PIXI.Point,
		mouseEvent: MouseEvent,
		color: { start: string; end: string }
	): RenderedVelocityProjectile {
		const sprite = ProjectileSystem.createProjectileSprite()
		sprite.tint = Number(`0x${color.start.toLowerCase()}`)
		const projectile = RenderedVelocityProjectile.targetMouse(sprite, sourcePoint, 1750, 1500, 10000)
		projectile.onImpact = () => {
			const angle = Utils.getVectorAngleAsDegrees({
				x: Core.input.mousePosition.x - projectile.sprite.position.x,
				y: Core.input.mousePosition.y - projectile.sprite.position.y,
			})
			Core.particleSystem.createBoardBoopEffect(Core.input.mousePosition, mouseEvent, angle, 1 + projectile.velocity / 5000, color)
		}
		ProjectileSystem.registerFireworkProjectile(projectile)
		Core.mainHandler.projectileSystem.velocityProjectiles.push(projectile)
		projectile.trail.rope.tint = Number(`0x${color.start.toLowerCase()}`)
		return projectile
	}

	public createBoardBoopFireworkProjectile(
		sourcePoint: PIXI.Point,
		targetPoint: PIXI.Point,
		mouseEvent: MouseEvent,
		color: { start: string; end: string }
	): RenderedProjectile {
		const sprite = ProjectileSystem.createProjectileSprite()
		const projectile = RenderedProjectile.targetPoint(sprite, sourcePoint, targetPoint, 500, 1200)
		projectile.onImpact = () => {
			Core.particleSystem.createBoardBoopEffect(targetPoint, mouseEvent, 0, 1.5 + Math.random(), color, false)
		}
		ProjectileSystem.registerFireworkProjectile(projectile)
		Core.mainHandler.projectileSystem.projectiles.push(projectile)
		projectile.trail.rope.tint = Number(`0x${color.start.toLowerCase()}`)
		return projectile
	}

	private static registerFireworkProjectile(projectile: RenderedProjectile | RenderedVelocityProjectile): void {
		projectile.trail.rope.zIndex = 99
		Core.renderer.rootContainer.addChild(projectile.sprite)
		Core.renderer.rootContainer.addChild(projectile.trail.rope)
	}

	public createCardAttackProjectile(sourceCard: RenderedCard, targetCard: RenderedCard): RenderedProjectile {
		return ProjectileSystem.createAttackProjectile(sourceCard.getVisualPosition(), targetCard, () => {
			Core.particleSystem.createAttackImpactParticleEffect(targetCard)
			AudioSystem.playEffect(AudioEffectCategory.IMPACT_GENERIC)
			targetCard.cardTintOverlay.tint = 0xff0000
			targetCard.cardTintOverlay.alpha = 1
		})
	}

	public createRowAttackCardProjectile(sourceRow: RenderedGameBoardRow, targetCard: RenderedCard): RenderedProjectile {
		return ProjectileSystem.createAttackProjectile(sourceRow.getInteractionVisualPosition(), targetCard, () => {
			Core.particleSystem.createAttackImpactParticleEffect(targetCard)
			AudioSystem.playEffect(AudioEffectCategory.IMPACT_GENERIC)
			targetCard.cardTintOverlay.tint = 0xff0000
			targetCard.cardTintOverlay.alpha = 1
		})
	}

	public createUniverseAttackProjectile(targetCard: RenderedCard): RenderedProjectile {
		return ProjectileSystem.createAttackProjectile(new PIXI.Point(0, 0), targetCard, () => {
			Core.particleSystem.createAttackImpactParticleEffect(targetCard)
			AudioSystem.playEffect(AudioEffectCategory.IMPACT_GENERIC)
			targetCard.cardTintOverlay.tint = 0xff0000
			targetCard.cardTintOverlay.alpha = 1
		})
	}

	public createCardAffectProjectile(sourceCard: RenderedCard, targetCard: RenderedCard): RenderedProjectile {
		return ProjectileSystem.createAttackProjectile(sourceCard.getVisualPosition(), targetCard, () => {
			/* Empty */
		})
	}

	public createCardAffectsRowProjectile(sourceCard: RenderedCard, targetRow: RenderedGameBoardRow): RenderedProjectile {
		return ProjectileSystem.createRowAttackProjectile(sourceCard.getVisualPosition(), targetRow, () => {
			/* Empty */
		})
	}

	public createRowAffectCardProjectile(sourceRow: RenderedGameBoardRow, targetCard: RenderedCard): RenderedProjectile {
		return ProjectileSystem.createAttackProjectile(sourceRow.getInteractionVisualPosition(), targetCard, () => {
			/* Empty */
		})
	}

	public createRowAffectRowProjectile(sourceRow: RenderedGameBoardRow, targetRow: RenderedGameBoardRow): RenderedProjectile {
		return ProjectileSystem.createRowAttackProjectile(sourceRow.getInteractionVisualPosition(), targetRow, () => {
			/* Empty */
		})
	}

	public createUniverseAffectProjectile(targetCard: RenderedCard): RenderedProjectile {
		return ProjectileSystem.createAttackProjectile(new PIXI.Point(0, 0), targetCard, () => {
			/* Empty */
		})
	}

	public createCardHealProjectile(sourceCard: RenderedCard, targetCard: RenderedCard): RenderedProjectile {
		return ProjectileSystem.createAttackProjectile(sourceCard.getVisualPosition(), targetCard, () => {
			Core.particleSystem.createHealImpactParticleEffect(targetCard)
			AudioSystem.playEffect(AudioEffectCategory.IMPACT_HEAL)
			targetCard.cardTintOverlay.tint = 0x00ff00
			targetCard.cardTintOverlay.alpha = 1
		})
	}

	public createRowHealProjectile(sourceRow: RenderedGameBoardRow, targetCard: RenderedCard): RenderedProjectile {
		return ProjectileSystem.createAttackProjectile(sourceRow.getInteractionVisualPosition(), targetCard, () => {
			Core.particleSystem.createHealImpactParticleEffect(targetCard)
			AudioSystem.playEffect(AudioEffectCategory.IMPACT_HEAL)
			targetCard.cardTintOverlay.tint = 0x00ff00
			targetCard.cardTintOverlay.alpha = 1
		})
	}

	public createUniverseHealProjectile(targetCard: RenderedCard): RenderedProjectile {
		return ProjectileSystem.createAttackProjectile(new PIXI.Point(0, 0), targetCard, () => {
			Core.particleSystem.createHealImpactParticleEffect(targetCard)
			AudioSystem.playEffect(AudioEffectCategory.IMPACT_HEAL)
			targetCard.cardTintOverlay.tint = 0x00ff00
			targetCard.cardTintOverlay.alpha = 1
		})
	}
}
