import Card from './Card'
import Buff from './Buff'
import BoardRow from './BoardRow'

export default interface BuffContainer {
	parent: Card | BoardRow
	buffs: Buff[]
}
