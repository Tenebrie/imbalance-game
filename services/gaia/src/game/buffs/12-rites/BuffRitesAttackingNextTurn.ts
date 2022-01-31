import BuffAlignment from '@shared/enums/BuffAlignment'

import { BuffConstructorParams, ServerCardBuff } from '../../models/buffs/ServerBuff'

export default class BuffAttackingNextTurn extends ServerCardBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.POSITIVE,
		})

		this.createLocalization({
			en: {
				name: 'Attacks next turn',
				description: 'Will attack next turn.',
			},
		})
	}
}
