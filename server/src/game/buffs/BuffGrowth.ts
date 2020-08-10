import ServerBuff from '../models/ServerBuff'
import BuffStackType from '@shared/enums/BuffStackType'
import ServerGame from '../models/ServerGame'
import {TurnStartedEventArgs} from '../models/GameEventCreators'
import GameEventType from '@shared/enums/GameEventType'
import BuffDuration from '@shared/enums/BuffDuration'
import BuffStrength from './BuffStrength'

export default class BuffGrowth extends ServerBuff {
	constructor(game: ServerGame) {
		super(game, BuffStackType.ADD_INTENSITY)

		this.createCallback<TurnStartedEventArgs>(GameEventType.TURN_STARTED)
			.require(({ player }) => player === this.card.owner)
			.perform(() => this.onTurnStart())
	}

	private onTurnStart(): void {
		this.card.buffs.addMultiple(BuffStrength, this.intensity, this.card, BuffDuration.INFINITY)
	}
}
