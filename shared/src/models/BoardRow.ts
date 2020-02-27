import Unit from './Unit'
import PlayerInGame from './PlayerInGame'

export default class BoardRow {
	index: number
	owner: PlayerInGame | null
	cards: Unit[]

	constructor(index: number) {
		this.index = index
		this.owner = null
		this.cards = []
	}
}
