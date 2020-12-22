import { BuffConstructor } from '../../ServerBuffContainer'
import { LeaderStatValueGetter } from '../../../../utils/LeaderStats'

export type CardSelectorProvideBuff = {
	buff: BuffConstructor
	count: number | LeaderStatValueGetter
}
