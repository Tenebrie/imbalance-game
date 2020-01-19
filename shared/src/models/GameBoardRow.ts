import CardOnBoard from './CardOnBoard'

export default class GameBoardRow {
	index: number
	cards: CardOnBoard[]

	constructor(index: number) {
		this.index = index
		this.cards = []
	}
}
