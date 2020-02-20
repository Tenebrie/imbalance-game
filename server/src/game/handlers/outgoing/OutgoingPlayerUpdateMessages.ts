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

	notifyAboutUnitManaChange: (playerInGame: ServerPlayerInGame, delta: number) => {
		playerInGame.player.sendMessage({
			type: 'update/player/self/unitMana',
			data: PlayerInGameMessage.fromPlayerInGame(playerInGame),
			highPriority: delta < 0
		})
		playerInGame.opponent.player.sendMessage({
			type: 'update/player/opponent/unitMana',
			data: HiddenPlayerInGameMessage.fromPlayerInGame(playerInGame)
		})
	},

	notifyAboutSpellManaChange: (playerInGame: ServerPlayerInGame, delta: number) => {
		playerInGame.player.sendMessage({
			type: 'update/player/self/spellMana',
			data: PlayerInGameMessage.fromPlayerInGame(playerInGame),
			highPriority: delta < 0
		})
		playerInGame.opponent.player.sendMessage({
			type: 'update/player/opponent/spellMana',
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
