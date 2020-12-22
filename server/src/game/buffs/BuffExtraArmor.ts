import ServerBuff from '../models/ServerBuff'
import BuffStackType from '@shared/enums/BuffStackType'
import ServerGame from '../models/ServerGame'
import GameEventType from '@shared/enums/GameEventType'
import BuffAlignment from '@shared/enums/BuffAlignment'

export default class BuffExtraArmor extends ServerBuff {
	constructor(game: ServerGame) {
		super(game, BuffStackType.ADD_INTENSITY)
		this.alignment = BuffAlignment.POSITIVE

		this.createEffect(GameEventType.BUFF_CREATED).perform(() => this.onCreated())
	}

	private onCreated(): void {
		this.card.stats.armor = this.card.stats.armor + 1
	}

	getMaxArmorOverride(baseValue: number): number {
		return baseValue + this.intensity
	}
}
