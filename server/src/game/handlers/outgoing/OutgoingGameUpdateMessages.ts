import GameTurnPhase from '@shared/enums/GameTurnPhase'
import ServerPlayer from '../../players/ServerPlayer'

export default {
	notifyAboutPhaseAdvance: (player: ServerPlayer, phase: GameTurnPhase) => {
		player.sendMessage({
			type: 'update/game/phase',
			data: phase,
			highPriority: true
		})
	}
}
