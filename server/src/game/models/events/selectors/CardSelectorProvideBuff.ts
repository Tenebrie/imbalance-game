import { BuffConstructor } from '../../ServerBuffContainer'
import { LeaderStatValueGetter } from '@src/utils/LeaderStats'

export type CardSelectorProvideBuff = {
	buff: BuffConstructor
	count: number | LeaderStatValueGetter
}
