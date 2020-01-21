import ServerPlayer from '../../players/ServerPlayer'
import ServerPlayerInGame from '../../players/ServerPlayerInGame'
import PlayerInGameMessage from '../../shared/models/network/PlayerInGameMessage'
import HiddenPlayerInGameMessage from '../../shared/models/network/HiddenPlayerInGameMessage'

export default {
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

	notifyAboutPlayerTimeBankChange: (player: ServerPlayer, playerInGame: ServerPlayerInGame) => {
		player.sendMessage({
			type: 'update/player/self/timeUnits',
			data: PlayerInGameMessage.fromPlayerInGame(playerInGame)
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
			data: null
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
