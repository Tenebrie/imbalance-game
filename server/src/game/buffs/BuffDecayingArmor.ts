import ServerBuff from '../models/ServerBuff'
import BuffStackType from '@shared/enums/BuffStackType'
import ServerGame from '../models/ServerGame'
import GameEventType from '@shared/enums/GameEventType'
import {TurnStartedEventArgs} from '../models/GameEventCreators'

export default class BuffDecayingArmor extends ServerBuff {
	constructor(game: ServerGame) {
		super(game, BuffStackType.ADD_INTENSITY)

		this.createCallback<TurnStartedEventArgs>(GameEventType.TURN_STARTED)
			.require(({ player }) => player === this.card.owner)
			.perform(() => this.onTurnStarted())
	}

	private onTurnStarted(): void {
		this.addIntensity(-1)
	}

	onIntensityChanged(delta: number): void {
		this.unit.addHealthArmor(delta)
	}
}
