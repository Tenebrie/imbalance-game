import Unit from './Unit'
import PlayerInGame from './PlayerInGame'
import BuffContainer from './BuffContainer'

export default interface BoardRow {
	index: number
	cards: Unit[]
	owner: PlayerInGame | null
	buffs: BuffContainer
}
