import BoardRow from './BoardRow'
import Buff from './Buff'
import Card from './Card'

export default interface BuffContainer {
	parent: Card | BoardRow
	buffs: Buff[]
}
