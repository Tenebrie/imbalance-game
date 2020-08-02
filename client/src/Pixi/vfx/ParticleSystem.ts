import * as PIXI from 'pixi.js'
import * as Particles from 'pixi-particles'
import Core from '@/Pixi/Core'
import TextureAtlas from '@/Pixi/render/TextureAtlas'
import RenderedCard from '@/Pixi/cards/RenderedCard'
import RenderedUnit from '@/Pixi/cards/RenderedUnit'
import BuffAlignment from '@shared/enums/BuffAlignment'
import {EmitterConfig, OldEmitterConfig} from 'pixi-particles'

interface ParticleEmitterHandle {
	emitter: Particles.Emitter
	container?: PIXI.Container
	ownerCard?: RenderedCard
}

export default class ParticleSystem {
	private emitters: ParticleEmitterHandle[]
	private readonly container: PIXI.Container

	constructor() {
		const emitterContainer = new PIXI.Container()
		emitterContainer.position.set(0, 0)
		emitterContainer.zIndex = 1000
		Core.renderer.rootContainer.addChild(emitterContainer)
		this.emitters = []
		this.container = emitterContainer
	}

	public tick(deltaTime: number, deltaFraction: number): void {
		this.emitters
			.filter(handle => !!handle.ownerCard && !!handle.container)
			.forEach(handle => {
				handle.container.position.copyFrom(handle.ownerCard.coreContainer.position)
			})
	}

	private getCardEffectContainer(card: RenderedCard): PIXI.Container {
		let effectContainer = Core.renderer.handEffectsContainer
		if (Core.board.findUnitById(card.id)) {
			effectContainer = Core.renderer.boardEffectsContainer
		}

		const emitterContainer = new PIXI.Container()
		effectContainer.addChild(emitterContainer)

		return emitterContainer
	}
	private createDefaultEmitter(container: PIXI.Container, config: EmitterConfig | OldEmitterConfig): Particles.Emitter {
		return new Particles.Emitter(
			container,
			[TextureAtlas.getTexture('effects/particle')],
			config
		)
	}
	private playEmitter(emitter: Particles.Emitter, container: PIXI.Container): void {
		this.emitters.push({
			emitter: emitter,
		})
		emitter.emit = true
		emitter.playOnceAndDestroy(() => {
			this.emitters = this.emitters.filter(handle => handle.emitter !== emitter)
			container.parent.removeChild(container)
		})
	}
	private playAttachedEmitter(emitter: Particles.Emitter, container: PIXI.Container, card: RenderedCard): void {
		this.emitters.push({
			emitter: emitter,
			container: container,
			ownerCard: card
		})
		container.position.copyFrom(card.coreContainer.position)
		emitter.emit = true
		emitter.playOnceAndDestroy(() => {
			this.emitters = this.emitters.filter(handle => handle.emitter !== emitter)
			container.parent.removeChild(container)
		})
	}

	public createInteractionImpactParticleEffect(card: RenderedCard): void {
		const container = this.getCardEffectContainer(card)
		const emitter = this.createDefaultEmitter(container, {
			alpha: { start: 1.00, end: 0 },
			scale: { start: 0.15 * Core.renderer.superSamplingLevel, end: 0 },
			color: { start: 'FFFFFF', end: 'FFFFFF' },
			speed: { start: 550,  end: 0 },
			minimumSpeedMultiplier: 0.1,
			startRotation: { min: 0, max: 360 },
			rotationSpeed: { min: 0, max: 200 },
			lifetime: { min: 0.5, max: 0.5 },
			blendMode: 'screen',
			ease: [
				{ s: 0, cp: 0.1, e: 1 }
			],
			frequency: 0.01,
			emitterLifetime: 0.011,
			maxParticles: 1000,
			pos: {
				x: card.getPosition().x,
				y: card.getPosition().y
			},
			particlesPerWave: 250,
			spawnType: 'point',
		})
		this.playEmitter(emitter, container)
	}

	public createHealImpactParticleEffect(card: RenderedCard): void {
		const container = this.getCardEffectContainer(card)

		const emitter = this.createDefaultEmitter(container, {
			alpha: { start: 1.00, end: 0 },
			scale: { start: 0.15 * Core.renderer.superSamplingLevel, end: 0 },
			color: { start: '00ff2b', end: '5ed1ff' },
			speed: { start: 550,  end: 0 },
			minimumSpeedMultiplier: 0.1,
			startRotation: { min: 0, max: 360 },
			lifetime: { min: 0.5, max: 0.5 },
			ease: [
				{ s: 0, cp: 0.1, e: 1 }
			],
			blendMode: 'screen',
			frequency: 0.01,
			emitterLifetime: 0.011,
			maxParticles: 1000,
			pos: {
				x: card.getPosition().x,
				y: card.getPosition().y
			},
			particlesPerWave: 500,
			spawnType: 'point',
		})
		this.playEmitter(emitter, container)
	}

	public createUnitDeployParticleEffect(unit: RenderedUnit): void {
		let color = {
			start: '55AAFF',
			end: '0000FF'
		}
		if (unit.owner === Core.opponent) {
			color = {
				start: 'FFAA55',
				end: 'FF0000'
			}
		}

		const card = unit.card
		const container = this.getCardEffectContainer(card)

		const emitter = this.createDefaultEmitter(container, {
			alpha: {start: 1.00, end: 0},
			scale: {start: 0.9 * Core.renderer.superSamplingLevel, end: 0.5 * Core.renderer.superSamplingLevel},
			color: color,
			speed: {start: 0, end: 0},
			startRotation: {min: 0, max: 360},
			rotationSpeed: {min: 0, max: 200},
			lifetime: {min: 0.5, max: 1.5},
			blendMode: 'screen',
			ease: [
				{s: 0, cp: 0.1, e: 1}
			],
			frequency: 0.005,
			emitterLifetime: 0.15,
			maxParticles: 1000,
			pos: {
				x: 0,
				y: 0
			},
			particlesPerWave: 25,
			spawnType: 'rect',
			spawnRect: {
				x: -card.sprite.width / 2,
				y: -card.sprite.height / 2,
				w: card.sprite.width,
				h: card.sprite.height
			}
		})
		this.playAttachedEmitter(emitter, container, card)
	}

	public createCardReceivedBuffParticleEffect(card: RenderedCard, alignment: BuffAlignment): void {
		const config = {
			color: { start: '00FF00', end: '55FF55' },
			startRotation: { min: 270, max: 270 }
		}

		if (alignment === BuffAlignment.NEGATIVE) {
			config.color = { start: 'FF5555', end: 'FF5555' }
			config.startRotation = { min: 90, max: 90 }
		}

		const container = this.getCardEffectContainer(card)
		const emitter = this.createDefaultEmitter(container, {
			alpha: { start: 1.00, end: 0 },
			scale: { start: 0.15 * Core.renderer.superSamplingLevel, end: 0.15 * Core.renderer.superSamplingLevel },
			color: config.color,
			speed: { start: 50,  end: 50 },
			minimumSpeedMultiplier: 0.1,
			minimumScaleMultiplier: 0.1,
			startRotation: config.startRotation,
			rotationSpeed: { min: 0, max: 200 },
			lifetime: { min: 0.5, max: 1.0 },
			blendMode: 'screen',
			ease: [
				{ s: 0, cp: 0.1, e: 1 }
			],
			frequency: 0.001,
			emitterLifetime: 0.05,
			maxParticles: 1000,
			pos: {
				x: 0,
				y: 0
			},
			particlesPerWave: 25,
			spawnType: 'rect',
			spawnRect: {
				x: -card.sprite.width / 2,
				y: -card.sprite.height / 2,
				w: card.sprite.width,
				h: card.sprite.height
			}
		})

		this.playAttachedEmitter(emitter, container, card)
	}
}
