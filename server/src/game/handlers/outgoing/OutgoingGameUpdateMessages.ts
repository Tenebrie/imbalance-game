import GameTurnPhase from '@shared/enums/GameTurnPhase'
import ServerPlayer from '../../players/ServerPlayer'
import ServerGame from '../../models/ServerGame'
import EventLogEntryMessage from '@shared/models/network/EventLogEntryMessage'

export default {
	notifyAboutPhaseAdvance: (player: ServerPlayer, phase: GameTurnPhase) => {
		player.sendMessage({
			type: 'update/game/phase',
			data: phase,
			highPriority: true
		})
	},

	sendLogMessageGroup: (game: ServerGame, messages: EventLogEntryMessage[]) => {
		game.players.forEach(playerInGame => {
			playerInGame.player.sendMessage({
				type: 'update/log/entry',
				data: messages
			})
		})
	}
}
