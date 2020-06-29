import ServerBuff from '../models/ServerBuff'
import BuffStackType from '@shared/enums/BuffStackType'
import ServerDamageInstance from '../models/ServerDamageSource'
import ServerGame from '../models/ServerGame'
import GameHook, {CardTakesDamageHookArgs, CardTakesDamageHookValues} from '../models/GameHook'

export default class BuffImmunity extends ServerBuff {
	constructor(game: ServerGame) {
		super(game, BuffStackType.OVERLAY)

		this.createHook<CardTakesDamageHookValues, CardTakesDamageHookArgs>(GameHook.CARD_TAKES_DAMAGE)
			.require(({ targetCard }) => targetCard === this.card)
			.replace((args) => ({
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
