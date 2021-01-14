import * as PIXI from 'pixi.js'
import * as Particles from 'pixi-particles'
import { EmitterConfig, OldEmitterConfig } from 'pixi-particles'
import Core from '@/Pixi/Core'
import TextureAtlas from '@/Pixi/render/TextureAtlas'
import RenderedCard from '@/Pixi/cards/RenderedCard'
import RenderedUnit from '@/Pixi/cards/RenderedUnit'
import BuffAlignment from '@shared/enums/BuffAlignment'
import { getBoopColor } from '@/utils/Utils'

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

	public tick(): void {
		this.emitters
			.filter(
				(handle) =>
					!!handle.ownerCard && !!handle.container && !!handle.ownerCard.coreContainer && !!handle.ownerCard.coreContainer.transform
			)
			.forEach((handle) => {
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
		return new Particles.Emitter(container, [TextureAtlas.getTexture('effects/particle')], config)
	}
	private playEmitter(emitter: Particles.Emitter, container: PIXI.Container): void {
		this.emitters.push({
			emitter: emitter,
		})
		emitter.emit = true
		emitter.playOnceAndDestroy(() => {
			this.emitters = this.emitters.filter((handle) => handle.emitter !== emitter)
			container.parent.removeChild(container)
		})
	}
	private playAttachedEmitter(emitter: Particles.Emitter, container: PIXI.Container, card: RenderedCard): void {
		this.emitters.push({
			emitter: emitter,
			container: container,
			ownerCard: card,
		})
		container.position.copyFrom(card.coreContainer.position)
		emitter.emit = true
		emitter.playOnceAndDestroy(() => {
			this.emitters = this.emitters.filter((handle) => handle.emitter !== emitter)
			container.parent.removeChild(container)
		})
	}
	public destroyEmitter(emitter: Particles.Emitter, container: PIXI.Container): void {
		emitter.emit = false
		setTimeout(() => {
			this.emitters = this.emitters.filter((handle) => handle.emitter !== emitter)
			container.parent.removeChild(emitter.parent)
		}, 1000)
	}

	private createBoardContainer(): PIXI.Container {
		const container = new PIXI.Container()
		Core.renderer.boardEffectsContainer.addChild(container)
		return container
	}

	public createSmallBoardBoopEffect(position: PIXI.Point): void {
		const boopContainer = this.createBoardContainer()

		const projectileCount = 10
		const projectileSpeed = 500

		const emitter = this.createDefaultEmitter(boopContainer, {
			alpha: { start: 1.0, end: 0 },
			scale: { start: 0.15 * Core.renderer.superSamplingLevel, end: 0 },
			color: getBoopColor(),
			speed: { start: projectileSpeed, end: 0 },
			minimumSpeedMultiplier: 0.75,
			minimumScaleMultiplier: 0.5,
			startRotation: {
				min: 0,
				max: 360,
			},
			lifetime: { min: 0.5, max: 0.5 },
			ease: [{ s: 0, cp: 0.1, e: 1 }],
			blendMode: 'screen',
			frequency: 0.049,
			emitterLifetime: 0.05,
			maxParticles: 100,
			pos: position,
			particlesPerWave: projectileCount,
			spawnType: 'point',
		})
		this.playEmitter(emitter, boopContainer)
	}

	public createBoardBoopEffect(
		position: PIXI.Point,
		mouseEvent: MouseEvent,
		angle: number,
		power: number,
		forcedColor: { start: string; end: string } | null = null,
		limitAngle = true
	): void {
		const boopContainer = this.createBoardContainer()

		const projectileCount = 400 + 250 * Math.pow(power, 2)
		const projectileSpeed = 500 * Math.pow(power, 1.5)

		const emitter = this.createDefaultEmitter(boopContainer, {
			alpha: { start: 1.0, end: 0 },
			scale: { start: 0.15 * Core.renderer.superSamplingLevel, end: 0 },
			color: forcedColor || getBoopColor(),
			speed: { start: projectileSpeed, end: 0 },
			minimumSpeedMultiplier: 0.01,
			minimumScaleMultiplier: 0.75 / Math.pow(Math.max(1, power), 2),
			startRotation: {
				min: angle - 180 / Math.max(1, limitAngle ? power : 1),
				max: angle + 180 / Math.max(1, limitAngle ? power : 1),
			},
			lifetime: { min: 0.5 * Math.max(1, power), max: 0.5 * Math.max(1, power) },
			ease: [{ s: 0, cp: 0.1, e: 1 }],
			blendMode: 'screen',
			frequency: 0.049,
			emitterLifetime: 0.05 + Math.random() * 0.1 * (Math.max(1, power) - 1),
			maxParticles: 15000,
			pos: position,
			particlesPerWave: projectileCount / 5,
			spawnType: 'point',
		})
		this.playEmitter(emitter, boopContainer)
	}

	public createBoardBoopPrepareEffect(position: PIXI.Point): Particles.Emitter {
		const boopContainer = this.createBoardContainer()

		const emitter = this.createDefaultEmitter(boopContainer, {
			alpha: { start: 1.0, end: 0 },
			scale: { start: 0.15 * Core.renderer.superSamplingLevel, end: 0 },
			color: getBoopColor(),
			speed: { start: 150, end: 0 },
			minimumSpeedMultiplier: 0.1,
			startRotation: { min: 0, max: 360 },
			lifetime: { min: 0.5, max: 0.5 },
			ease: [{ s: 0, cp: 0.1, e: 1 }],
			blendMode: 'screen',
			frequency: 0.1,
			emitterLifetime: 1000,
			maxParticles: 1000,
			pos: position,
			particlesPerWave: 20,
			spawnType: 'ring',
			particleSpacing: 10,
			spawnCircle: {
				x: 0,
				y: 0,
				r: 30,
				minR: 20,
			},
		})
		this.playEmitter(emitter, boopContainer)
		return emitter
	}

	public createAttackImpactParticleEffect(card: RenderedCard): void {
		const container = this.getCardEffectContainer(card)
		const emitter = this.createDefaultEmitter(container, {
			alpha: { start: 1.0, end: 0 },
			scale: { start: 0.15 * Core.renderer.superSamplingLevel, end: 0 },
			color: { start: 'ff002b', end: 'ff5ed1' },
			speed: { start: 550, end: 0 },
			minimumSpeedMultiplier: 0.1,
			startRotation: { min: 0, max: 360 },
			lifetime: { min: 0.5, max: 0.5 },
			ease: [{ s: 0, cp: 0.1, e: 1 }],
			blendMode: 'screen',
			frequency: 0.01,
			emitterLifetime: 0.011,
			maxParticles: 1000,
			pos: {
				x: card.getPosition().x,
				y: card.getPosition().y,
			},
			particlesPerWave: 500,
			spawnType: 'point',
		})
		this.playEmitter(emitter, container)
	}

	public createHealImpactParticleEffect(card: RenderedCard): void {
		const container = this.getCardEffectContainer(card)

		const emitter = this.createDefaultEmitter(container, {
			alpha: { start: 1.0, end: 0 },
			scale: { start: 0.15 * Core.renderer.superSamplingLevel, end: 0 },
			color: { start: '00ff2b', end: '5ed1ff' },
			speed: { start: 550, end: 0 },
			minimumSpeedMultiplier: 0.1,
			startRotation: { min: 0, max: 360 },
			lifetime: { min: 0.5, max: 0.5 },
			ease: [{ s: 0, cp: 0.1, e: 1 }],
			blendMode: 'screen',
			frequency: 0.01,
			emitterLifetime: 0.011,
			maxParticles: 1000,
			pos: {
				x: card.getPosition().x,
				y: card.getPosition().y,
			},
			particlesPerWave: 500,
			spawnType: 'point',
		})
		this.playEmitter(emitter, container)
	}

	public createUnitDeployParticleEffect(unit: RenderedUnit): void {
		let color = {
			start: '55AAFF',
			end: '0000FF',
		}
		if (unit.owner === Core.opponent) {
			color = {
				start: 'FFAA55',
				end: 'FF0000',
			}
		}

		const card = unit.card
		const container = this.getCardEffectContainer(card)

		const emitter = this.createDefaultEmitter(container, {
			alpha: { start: 1.0, end: 0 },
			scale: { start: 0.9 * Core.renderer.superSamplingLevel, end: 0.5 * Core.renderer.superSamplingLevel },
			color: color,
			speed: { start: 0, end: 0 },
			startRotation: { min: 0, max: 360 },
			rotationSpeed: { min: 0, max: 200 },
			lifetime: { min: 0.5, max: 1.5 },
			blendMode: 'screen',
			ease: [{ s: 0, cp: 0.1, e: 1 }],
			frequency: 0.005,
			emitterLifetime: 0.15,
			maxParticles: 1000,
			pos: {
				x: 0,
				y: 0,
			},
			particlesPerWave: 25,
			spawnType: 'rect',
			spawnRect: {
				x: -card.sprite.width / 2,
				y: -card.sprite.height / 2,
				w: card.sprite.width,
				h: card.sprite.height,
			},
		})
		this.playAttachedEmitter(emitter, container, card)
	}

	public createUnitIncapacitateParticleEffect(unit: RenderedUnit): void {
		let color = {
			start: '55AAFF',
			end: '0000FF',
		}
		if (unit.owner === Core.opponent) {
			color = {
				start: 'FFAA55',
				end: 'FF0000',
			}
		}

		const card = unit.card
		const container = this.getCardEffectContainer(card)

		const emitter = this.createDefaultEmitter(container, {
			alpha: { start: 1.0, end: 0 },
			scale: { start: 0.9 * Core.renderer.superSamplingLevel, end: 0.5 * Core.renderer.superSamplingLevel },
			color: color,
			speed: { start: 150, end: 0 },
			minimumSpeedMultiplier: 0.1,
			minimumScaleMultiplier: 0.1,
			startRotation: { min: 0, max: 360 },
			rotationSpeed: { min: 0, max: 200 },
			lifetime: { min: 1.25, max: 1.25 },
			blendMode: 'screen',
			ease: [{ s: 0, cp: 0.1, e: 1 }],
			frequency: 0.02,
			emitterLifetime: 0.4,
			maxParticles: 1000,
			pos: {
				x: 0,
				y: 0,
			},
			particlesPerWave: 25,
			spawnType: 'rect',
			spawnRect: {
				x: -card.sprite.width / 2,
				y: -card.sprite.height / 2,
				w: card.sprite.width,
				h: card.sprite.height,
			},
		})
		this.playAttachedEmitter(emitter, container, card)
	}

	public createCardReceivedBuffParticleEffect(card: RenderedCard, alignment: BuffAlignment): void {
		const config = {
			color: { start: '00FF00', end: '55FF55' },
			startRotation: { min: 270, max: 270 },
		}

		if (alignment === BuffAlignment.NEGATIVE) {
			config.color = { start: 'FF5555', end: '550000' }
			config.startRotation = { min: 90, max: 90 }
		}

		const count = card.isUnitMode() ? 500 : 1000

		const container = this.getCardEffectContainer(card)
		const emitter = this.createDefaultEmitter(container, {
			alpha: { start: 1.0, end: 0 },
			scale: { start: 0.2 * Core.renderer.superSamplingLevel, end: 0.2 * Core.renderer.superSamplingLevel },
			color: config.color,
			speed: { start: 50, end: 50 },
			minimumSpeedMultiplier: 0.1,
			minimumScaleMultiplier: 0.1,
			startRotation: config.startRotation,
			rotationSpeed: { min: 0, max: 200 },
			lifetime: { min: 0.5, max: 1.0 },
			blendMode: 'screen',
			ease: [{ s: 0, cp: 0.1, e: 1 }],
			frequency: 0.001,
			emitterLifetime: 0.05,
			maxParticles: count,
			pos: {
				x: 0,
				y: 0,
			},
			particlesPerWave: 25,
			spawnType: 'rect',
			spawnRect: {
				x: -card.sprite.width / 2,
				y: -card.sprite.height / 2,
				w: card.sprite.width,
				h: card.sprite.height,
			},
		})

		this.playAttachedEmitter(emitter, container, card)
	}

	public createInfuseParticleEffect(card: RenderedCard): void {
		const container = this.getCardEffectContainer(card)
		const emitter = this.createDefaultEmitter(container, {
			alpha: { start: 1.0, end: 0 },
			scale: { start: 0.15 * Core.renderer.superSamplingLevel, end: 0 },
			color: { start: '002bff', end: '5ed1ff' },
			speed: { start: 150, end: 0 },
			minimumSpeedMultiplier: 0.1,
			startRotation: { min: 0, max: 360 },
			lifetime: { min: 0.5, max: 0.5 },
			ease: [{ s: 0, cp: 0.1, e: 1 }],
			blendMode: 'screen',
			frequency: 0.02,
			emitterLifetime: 0.5,
			maxParticles: 1000,
			pos: {
				x: card.getPosition().x,
				y: card.getPosition().y,
			},
			particlesPerWave: 20,
			spawnType: 'ring',
			particleSpacing: 10,
			spawnCircle: {
				x: 0,
				y: 0,
				r: 30,
				minR: 20,
			},
		})
		this.playEmitter(emitter, container)
	}

	public createManaGeneratedParticleEffect(card: RenderedCard): void {
		const container = this.getCardEffectContainer(card)

		const count = card.isUnitMode() ? 500 : 1000
		const emitter = this.createDefaultEmitter(container, {
			alpha: { start: 1.0, end: 0 },
			scale: { start: 0.2 * Core.renderer.superSamplingLevel, end: 0.2 * Core.renderer.superSamplingLevel },
			color: { start: '5555FF', end: '000055' },
			speed: { start: 10, end: 10 },
			minimumSpeedMultiplier: 0.1,
			minimumScaleMultiplier: 0.1,
			startRotation: { min: 0, max: 360 },
			rotationSpeed: { min: 0, max: 200 },
			lifetime: { min: 0.8, max: 2.0 },
			blendMode: 'screen',
			ease: [{ s: 0, cp: 0.1, e: 1 }],
			frequency: 0.001,
			emitterLifetime: 0.05,
			maxParticles: count,
			pos: {
				x: 0,
				y: 0,
			},
			particlesPerWave: 25,
			spawnType: 'rect',
			spawnRect: {
				x: -card.sprite.width / 2,
				y: -card.sprite.height / 2,
				w: card.sprite.width,
				h: card.sprite.height,
			},
		})
		this.playAttachedEmitter(emitter, container, card)
	}

	public destroy(): void {
		this.emitters.forEach((emitter) => emitter.emitter.destroy())
	}
}
