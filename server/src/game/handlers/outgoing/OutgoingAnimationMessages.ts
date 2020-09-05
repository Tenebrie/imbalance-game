import ServerPlayer from '../../players/ServerPlayer'
import ServerAnimation from '../../models/ServerAnimation'
import AnimationMessage from '@shared/models/network/AnimationMessage'
import ServerGame from '../../models/ServerGame'
import AnimationThreadStartMessage from '@shared/models/network/AnimationThreadStartMessage'
import {AnimationMessageType} from '@shared/models/network/messageHandlers/ServerToClientMessageTypes'

export default {
	triggerAnimation(game: ServerGame, animation: ServerAnimation): void {
		game.players.forEach(playerInGame => {
			this.triggerAnimationForPlayer(playerInGame.player, animation)
		})
	},

	createAnimationThread(game: ServerGame): void {
		game.players.forEach(playerInGame => {
			this.createAnimationThreadForPlayer(playerInGame.player, true)
		})
	},

	createInstantAnimationThread(game: ServerGame): void {
		game.players.forEach(playerInGame => {
			this.createAnimationThreadForPlayer(playerInGame.player, false)
		})
	},

	commitAnimationThread(game: ServerGame): void {
		game.players.forEach(playerInGame => {
			this.commitAnimationThreadForPlayer(playerInGame.player)
		})
	},

	triggerAnimationForPlayer(player: ServerPlayer, animation: ServerAnimation): void {
		player.sendMessage({
			type: AnimationMessageType.PLAY,
			data: new AnimationMessage(animation)
		})
	},

	createAnimationThreadForPlayer(player: ServerPlayer, isStaggered: boolean): void {
		player.sendMessage({
			type: AnimationMessageType.THREAD_CREATE,
			data: undefined,
			highPriority: true
		})
		player.sendMessage({
			type: AnimationMessageType.THREAD_START,
			data: new AnimationThreadStartMessage(isStaggered),
			allowBatching: true,
			ignoreWorkerThreads: true
		})
	},

	commitAnimationThreadForPlayer(player: ServerPlayer): void {
		player.sendMessage({
			type: AnimationMessageType.THREAD_COMMIT,
			data: undefined,
			highPriority: true,
		})
	}
}
