import AnimationType from '@shared/enums/AnimationType'

import OutgoingAnimationMessages from '../handlers/outgoing/OutgoingAnimationMessages'
import ServerAnimation from './ServerAnimation'
import ServerGame from './ServerGame'

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

	public createAnimationThread(): void {
		OutgoingAnimationMessages.createAnimationThread(this.game)
	}

	public createInstantAnimationThread(): void {
		OutgoingAnimationMessages.createInstantAnimationThread(this.game)
	}

	public commitAnimationThread(): void {
		OutgoingAnimationMessages.commitAnimationThread(this.game)
	}

	public syncAnimationThreads(): void {
		if (this.lastAnimation === AnimationType.NULL) {
			return
		}
		this.play(ServerAnimation.null())
	}
}
