import ServerBuff from '../models/ServerBuff'
import BuffStackType from '@shared/enums/BuffStackType'
import ServerGame from '../models/ServerGame'
import GameEventType from '@shared/enums/GameEventType'
import {TurnStartedEventArgs} from '../models/events/GameEventCreators'
import BuffAlignment from '@shared/enums/BuffAlignment'

export default class BuffDecayingArmor extends ServerBuff {
	constructor(game: ServerGame) {
		super(game, BuffStackType.ADD_INTENSITY)
		this.alignment = BuffAlignment.POSITIVE

		this.createCallback<TurnStartedEventArgs>(GameEventType.TURN_STARTED)
			.require(({ player }) => player === this.card.owner)
			.perform(() => this.onTurnStarted())
	}

	getMaxArmorOverride(baseValue: number): number {
		return baseValue + this.intensity
	}

	private onTurnStarted(): void {
		this.setIntensity(this.intensity - 1)
	}
}
