import { NovelMessageType } from '@shared/models/network/messageHandlers/ServerToClientMessageTypes'
import NovelCue from '@shared/models/novel/NovelCue'
import NovelCueMessage from '@shared/models/novel/NovelCueMessage'
import NovelReply from '@shared/models/novel/NovelReply'
import NovelReplyMessage from '@shared/models/novel/NovelReplyMessage'
import StoryCharacter from '@src/../../shared/src/enums/StoryCharacter'
import ServerPlayerGroup from '@src/game/players/ServerPlayerGroup'

export default {
	notifyAboutDialogStarted(playerGroup: ServerPlayerGroup): void {
		playerGroup.players.forEach((playerInGame) =>
			playerInGame.player.sendMessage({
				type: NovelMessageType.START,
				data: null,
			})
		)
	},

	notifyAboutDialogCue(playerGroup: ServerPlayerGroup, cue: NovelCue): void {
		playerGroup.players.forEach((playerInGame) =>
			playerInGame.player.sendMessage({
				type: NovelMessageType.SAY,
				data: new NovelCueMessage(cue),
			})
		)
	},

	notifyAboutDialogCuesCleared(playerGroup: ServerPlayerGroup): void {
		playerGroup.players.forEach((playerInGame) =>
			playerInGame.player.sendMessage({
				type: NovelMessageType.CLEAR,
				data: null,
			})
		)
	},

	notifyAboutDialogReply(playerGroup: ServerPlayerGroup, reply: NovelReply): void {
		playerGroup.players.forEach((playerInGame) =>
			playerInGame.player.sendMessage({
				type: NovelMessageType.ADD_REPLY,
				data: new NovelReplyMessage(reply),
			})
		)
	},

	notifyAboutAddedDialogCharacter(playerGroup: ServerPlayerGroup, character: StoryCharacter): void {
		playerGroup.players.forEach((playerInGame) =>
			playerInGame.player.sendMessage({
				type: NovelMessageType.ADD_CHARACTER,
				data: character,
			})
		)
	},

	notifyAboutActiveDialogCharacter(playerGroup: ServerPlayerGroup, character: StoryCharacter | null): void {
		playerGroup.players.forEach((playerInGame) =>
			playerInGame.player.sendMessage({
				type: NovelMessageType.ACTIVATE_CHARACTER,
				data: character,
			})
		)
	},

	notifyAboutRemovedDialogCharacter(playerGroup: ServerPlayerGroup, character: StoryCharacter): void {
		playerGroup.players.forEach((playerInGame) =>
			playerInGame.player.sendMessage({
				type: NovelMessageType.REMOVE_CHARACTER,
				data: character,
			})
		)
	},

	notifyAboutDialogFinished(playerGroup: ServerPlayerGroup): void {
		playerGroup.players.forEach((playerInGame) =>
			playerInGame.player.sendMessage({
				type: NovelMessageType.FINISH,
				data: null,
			})
		)
	},
}
