import Unit from './Unit'
import PlayerInGame from './PlayerInGame'
import BuffContainer from './BuffContainer'
import PlayerGroup from './PlayerGroup'

export default interface BoardRow {
	index: number
	cards: Unit[]
	owner: PlayerGroup | null
	buffs: BuffContainer
}
