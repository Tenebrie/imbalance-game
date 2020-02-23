import ServerBuff from '../models/ServerBuff'
import BuffStackType from '../shared/enums/BuffStackType'

export default class BuffStrength extends ServerBuff {
	constructor() {
		super(BuffStackType.ADD_INTENSITY);
	}

	onTurnStarted(): void {
		this.addIntensity(-1)
	}

	onIntensityChanged(delta: number): void {
		this.unit.addHealthArmor(delta)
	}
}
