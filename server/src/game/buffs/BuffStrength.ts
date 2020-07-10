import ServerBuff from '../models/ServerBuff'
import BuffStackType from '@shared/enums/BuffStackType'
import ServerGame from '../models/ServerGame'

export default class BuffStrength extends ServerBuff {
	constructor(game: ServerGame) {
		super(game, BuffStackType.OVERLAY)
	}

	onCreated(): void {
		this.card.setPower(this.card.power + 1)
	}

	onDestroyed(): void {
		if (this.card.power >= this.card.maxPower) {
			this.card.setPower(this.card.power - 1)
		}
	}

	getUnitMaxPowerOverride(basePower: number): number {
		return basePower + 1
	}
}
