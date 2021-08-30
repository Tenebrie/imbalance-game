import BuffContainer from './BuffContainer'
import PlayerGroup from './PlayerGroup'
import PlayerInGame from './PlayerInGame'
import Unit from './Unit'

export default interface BoardRow {
	index: number
	cards: Unit[]
	owner: PlayerGroup | null
	buffs: BuffContainer
}
