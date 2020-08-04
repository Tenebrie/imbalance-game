import ServerBuff from '../models/ServerBuff'
import BuffStackType from '@shared/enums/BuffStackType'
import ServerGame from '../models/ServerGame'
import GameEventType from '@shared/enums/GameEventType'
import {TurnStartedEventArgs} from '../models/GameEventCreators'

export default class BuffDecayingArmor extends ServerBuff {
	constructor(game: ServerGame) {
		super(game, BuffStackType.ADD_INTENSITY)

		this.createEffect(GameEventType.BUFF_CREATED)
			.perform(() => this.onCreated())

		this.createEffect(GameEventType.BUFF_REMOVED)
			.perform(() => this.onDestroyed())

		this.createCallback<TurnStartedEventArgs>(GameEventType.TURN_STARTED)
			.require(({ player }) => player === this.card.owner)
			.perform(() => this.onTurnStarted())
	}

	private onCreated(): void {
		this.card.setMaxArmor(this.card.maxArmor + 1)
		this.card.setArmor(this.card.armor + 1)
	}

	private onDestroyed(): void {
		this.card.setMaxArmor(this.card.maxArmor - 1)
	}

	private onTurnStarted(): void {
		this.setIntensity(this.intensity - 1)
	}
}
