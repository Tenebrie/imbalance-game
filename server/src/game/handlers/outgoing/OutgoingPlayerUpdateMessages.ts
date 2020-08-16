import ServerPlayer from '../../players/ServerPlayer'
import ServerPlayerInGame from '../../players/ServerPlayerInGame'
import PlayerInGameMessage from '@shared/models/network/PlayerInGameMessage'
import HiddenPlayerInGameMessage from '@shared/models/network/HiddenPlayerInGameMessage'
import ServerGame from '../../models/ServerGame'

export default {
	notifyAboutPlayerMoraleChange: (player: ServerPlayer, playerInGame: ServerPlayerInGame): void => {
		player.sendMessage({
			type: 'update/player/self/morale',
			data: PlayerInGameMessage.fromPlayerInGame(playerInGame)
		})
	},

	notifyAboutOpponentMoraleChange: (player: ServerPlayer, playerInGame: ServerPlayerInGame): void => {
		player.sendMessage({
			type: 'update/player/opponent/morale',
			data: HiddenPlayerInGameMessage.fromPlayerInGame(playerInGame)
		})
	},

	notifyAboutUnitManaChange: (playerInGame: ServerPlayerInGame, delta: number): void => {
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

	notifyAboutSpellManaChange: (playerInGame: ServerPlayerInGame, delta: number): void => {
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

	notifyAboutRoundStarted: (playerInGame: ServerPlayerInGame): void => {
		playerInGame.player.sendMessage({
			type: 'update/player/self/roundStarted',
			data: null
		})
		playerInGame.opponent.player.sendMessage({
			type: 'update/player/opponent/roundStarted',
			data: null
		})
	},

	notifyAboutTurnStarted: (playerInGame: ServerPlayerInGame): void => {
		playerInGame.player.sendMessage({
			type: 'update/player/self/turnStarted',
			data: null
		})
		playerInGame.opponent.player.sendMessage({
			type: 'update/player/opponent/turnStarted',
			data: null
		})
	},

	notifyAboutTurnEnded: (playerInGame: ServerPlayerInGame): void => {
		playerInGame.player.sendMessage({
			type: 'update/player/self/turnEnded',
			data: null,
			highPriority: true
		})
		playerInGame.opponent.player.sendMessage({
			type: 'update/player/opponent/turnEnded',
			data: null
		})
	},

	notifyAboutRoundEnded: (playerInGame: ServerPlayerInGame): void => {
		playerInGame.player.sendMessage({
			type: 'update/player/self/roundEnded',
			data: null,
			highPriority: true
		})
		playerInGame.opponent.player.sendMessage({
			type: 'update/player/opponent/roundEnded',
			data: null
		})
	},

	notifyAboutVictory: (player: ServerPlayer): void => {
		player.sendMessage({
			type: 'update/player/self/victory',
			data: null
		})
	},

	notifyAboutDefeat: (player: ServerPlayer): void => {
		player.sendMessage({
			type: 'update/player/self/defeat',
			data: null
		})
	},

	notifyAboutDraw: (game: ServerGame): void => {
		game.players.forEach(playerInGame => {
			playerInGame.player.sendMessage({
				type: 'update/player/self/draw',
				data: null
			})
		})
	}
}
