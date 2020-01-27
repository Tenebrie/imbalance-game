import ServerPlayer from '../../players/ServerPlayer'
import ServerAnimation from '../../models/ServerAnimation'
import AnimationMessage from '../../shared/models/network/AnimationMessage'
import ServerGame from '../../models/ServerGame'

export default {
	triggerAnimation(player: ServerPlayer, animation: ServerAnimation) {
		player.sendMessage({
			type: 'animation/generic',
			data: new AnimationMessage(animation)
		})
	},

	triggerAnimationForAll(game: ServerGame, animation: ServerAnimation) {
		game.players.forEach(playerInGame => {
			this.triggerAnimation(playerInGame.player, animation)
		})
	}
}
