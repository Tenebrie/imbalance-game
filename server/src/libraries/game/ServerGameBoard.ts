import ServerGame from './ServerGame'
import Constants from '../../shared/Constants'
import GameBoard from '../../shared/models/GameBoard'
import ServerGameBoardRow from './ServerGameBoardRow'
import ServerPlayerInGame from '../players/ServerPlayerInGame'

export default class ServerGameBoard extends GameBoard {
	game: ServerGame
	rows: ServerGameBoardRow[]

	constructor(game: ServerGame) {
		super()
		this.game = game
		this.rows = []
		for (let i = 0; i < Constants.GAME_BOARD_ROW_COUNT; i++) {
			this.rows.push(new ServerGameBoardRow())
		}
	}

	public getAllCards() {
		return this.rows.map(row => row.cards).flat()
	}

	public advanceCardInitiative(game: ServerGame, targetPlayer: ServerPlayerInGame): void {
		const cards = this.getAllCards().filter(cardOnBoard => cardOnBoard.owner === targetPlayer)
		cards.forEach(cardOnBoard => {
			const card = cardOnBoard.card
			card.initiative -= 1
		})

		const attackingCards = cards.filter(cardOnBoard => cardOnBoard.card.initiative === 0)
		attackingCards.forEach(cardOnBoard => {
			console.log(`Card ${cardOnBoard.card.cardClass} is doing an attacc!`)
			cardOnBoard.card.initiative = cardOnBoard.card.baseInitiative
		})
	}
}
