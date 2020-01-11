import GameTurnPhase from '../../shared/enums/GameTurnPhase'
import ServerPlayer from '../../libraries/players/ServerPlayer'
import GameTimeMessage from '../../shared/models/network/GameTimeMessage'

export default {
	notifyAboutPhaseAdvance: (player: ServerPlayer, phase: GameTurnPhase) => {
		player.sendMessage({
			type: 'update/game/phase',
			data: phase
		})
	},

	notifyAboutTimeAdvance: (player: ServerPlayer, currentTime: number, maximumTime: number) => {
		player.sendMessage({
			type: 'update/game/time',
			data: new GameTimeMessage(currentTime, maximumTime)
		})
	}
}
