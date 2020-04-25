import Core from '@/Pixi/Core'
import * as PIXI from 'pixi.js'
import QueuedMessage from '@/Pixi/models/QueuedMessage'
import RenderedCard from '@/Pixi/board/RenderedCard'
import ProjectileSystem from '@/Pixi/render/ProjectileSystem'

export default class MainHandler {
	projectileSystem: ProjectileSystem = new ProjectileSystem()

	announcedCard: RenderedCard | null = null
	queuedMessages: QueuedMessage[] = []
	messageCooldown = 0

	coreTicker: PIXI.Ticker

	constructor() {
		let lastTime = performance.now()
		this.coreTicker = new PIXI.Ticker()
		this.coreTicker.add(() => {
			const now = performance.now()
			const deltaTime = now - lastTime
			const deltaFraction = deltaTime / 1000
			lastTime = now

			if (deltaTime > 1000) {
				console.warn(`Delta time too long (${deltaTime}), skipping tick`)
				return
			}

			this.tick(deltaTime, deltaFraction)
			this.projectileSystem.tick(deltaTime, deltaFraction)
			Core.renderer.tick(deltaTime, deltaFraction)
			Core.input.tick()
		})

		this.coreTicker.start()
	}

	private tick(deltaTime: number, deltaFraction: number): void {
		this.messageCooldown = Math.max(0, this.messageCooldown - deltaTime)
		if (this.messageCooldown === 0 && this.queuedMessages.length > 0) {
			this.executeNextMessage()
		}
	}

	private executeNextMessage(): void {
		const message = this.queuedMessages.shift()

		try {
			message.handler(message.data)
		} catch (e) {
			console.error(e)
		}

		if (this.messageCooldown === 0 && this.queuedMessages.length > 0) {
			this.executeNextMessage()
		}
	}

	public registerMessage(message: QueuedMessage): void {
		this.queuedMessages.push(message)

		if (this.messageCooldown === 0) {
			this.executeNextMessage()
		}
	}

	public triggerAnimation(time: number): void {
		this.messageCooldown += time
	}

	public skipAnimation(): void {
		this.messageCooldown = 0
	}

	public announceCard(card: RenderedCard): void {
		this.announcedCard = card
	}

	public clearAnnouncedCard(): void {
		this.announcedCard = null
	}

	public static start(): MainHandler {
		return new MainHandler()
	}

	public stop(): void {
		this.coreTicker.stop()
	}
}
