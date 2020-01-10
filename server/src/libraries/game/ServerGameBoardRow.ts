import ServerCardOnBoard from './ServerCardOnBoard'
import ServerCard from '../../models/game/ServerCard'
import ServerPlayerInGame from '../players/ServerPlayerInGame'

export default class ServerGameBoardRow {
	cards: ServerCardOnBoard[]

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

	public findCardById(cardId: string): ServerCardOnBoard | null {
		return this.cards.find(cardOnBoard => cardOnBoard.card.id === cardId) || null
	}

	public removeCardById(cardId: string): void {
		const cardOnBoard = this.findCardById(cardId)
		if (!cardOnBoard) { return }

		this.cards.splice(this.cards.indexOf(cardOnBoard), 1)
	}
}
