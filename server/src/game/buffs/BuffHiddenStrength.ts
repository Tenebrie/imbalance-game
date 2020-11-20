import ServerBuff from '../models/ServerBuff'
import BuffStackType from '@shared/enums/BuffStackType'
import ServerGame from '../models/ServerGame'
import GameEventType from '@shared/enums/GameEventType'
import BuffAlignment from '@shared/enums/BuffAlignment'
import BuffFeature from '@shared/enums/BuffFeature'

export default class BuffStrength extends ServerBuff {
	constructor(game: ServerGame) {
		super(game, BuffStackType.ADD_INTENSITY)
		this.alignment = BuffAlignment.POSITIVE
		this.buffFeatures = [BuffFeature.SKIP_ANIMATION]

		this.createEffect(GameEventType.BUFF_CREATED)
			.perform(() => this.onCreated())
	}

	private onCreated(): void {
		this.card.stats.power = this.card.stats.power + 1
	}

	getMaxPowerOverride(baseValue: number): number {
		return baseValue + this.intensity
	}
}
