import CardOnBoard from './CardOnBoard'
import PlayerInGame from './PlayerInGame'

export default class GameBoardRow {
	index: number
	owner: PlayerInGame | null
	cards: CardOnBoard[]

	constructor(index: number) {
		this.index = index
		this.owner = null
		this.cards = []
	}
}
