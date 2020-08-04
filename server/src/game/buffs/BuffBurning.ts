import ServerBuff from '../models/ServerBuff'
import BuffStackType from '@shared/enums/BuffStackType'
import ServerDamageInstance from '../models/ServerDamageSource'
import ServerGame from '../models/ServerGame'
import {TurnStartedEventArgs} from '../models/GameEventCreators'
import GameEventType from '@shared/enums/GameEventType'

export default class BuffBurning extends ServerBuff {
	burnDamage = 1

	constructor(game: ServerGame) {
		super(game, BuffStackType.OVERLAY)

		this.createCallback<TurnStartedEventArgs>(GameEventType.TURN_STARTED)
			.require(({ player }) => player === this.card.owner)
			.perform(() => this.onTurnStarted())
	}

	private onTurnStarted(): void {
		this.card.dealDamage(ServerDamageInstance.fromCard(this.burnDamage, this.source))
	}
}
