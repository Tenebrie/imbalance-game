import ServerBuff from '../models/ServerBuff'
import BuffStackType from '@shared/enums/BuffStackType'
import ServerGame from '../models/ServerGame'
import GameEventType from '@shared/enums/GameEventType'
import BuffAlignment from '@shared/enums/BuffAlignment'

export default class BuffStrength extends ServerBuff {
	constructor(game: ServerGame) {
		super(game, BuffStackType.ADD_INTENSITY)
		this.alignment = BuffAlignment.POSITIVE

		this.createEffect(GameEventType.BUFF_CREATED)
			.perform(() => this.onCreated())

		this.createEffect(GameEventType.BUFF_REMOVED)
			.perform(() => this.onDestroyed())
	}

	private onCreated(): void {
		this.card.setMaxPower(this.card.maxPower + 1)
		this.card.setPower(this.card.power + 1)
	}

	private onDestroyed(): void {
		this.card.setMaxPower(this.card.maxPower - 1)
	}
}
