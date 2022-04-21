import AnimationType from '@shared/enums/AnimationType'

import OutgoingAnimationMessages from '../handlers/outgoing/OutgoingAnimationMessages'
import ServerAnimation from './ServerAnimation'
import ServerGame from './ServerGame'

export type AnimationThreadType = 'sync' | 'stagger' | 'parallel'

export default class ServerGameAnimation {
	private readonly game: ServerGame
	private lastAnimation: AnimationType | null = null

	constructor(game: ServerGame) {
		this.game = game
	}

	public play(animation: ServerAnimation): void {
		this.lastAnimation = animation.type
		OutgoingAnimationMessages.triggerAnimation(this.game, animation)
	}

	public thread(callback: () => void): void {
		this.createAnimationThread()
		callback()
		this.commitAnimationThread()
	}

	public instantThread(callback: () => void): void {
		this.createInstantAnimationThread()
		callback()
		this.commitAnimationThread()
	}

	public smartThread<T>(type: AnimationThreadType = 'stagger', callback: () => T): T {
		this.createAnimationThread(type)
		const result = callback()
		this.commitAnimationThread(type)
		return result
	}

	public createAnimationThread(type: AnimationThreadType = 'stagger'): void {
		if (type === 'sync') {
			return
		}
		if (type === 'stagger') {
			OutgoingAnimationMessages.createAnimationThread(this.game)
		} else if (type === 'parallel') {
			OutgoingAnimationMessages.createInstantAnimationThread(this.game)
		}
	}

	public createInstantAnimationThread(): void {
		OutgoingAnimationMessages.createInstantAnimationThread(this.game)
	}

	public commitAnimationThread(type: AnimationThreadType = 'stagger'): void {
		if (type !== 'sync') {
			OutgoingAnimationMessages.commitAnimationThread(this.game)
		}
	}

	public syncAnimationThreads(): void {
		if (this.lastAnimation === AnimationType.NULL) {
			return
		}
		this.play(ServerAnimation.null())
	}
}
