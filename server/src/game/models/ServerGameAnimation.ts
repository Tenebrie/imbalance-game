import ServerGame from './ServerGame'
import OutgoingAnimationMessages from '../handlers/outgoing/OutgoingAnimationMessages'
import ServerAnimation from './ServerAnimation'
import ServerPlayerInGame from '../players/ServerPlayerInGame'

export default class ServerGameAnimation {
	game: ServerGame

	constructor(game: ServerGame) {
		this.game = game
	}

	public play(animation: ServerAnimation, targetPlayer: ServerPlayerInGame): void {
		OutgoingAnimationMessages.triggerAnimation(targetPlayer.player, animation)
	}

	public playForAll(animation: ServerAnimation): void {
		OutgoingAnimationMessages.triggerAnimationForAll(this.game, animation)
	}
}
