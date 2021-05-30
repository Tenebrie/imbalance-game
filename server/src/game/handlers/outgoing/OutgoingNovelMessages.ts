import { NovelMessageType } from '@shared/models/network/messageHandlers/ServerToClientMessageTypes'
import StoryCharacter from '@src/../../shared/src/enums/StoryCharacter'
import ServerPlayerInGame from '@src/game/players/ServerPlayerInGame'
import NovelCue from '@shared/models/novel/NovelCue'
import NovelReply from '@shared/models/novel/NovelReply'
import NovelCueMessage from '@shared/models/novel/NovelCueMessage'
import NovelReplyMessage from '@shared/models/novel/NovelReplyMessage'

export default {
	notifyAboutDialogStarted(playerInGame: ServerPlayerInGame): void {
		playerInGame.player.sendMessage({
			type: NovelMessageType.START,
			data: null,
		})
	},

	notifyAboutDialogCue(playerInGame: ServerPlayerInGame, cue: NovelCue): void {
		playerInGame.player.sendMessage({
			type: NovelMessageType.SAY,
			data: new NovelCueMessage(cue),
		})
	},

	notifyAboutDialogCuesCleared(playerInGame: ServerPlayerInGame): void {
		playerInGame.player.sendMessage({
			type: NovelMessageType.CLEAR,
			data: null,
		})
	},

	notifyAboutDialogReply(playerInGame: ServerPlayerInGame, reply: NovelReply): void {
		playerInGame.player.sendMessage({
			type: NovelMessageType.ADD_REPLY,
			data: new NovelReplyMessage(reply),
		})
	},

	notifyAboutAddedDialogCharacter(playerInGame: ServerPlayerInGame, character: StoryCharacter): void {
		playerInGame.player.sendMessage({
			type: NovelMessageType.ADD_CHARACTER,
			data: character,
		})
	},

	notifyAboutActiveDialogCharacter(playerInGame: ServerPlayerInGame, character: StoryCharacter | null): void {
		playerInGame.player.sendMessage({
			type: NovelMessageType.ACTIVATE_CHARACTER,
			data: character,
		})
	},

	notifyAboutRemovedDialogCharacter(playerInGame: ServerPlayerInGame, character: StoryCharacter): void {
		playerInGame.player.sendMessage({
			type: NovelMessageType.REMOVE_CHARACTER,
			data: character,
		})
	},

	notifyAboutDialogFinished(playerInGame: ServerPlayerInGame): void {
		playerInGame.player.sendMessage({
			type: NovelMessageType.FINISH,
			data: null,
		})
	},
}
