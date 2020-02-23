import ServerPlayer from '../../players/ServerPlayer'
import ServerAnimation from '../../models/ServerAnimation'
import AnimationMessage from '../../shared/models/network/AnimationMessage'
import ServerGame from '../../models/ServerGame'

export default {
	triggerAnimation(game: ServerGame, animation: ServerAnimation) {
		game.players.forEach(playerInGame => {
			this.triggerAnimationForPlayer(playerInGame.player, animation)
		})
	},

	triggerAnimationForPlayer(player: ServerPlayer, animation: ServerAnimation) {
		player.sendMessage({
			type: 'animation/generic',
			data: new AnimationMessage(animation)
		})
	}
}
