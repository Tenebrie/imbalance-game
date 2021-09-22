import StoryCharacter from '@shared/enums/StoryCharacter'
import { NovelMessageType } from '@shared/models/network/messageHandlers/ServerToClientGameMessages'
import NovelCue from '@shared/models/novel/NovelCue'
import NovelCueMessage from '@shared/models/novel/NovelCueMessage'
import NovelMoveAction from '@shared/models/novel/NovelMoveAction'
import NovelResponseMessage from '@shared/models/novel/NovelResponseMessage'
import OutgoingAnimationMessages from '@src/game/handlers/outgoing/OutgoingAnimationMessages'
import ServerAnimation from '@src/game/models/ServerAnimation'
import ServerPlayerGroup from '@src/game/players/ServerPlayerGroup'

export default {
	notifyAboutDialogStarted(playerGroup: ServerPlayerGroup): void {
		playerGroup.players.forEach((playerInGame) =>
			playerInGame.player.sendGameMessage({
				type: NovelMessageType.START,
				data: null,
			})
		)
	},

	notifyAboutDialogCue(playerGroup: ServerPlayerGroup, cue: NovelCue): void {
		playerGroup.players.forEach((playerInGame) => {
			playerInGame.player.sendGameMessage({
				type: NovelMessageType.SAY,
				data: new NovelCueMessage(cue),
			})
		})
		OutgoingAnimationMessages.triggerAnimationForPlayers(playerGroup.players, ServerAnimation.delay(3600000))
	},

	notifyAboutDialogMove(playerGroup: ServerPlayerGroup, moveAction: NovelMoveAction): void {
		playerGroup.players.forEach((playerInGame) =>
			playerInGame.player.sendGameMessage({
				type: NovelMessageType.MOVE,
				data: moveAction,
			})
		)
	},

	notifyAboutDialogCuesCleared(playerGroup: ServerPlayerGroup): void {
		playerGroup.players.forEach((playerInGame) =>
			playerInGame.player.sendGameMessage({
				type: NovelMessageType.CLEAR,
				data: null,
			})
		)
	},

	notifyAboutDialogResponse(playerGroup: ServerPlayerGroup, response: NovelResponseMessage): void {
		playerGroup.players.forEach((playerInGame) =>
			playerInGame.player.sendGameMessage({
				type: NovelMessageType.ADD_REPLY,
				data: response,
				allowBatching: true,
			})
		)
	},

	notifyAboutAddedDialogCharacter(playerGroup: ServerPlayerGroup, character: StoryCharacter): void {
		playerGroup.players.forEach((playerInGame) =>
			playerInGame.player.sendGameMessage({
				type: NovelMessageType.ADD_CHARACTER,
				data: character,
			})
		)
	},

	notifyAboutActiveDialogCharacter(playerGroup: ServerPlayerGroup, character: StoryCharacter | null): void {
		playerGroup.players.forEach((playerInGame) =>
			playerInGame.player.sendGameMessage({
				type: NovelMessageType.ACTIVATE_CHARACTER,
				data: character,
			})
		)
	},

	notifyAboutRemovedDialogCharacter(playerGroup: ServerPlayerGroup, character: StoryCharacter): void {
		playerGroup.players.forEach((playerInGame) =>
			playerInGame.player.sendGameMessage({
				type: NovelMessageType.REMOVE_CHARACTER,
				data: character,
			})
		)
	},

	notifyAboutDialogSegmentEnded(playerGroup: ServerPlayerGroup): void {
		playerGroup.players.forEach((playerInGame) =>
			playerInGame.player.sendGameMessage({
				type: NovelMessageType.CONTINUE,
				data: null,
			})
		)
	},

	notifyAboutDialogEnded(playerGroup: ServerPlayerGroup): void {
		playerGroup.players.forEach((playerInGame) =>
			playerInGame.player.sendGameMessage({
				type: NovelMessageType.END,
				data: null,
			})
		)
	},
}
