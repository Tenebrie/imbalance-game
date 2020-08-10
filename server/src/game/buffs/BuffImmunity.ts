import ServerBuff from '../models/ServerBuff'
import BuffStackType from '@shared/enums/BuffStackType'
import ServerDamageInstance from '../models/ServerDamageSource'
import ServerGame from '../models/ServerGame'
import GameHookType, {CardTakesDamageHookArgs, CardTakesDamageHookValues} from '../models/GameHookType'
import CardFeature from '@shared/enums/CardFeature'

export default class BuffImmunity extends ServerBuff {
	constructor(game: ServerGame) {
		super(game, BuffStackType.OVERLAY)
		this.cardFeatures = [CardFeature.UNTARGETABLE]

		this.createHook<CardTakesDamageHookValues, CardTakesDamageHookArgs>(GameHookType.CARD_TAKES_DAMAGE)
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
