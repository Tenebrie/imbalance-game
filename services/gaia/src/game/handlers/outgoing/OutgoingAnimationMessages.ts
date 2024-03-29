import AnimationMessage from '@shared/models/network/AnimationMessage'
import AnimationThreadStartMessage from '@shared/models/network/AnimationThreadStartMessage'
import { AnimationMessageType } from '@shared/models/network/messageHandlers/ServerToClientGameMessages'
import ServerPlayerGroup from '@src/game/players/ServerPlayerGroup'
import ServerPlayerInGame from '@src/game/players/ServerPlayerInGame'
import ServerPlayerSpectator from '@src/game/players/ServerPlayerSpectator'

import ServerAnimation from '../../models/ServerAnimation'
import ServerGame from '../../models/ServerGame'
import ServerPlayer from '../../players/ServerPlayer'

export default {
	triggerAnimation(game: ServerGame, animation: ServerAnimation): void {
		game.players.forEach((playerGroup) => {
			this.triggerAnimationForPlayers(playerGroup.players, animation)
		})
	},

	createAnimationThread(game: ServerGame): void {
		game.players.forEach((playerGroup) => {
			this.createAnimationThreadForPlayerGroup(playerGroup, true)
		})
	},

	createInstantAnimationThread(game: ServerGame): void {
		game.players.forEach((playerGroup) => {
			this.createAnimationThreadForPlayerGroup(playerGroup, false)
		})
	},

	commitAnimationThread(game: ServerGame): void {
		game.players.forEach((playerGroup) => {
			this.commitAnimationThreadForPlayerGroup(playerGroup)
		})
	},

	triggerAnimationForPlayers(
		players: (ServerPlayerInGame | ServerPlayerSpectator)[] | ServerPlayerGroup,
		animation: ServerAnimation
	): void {
		players = players instanceof ServerPlayerGroup ? players.players : players
		players.forEach((playerInGame) =>
			playerInGame.player.sendGameMessage({
				type: AnimationMessageType.PLAY,
				data: new AnimationMessage(animation),
			})
		)
	},

	createAnimationThreadForPlayerGroup(playerGroup: ServerPlayerGroup, isStaggered: boolean): void {
		playerGroup.players.forEach((playerInGame) => {
			playerInGame.player.sendGameMessage({
				type: AnimationMessageType.THREAD_CREATE,
				data: new AnimationThreadStartMessage(isStaggered),
				skipQueue: true,
			})
			playerInGame.player.sendGameMessage({
				type: AnimationMessageType.THREAD_START,
				data: new AnimationThreadStartMessage(isStaggered),
				allowBatching: true,
				ignoreWorkerThreads: true,
			})
		})
	},

	commitAnimationThreadForPlayerGroup(playerGroup: ServerPlayerGroup): void {
		playerGroup.players.forEach((playerInGame) =>
			playerInGame.player.sendGameMessage({
				type: AnimationMessageType.THREAD_COMMIT,
				data: null,
				skipQueue: true,
			})
		)
	},

	executeMessageQueue(game: ServerGame): void {
		game.players
			.flatMap((playerGroup) => playerGroup.players)
			.forEach((playerInGame) => this.executeMessageQueueForPlayer(game, playerInGame.player))
	},

	executeMessageQueueForPlayer(game: ServerGame, player: ServerPlayer): void {
		player.sendGameMessage({
			type: AnimationMessageType.EXECUTE_QUEUE,
			data: null,
			skipQueue: true,
		})
	},
}
