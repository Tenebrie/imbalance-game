import ServerBuff from '../models/ServerBuff'
import BuffStackType from '@shared/enums/BuffStackType'
import ServerDamageInstance from '../models/ServerDamageSource'
import GameEvent, {CardTakesDamageEventOverrideArgs} from '../models/GameEvent'
import ServerGame from '../models/ServerGame'

export default class BuffImmunity extends ServerBuff {
	constructor(game: ServerGame) {
		super(game, BuffStackType.OVERLAY)

		this.subscribe<CardTakesDamageEventOverrideArgs>(GameEvent.CARD_TAKES_DAMAGE)
			.require(({ targetCard }) => targetCard === this.card)
			.override((args) => ({
				...args,
				damageInstance: this.getUpdatedDamageInstance(args.damageInstance)
			}))
	}

	private getUpdatedDamageInstance(damageInstance: ServerDamageInstance): ServerDamageInstance {
		const clone = damageInstance.clone()
		clone.value = 0
		return clone
	}
}
