import ServerBuff from '../models/ServerBuff'
import BuffStackType from '@shared/enums/BuffStackType'
import ServerGame from '../models/ServerGame'

export default class BuffDecayingArmor extends ServerBuff {
	constructor(game: ServerGame) {
		super(game, BuffStackType.ADD_INTENSITY)
	}

	onTurnStarted(): void {
		this.addIntensity(-1)
	}

	onIntensityChanged(delta: number): void {
		this.unit.addHealthArmor(delta)
	}
}
