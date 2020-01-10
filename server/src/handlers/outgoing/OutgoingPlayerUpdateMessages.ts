import ServerPlayer from '../../libraries/players/ServerPlayer'
import ServerPlayerInGame from '../../libraries/players/ServerPlayerInGame'
import PlayerInGameMessage from '../../shared/models/network/PlayerInGameMessage'

export default {
	notifyAboutTimeBankChange: (player: ServerPlayer, playerInGame: ServerPlayerInGame) => {
		player.sendMessage({
			type: 'update/player/timeUnits',
			data: PlayerInGameMessage.fromPlayerInGame(playerInGame)
		})
	}
}
