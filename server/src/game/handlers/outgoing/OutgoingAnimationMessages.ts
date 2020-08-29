import ServerPlayer from '../../players/ServerPlayer'
import ServerAnimation from '../../models/ServerAnimation'
import AnimationMessage from '@shared/models/network/AnimationMessage'
import ServerGame from '../../models/ServerGame'
import AnimationThreadStartMessage from '@shared/models/network/AnimationThreadStartMessage'

export default {
	triggerAnimation(game: ServerGame, animation: ServerAnimation): void {
		game.players.forEach(playerInGame => {
			this.triggerAnimationForPlayer(playerInGame.player, animation)
		})
	},

	createAnimationThread(game: ServerGame): void {
		game.players.forEach(playerInGame => {
			this.createAnimationThreadForPlayer(playerInGame.player, false)
		})
	},

	createStaggeredAnimationThread(game: ServerGame): void {
		game.players.forEach(playerInGame => {
			this.createAnimationThreadForPlayer(playerInGame.player, true)
		})
	},

	commitAnimationThread(game: ServerGame): void {
		game.players.forEach(playerInGame => {
			this.commitAnimationThreadForPlayer(playerInGame.player)
		})
	},

	triggerAnimationForPlayer(player: ServerPlayer, animation: ServerAnimation): void {
		player.sendMessage({
			type: 'animation/generic',
			data: new AnimationMessage(animation)
		})
	},

	createAnimationThreadForPlayer(player: ServerPlayer, isStaggered: boolean): void {
		player.sendMessage({
			type: 'animation/createThread',
			data: undefined,
			highPriority: true
		})
		player.sendMessage({
			type: 'animation/startThread',
			data: new AnimationThreadStartMessage(isStaggered),
			allowBatching: true,
			ignoreWorkerThreads: true
		})
	},

	commitAnimationThreadForPlayer(player: ServerPlayer): void {
		player.sendMessage({
			type: 'animation/commitThread',
			data: undefined,
			highPriority: true,
		})
	}
}
