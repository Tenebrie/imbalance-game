import StoryCharacter from '@shared/enums/StoryCharacter'
import { NovelMessageType } from '@shared/models/network/messageHandlers/ServerToClientGameMessages'
import NovelCue from '@shared/models/novel/NovelCue'
import NovelCueMessage from '@shared/models/novel/NovelCueMessage'
import NovelMoveAction from '@shared/models/novel/NovelMoveAction'
import NovelResponseMessage from '@shared/models/novel/NovelResponseMessage'
import { Time } from '@shared/Utils'
import OutgoingAnimationMessages from '@src/game/handlers/outgoing/OutgoingAnimationMessages'
import ServerAnimation from '@src/game/models/ServerAnimation'
import ServerPlayerGroup from '@src/game/players/ServerPlayerGroup'
import ServerPlayerInGame from '@src/game/players/ServerPlayerInGame'
import ServerPlayerSpectator from '@src/game/players/ServerPlayerSpectator'

export default {
	notifyAboutDialogStarted(playerOrGroup: ServerPlayerInGame | ServerPlayerSpectator | ServerPlayerGroup): void {
		const players = playerOrGroup instanceof ServerPlayerGroup ? playerOrGroup.players : [playerOrGroup]
		players.forEach((playerInGame) =>
			playerInGame.player.sendGameMessage({
				type: NovelMessageType.START,
				data: null,
			})
		)
	},

	notifyAboutDialogCue(playerOrGroup: ServerPlayerInGame | ServerPlayerSpectator | ServerPlayerGroup, cue: NovelCue): void {
		const players = playerOrGroup instanceof ServerPlayerGroup ? playerOrGroup.players : [playerOrGroup]
		players.forEach((playerInGame) => {
			playerInGame.player.sendGameMessage({
				type: NovelMessageType.SAY,
				data: new NovelCueMessage(cue),
			})
		})
		OutgoingAnimationMessages.triggerAnimationForPlayers(players, ServerAnimation.delay(Time.minutes.toMilliseconds(60)))
	},

	notifyAboutLeftoverCue(playerOrGroup: ServerPlayerInGame | ServerPlayerSpectator | ServerPlayerGroup, cue: NovelCue): void {
		const players = playerOrGroup instanceof ServerPlayerGroup ? playerOrGroup.players : [playerOrGroup]
		players.forEach((playerInGame) => {
			playerInGame.player.sendGameMessage({
				type: NovelMessageType.SAY,
				data: new NovelCueMessage(cue),
			})
		})
	},

	notifyAboutDialogMove(playerOrGroup: ServerPlayerInGame | ServerPlayerSpectator | ServerPlayerGroup, moveAction: NovelMoveAction): void {
		const players = playerOrGroup instanceof ServerPlayerGroup ? playerOrGroup.players : [playerOrGroup]
		players.forEach((playerInGame) =>
			playerInGame.player.sendGameMessage({
				type: NovelMessageType.MOVE,
				data: moveAction,
			})
		)
	},

	notifyAboutDialogCuesCleared(playerOrGroup: ServerPlayerInGame | ServerPlayerSpectator | ServerPlayerGroup): void {
		const players = playerOrGroup instanceof ServerPlayerGroup ? playerOrGroup.players : [playerOrGroup]
		players.forEach((playerInGame) =>
			playerInGame.player.sendGameMessage({
				type: NovelMessageType.CLEAR,
				data: null,
				skipQueue: true,
			})
		)
	},

	notifyAboutDialogResponse(
		playerOrGroup: ServerPlayerInGame | ServerPlayerSpectator | ServerPlayerGroup,
		response: NovelResponseMessage
	): void {
		const players = playerOrGroup instanceof ServerPlayerGroup ? playerOrGroup.players : [playerOrGroup]
		players.forEach((playerInGame) =>
			playerInGame.player.sendGameMessage({
				type: NovelMessageType.ADD_REPLY,
				data: response,
				allowBatching: true,
			})
		)
	},

	notifyAboutAddedDialogCharacter(
		playerOrGroup: ServerPlayerInGame | ServerPlayerSpectator | ServerPlayerGroup,
		character: StoryCharacter
	): void {
		const players = playerOrGroup instanceof ServerPlayerGroup ? playerOrGroup.players : [playerOrGroup]
		players.forEach((playerInGame) =>
			playerInGame.player.sendGameMessage({
				type: NovelMessageType.ADD_CHARACTER,
				data: character,
			})
		)
	},

	notifyAboutActiveDialogCharacter(
		playerOrGroup: ServerPlayerInGame | ServerPlayerSpectator | ServerPlayerGroup,
		character: StoryCharacter | null
	): void {
		const players = playerOrGroup instanceof ServerPlayerGroup ? playerOrGroup.players : [playerOrGroup]
		players.forEach((playerInGame) =>
			playerInGame.player.sendGameMessage({
				type: NovelMessageType.ACTIVATE_CHARACTER,
				data: character,
			})
		)
	},

	notifyAboutRemovedDialogCharacter(
		playerOrGroup: ServerPlayerInGame | ServerPlayerSpectator | ServerPlayerGroup,
		character: StoryCharacter
	): void {
		const players = playerOrGroup instanceof ServerPlayerGroup ? playerOrGroup.players : [playerOrGroup]
		players.forEach((playerInGame) =>
			playerInGame.player.sendGameMessage({
				type: NovelMessageType.REMOVE_CHARACTER,
				data: character,
			})
		)
	},

	notifyAboutDialogSegmentEnded(playerOrGroup: ServerPlayerInGame | ServerPlayerSpectator | ServerPlayerGroup): void {
		const players = playerOrGroup instanceof ServerPlayerGroup ? playerOrGroup.players : [playerOrGroup]
		players.forEach((playerInGame) =>
			playerInGame.player.sendGameMessage({
				type: NovelMessageType.CONTINUE,
				data: null,
			})
		)
	},

	notifyAboutDialogEnded(playerOrGroup: ServerPlayerInGame | ServerPlayerSpectator | ServerPlayerGroup): void {
		const players = playerOrGroup instanceof ServerPlayerGroup ? playerOrGroup.players : [playerOrGroup]
		players.forEach((playerInGame) =>
			playerInGame.player.sendGameMessage({
				type: NovelMessageType.END,
				data: null,
			})
		)
	},

	notifyAboutDialogMuted(playerOrGroup: ServerPlayerInGame | ServerPlayerSpectator | ServerPlayerGroup): void {
		const players = playerOrGroup instanceof ServerPlayerGroup ? playerOrGroup.players : [playerOrGroup]
		players.forEach((playerInGame) =>
			playerInGame.player.sendGameMessage({
				type: NovelMessageType.MUTE,
				data: null,
			})
		)
	},

	notifyAboutCueAnimationSkipSync(players: (ServerPlayerInGame | ServerPlayerSpectator)[]): void {
		players.forEach((playerInGame) =>
			playerInGame.player.sendGameMessage({
				type: NovelMessageType.SKIP_CUE_ANIMATION,
				data: null,
				skipQueue: true,
			})
		)
	},

	notifyAboutNextCueSync(players: (ServerPlayerInGame | ServerPlayerSpectator)[]): void {
		players.forEach((playerInGame) =>
			playerInGame.player.sendGameMessage({
				type: NovelMessageType.NEXT_CUE,
				data: null,
				skipQueue: true,
			})
		)
	},
}
