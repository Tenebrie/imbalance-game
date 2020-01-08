import CardOnBoard from '../../shared/models/CardOnBoard'
import ServerCard from '../../models/game/ServerCard'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import ServerCardOnBoard from './ServerCardOnBoard'

export default class ServerGameBoardRow {
	cards: CardOnBoard[]

	constructor() {
		this.cards = []
	}

	public insertCard(card: ServerCard, owner: ServerPlayerInGame, ordinal: number): ServerCardOnBoard {
		const cardOnBoard = new ServerCardOnBoard(card, owner)
		this.cards.splice(ordinal, 0, cardOnBoard)
		return cardOnBoard
	}

	public removeCard(targetCard: ServerCardOnBoard): void {
		this.cards = this.cards.filter(cardOnBoard => cardOnBoard !== targetCard)
	}
}
