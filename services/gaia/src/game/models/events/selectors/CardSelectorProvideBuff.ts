import { ValueGetter } from '@src/utils/LeaderStats'

import { BuffConstructor } from '../../buffs/ServerBuffContainer'

export type CardSelectorProvideBuff = {
	buff: BuffConstructor
	count: number | ValueGetter
}
