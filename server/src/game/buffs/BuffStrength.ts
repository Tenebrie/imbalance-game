import ServerBuff from '../models/ServerBuff'
import BuffStackType from '@shared/enums/BuffStackType'
import ServerGame from '../models/ServerGame'
import GameEventType from '@shared/enums/GameEventType'

export default class BuffStrength extends ServerBuff {
	constructor(game: ServerGame) {
		super(game, BuffStackType.ADD_INTENSITY)

		this.createCallback(GameEventType.EFFECT_BUFF_CREATED)
			.perform(() => this.onCreated())

		this.createCallback(GameEventType.EFFECT_BUFF_REMOVED)
			.perform(() => this.onDestroyed())
	}

	private onCreated(): void {
		this.card.setPower(this.card.power + 1)
	}

	private onDestroyed(): void {
		if (this.card.power >= this.card.maxPower) {
			this.card.setPower(this.card.power - 1)
		}
	}

	getUnitMaxPowerOverride(basePower: number): number {
		return basePower + this.intensity
	}
}
