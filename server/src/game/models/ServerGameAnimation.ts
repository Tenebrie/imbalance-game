import ServerGame from './ServerGame'
import OutgoingAnimationMessages from '../handlers/outgoing/OutgoingAnimationMessages'
import ServerAnimation from './ServerAnimation'
import ServerPlayerInGame from '../players/ServerPlayerInGame'

export default class ServerGameAnimation {
	game: ServerGame

	constructor(game: ServerGame) {
		this.game = game
	}

	public play(animation: ServerAnimation): void {
		OutgoingAnimationMessages.triggerAnimation(this.game, animation)
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
		this.play(ServerAnimation.null())
	}

	public playForPlayer(animation: ServerAnimation, targetPlayer: ServerPlayerInGame): void {
		OutgoingAnimationMessages.triggerAnimationForPlayer(targetPlayer.player, animation)
	}
}
