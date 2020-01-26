import Core from '@/Pixi/Core'
import * as PIXI from 'pixi.js'
import QueuedMessage from '@/Pixi/models/QueuedMessage'
import RenderedCard from '@/Pixi/models/RenderedCard'

export default class MainHandler {
	queuedMessages: QueuedMessage[]
	messageCooldown: number

	announcedCard: RenderedCard | null

	constructor() {
		this.queuedMessages = []
		this.messageCooldown = 0

		let lastTime = performance.now()
		PIXI.Ticker.shared.add(() => {
			const now = performance.now()
			const deltaTime = now - lastTime
			const deltaFraction = deltaTime / 1000
			lastTime = now
			this.tick(deltaTime, deltaFraction)
		})
	}

	private tick(deltaTime: number, deltaFraction: number): void {
		this.messageCooldown = Math.max(0, this.messageCooldown - deltaTime)
		if (this.messageCooldown === 0 && this.queuedMessages.length > 0) {
			this.executeNextMessage()
		}
	}

	private executeNextMessage(): void {
		const message = this.queuedMessages.shift()
		message.handler(message.data)
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
		PIXI.Ticker.shared.remove(this.tick)
	}
}
