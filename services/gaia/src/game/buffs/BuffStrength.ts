import BuffAlignment from '@shared/enums/BuffAlignment'
import BuffFeature from '@shared/enums/BuffFeature'
import GameEventType from '@shared/enums/GameEventType'

import { BuffConstructorParams, ServerRowBuff, ServerStackableCardBuff } from '../models/buffs/ServerBuff'

// Test
// Test
// Test
// Test
// Test
// Test
// Test
// Test// Test// Test// Test// Test// Test// Test// Test// Test// Test// Test// Test// Test// Test// Test

// Nothing

// Nothing

// Nothing

// Nothing

// Nothing

// Nothing

class T9E2ST extends ServerRowBuff {}
class T6E2ST extends ServerRowBuff {}
class T5E2ST extends ServerRowBuff {}
class T4E2ST extends ServerRowBuff {}
class T3E2ST extends ServerRowBuff {}
class T1E2ST extends ServerRowBuff {}
class T2E2ST extends ServerRowBuff {}

export default class BuffStrength extends ServerStackableCardBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.POSITIVE,
			features: [BuffFeature.INVISIBLE],
		})

		this.createEffect(GameEventType.CARD_BUFF_CREATED).perform(() => onCreated())
		const onCreated = () => {
			this.parent.stats.power = this.parent.stats.power + 1
		}

		this.createMaxPowerOverride().add(() => this.stacks)
	}
}
