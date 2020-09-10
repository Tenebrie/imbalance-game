import uuidv4 from 'uuid/v4'
import Core from '@/Pixi/Core'
import * as PIXI from 'pixi.js'
import QueuedMessage from '@/Pixi/models/QueuedMessage'
import RenderedCard from '@/Pixi/cards/RenderedCard'
import ProjectileSystem from '@/Pixi/vfx/ProjectileSystem'

class AnimationThread {
	public id: string = uuidv4()

	private __workerThreads: AnimationThread[] = []

	protected queuedMessages: QueuedMessage[] = []
	protected messageCooldown = 0

	private readonly __parentThread: AnimationThread | null

	protected __isStarted = false

	constructor(parentThread: AnimationThread | null) {
		this.__parentThread = parentThread
	}

	public start(): void {
		this.__isStarted = true
	}

	public get started(): boolean {
		return this.__isStarted
	}

	public get parentThread(): AnimationThread | null {
		return this.__parentThread
	}

	public get workerThreads(): AnimationThread[] {
		return this.__workerThreads
	}

	public tick(deltaTime: number): void {
		if (!this.__isStarted) {
			return
		}

		this.__workerThreads.forEach(thread => thread.tick(deltaTime))

		const activeWorkerThreads = this.__workerThreads.filter(thread => thread.started)
		if (activeWorkerThreads.length > 0) {
			return
		}

		this.messageCooldown = Math.max(0, this.messageCooldown - deltaTime)
		if (this.messageCooldown === 0 && this.queuedMessages.length > 0) {
			this.executeNextMessage()
		}

		if (this.messageCooldown === 0 && this.__workerThreads.filter(thread => thread.started).length === 0 && this.queuedMessages.length === 0) {
			if (this === Core.mainHandler.mainAnimationThread) {
				this.__isStarted = false
			} else {
				this.__parentThread.killAnimationThread(this.id)
			}
		}
	}

	public createAnimationThread(): AnimationThread {
		const newThread = new AnimationThread(this)
		this.__workerThreads.push(newThread)
		return newThread
	}

	public findThread(id: string): AnimationThread | null {
		if (this.id === id) {
			return this
		}
		for (let i = 0; i < this.__workerThreads.length; i++) {
			const foundThread = this.__workerThreads[i].findThread(id)
			if (foundThread) {
				return foundThread
			}
		}
		return null
	}

	public killAnimationThread(id: string): void {
		this.__workerThreads = this.__workerThreads.filter(thread => thread.id !== id)
	}

	public registerMessage(message: QueuedMessage): void {
		this.queuedMessages.push(message)
	}

	public triggerCooldown(time: number): AnimationThread {
		this.messageCooldown += time
		return this
	}

	public skipCooldown(): void {
		this.messageCooldown = 0
	}

	private executeNextMessage(): void {
		const message = this.queuedMessages.shift()
		this.executeMessage(message)

		if (message.allowBatching) {
			while (this.queuedMessages.length > 0 && this.queuedMessages[0].handler === message.handler) {
				const nextMessage = this.queuedMessages.shift()
				this.executeMessage(nextMessage)
			}
		}
	}

	private executeMessage(message: QueuedMessage): void {
		try {
			message.handler(message.data, {
				animationThreadId: this.id
			})
		} catch (e) {
			console.error(e)
		}
	}
}

export default class MainHandler {
	projectileSystem: ProjectileSystem = new ProjectileSystem()
	announcedCard: RenderedCard | null = null

	mainAnimationThread: AnimationThread = new AnimationThread(null)
	currentOpenAnimationThread: AnimationThread = this.mainAnimationThread

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
				console.warn(`Delta time too long (${Math.round(deltaTime) / 1000} seconds), skipping tick`)
				return
			}

			this.mainAnimationThread.tick(deltaTime)
			this.projectileSystem.tick(deltaTime, deltaFraction)
			Core.renderer.tick(deltaTime, deltaFraction)
			Core.particleSystem.tick(deltaTime, deltaFraction)
			Core.input.tick()
		})

		this.coreTicker.start()
	}

	public registerMessage(message: QueuedMessage): void {
		let targetThread = this.currentOpenAnimationThread
		if (message.ignoreWorkerThreads) {
			targetThread = this.currentOpenAnimationThread.parentThread
		}
		targetThread.registerMessage(message)
	}

	public triggerAnimation(time: number, threadId: string): void {
		const targetThread = this.mainAnimationThread.findThread(threadId)
		targetThread.triggerCooldown(time)
	}

	public createAnimationThread(): void {
		this.currentOpenAnimationThread = this.currentOpenAnimationThread.createAnimationThread()
	}

	public commitAnimationThread(): void {
		this.currentOpenAnimationThread = this.currentOpenAnimationThread.parentThread
	}

	public skipAnimation(): void {
		this.currentOpenAnimationThread.skipCooldown()
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
		this.coreTicker.destroy()
	}
}
