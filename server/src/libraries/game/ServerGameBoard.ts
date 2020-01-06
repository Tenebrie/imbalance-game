import ServerGame from './ServerGame'
import Card from '../../shared/models/Card'
import Player from '../../shared/models/Player'
import GameBoard from '../../shared/models/GameBoard'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import OutgoingMessageHandlers from '../../handlers/OutgoingMessageHandlers'

export default class ServerGameBoard extends GameBoard {
	game: ServerGame

	constructor(game: ServerGame) {
		super()
		this.game = game
	}

	public playCard(card: Card, row: number, ordinal: number): void {
		/* Insert */
		this.rows[row].insertCard(card, ordinal)

		/* Notify */
		this.game.players.forEach((playerInGame: ServerPlayerInGame) => {
			OutgoingMessageHandlers.notifyAboutCardPlayed(playerInGame.player, card)
		})
	}

	public destroyCard(card: Card): void {
		/* Remove */
		const cardRow = this.getCardRow(card)
		cardRow.removeCard(card)

		/* Notify */
		this.game.players.forEach(playerInGame => {
			OutgoingMessageHandlers.notifyAboutCardDestroyed(playerInGame.player, card)
		})
	}

	public destroyAllCards(owner: Player): void {
		const cardsOnBoard = this.rows.map(row => row.cards).flat()
		const targetCards = cardsOnBoard.filter(cardOnBoard => cardOnBoard.owner === owner)
		targetCards.forEach(cardOnBoard => cardOnBoard.gameBoardRow.removeCard(cardOnBoard.card))
	}
}
