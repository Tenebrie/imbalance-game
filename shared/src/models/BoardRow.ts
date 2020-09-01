import Unit from './Unit'
import PlayerInGame from './PlayerInGame'

export default interface BoardRow {
	index: number
	cards: Unit[]
	owner: PlayerInGame | null
}
