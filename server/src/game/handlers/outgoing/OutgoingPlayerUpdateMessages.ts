import ServerPlayer from '../../players/ServerPlayer'
import ServerPlayerInGame from '../../players/ServerPlayerInGame'
import PlayerInGameMessage from '../../shared/models/network/PlayerInGameMessage'
import HiddenPlayerInGameMessage from '../../shared/models/network/HiddenPlayerInGameMessage'
import ServerCardTarget from '../../models/ServerCardTarget'
import CardTargetMessage from '../../shared/models/network/CardTargetMessage'

export default {
	notifyAboutRequiredTarget(player: ServerPlayer, validTargets: ServerCardTarget[]) {
		const messages = validTargets.map(target => new CardTargetMessage(target))
		player.sendMessage({
			type: 'update/player/self/requiredTarget',
			data: messages,
			highPriority: true
		})
	},

	notifyAboutRequiredTargetAccepted(player: ServerPlayer) {
		player.sendMessage({
			type: 'update/player/self/requiredTargetAccepted',
			data: null,
			highPriority: true
		})
	},

	notifyAboutPlayerMoraleChange: (player: ServerPlayer, playerInGame: ServerPlayerInGame) => {
		player.sendMessage({
			type: 'update/player/self/morale',
			data: PlayerInGameMessage.fromPlayerInGame(playerInGame)
		})
	},

	notifyAboutOpponentMoraleChange: (player: ServerPlayer, playerInGame: ServerPlayerInGame) => {
		player.sendMessage({
			type: 'update/player/opponent/morale',
			data: HiddenPlayerInGameMessage.fromPlayerInGame(playerInGame)
		})
	},

	notifyAboutPlayerTimeBankChange: (player: ServerPlayer, playerInGame: ServerPlayerInGame, delta: number) => {
		player.sendMessage({
			type: 'update/player/self/timeUnits',
			data: PlayerInGameMessage.fromPlayerInGame(playerInGame),
			highPriority: delta < 0
		})
	},

	notifyAboutOpponentTimeBankChange: (player: ServerPlayer, playerInGame: ServerPlayerInGame) => {
		player.sendMessage({
			type: 'update/player/opponent/timeUnits',
			data: HiddenPlayerInGameMessage.fromPlayerInGame(playerInGame)
		})
	},

	notifyAboutTurnStarted: (player: ServerPlayer) => {
		player.sendMessage({
			type: 'update/player/self/turnStarted',
			data: null
		})
	},

	notifyAboutOpponentTurnStarted: (player: ServerPlayer) => {
		player.sendMessage({
			type: 'update/player/opponent/turnStarted',
			data: null
		})
	},

	notifyAboutTurnEnded: (player: ServerPlayer) => {
		player.sendMessage({
			type: 'update/player/self/turnEnded',
			data: null,
			highPriority: true
		})
	},

	notifyAboutOpponentTurnEnded: (player: ServerPlayer) => {
		player.sendMessage({
			type: 'update/player/opponent/turnEnded',
			data: null
		})
	},

	notifyAboutVictory: (player: ServerPlayer) => {
		player.sendMessage({
			type: 'update/player/self/victory',
			data: null
		})
	},

	notifyAboutDefeat: (player: ServerPlayer) => {
		player.sendMessage({
			type: 'update/player/self/defeat',
			data: null
		})
	}
}
