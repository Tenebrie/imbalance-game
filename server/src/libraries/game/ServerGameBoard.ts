import ServerGame from './ServerGame'
import Constants from '../../shared/Constants'
import ServerCardOnBoard from './ServerCardOnBoard'
import GameBoard from '../../shared/models/GameBoard'
import ServerGameBoardRow from './ServerGameBoardRow'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import OutgoingMessageHandlers from '../../handlers/OutgoingMessageHandlers'

export default class ServerGameBoard extends GameBoard {
	rows: ServerGameBoardRow[]

	constructor() {
		super()
		this.rows = []
		for (let i = 0; i < Constants.GAME_BOARD_ROW_COUNT; i++) {
			this.rows.push(new ServerGameBoardRow())
		}
	}

	public findCardById(cardId: string): ServerCardOnBoard | null {
		const cards = this.rows.map(row => row.cards).flat()
		return cards.find(cardOnBoard => cardOnBoard.card.id === cardId) || null
	}

	public getAllCards() {
		return this.rows.map(row => row.cards).flat()
	}

	public advanceCardInitiative(game: ServerGame, targetPlayer: ServerPlayerInGame): void {
		const cards = this.getAllCards().filter(cardOnBoard => cardOnBoard.owner === targetPlayer).filter(cardOnBoard => cardOnBoard.card.initiative > 0)
		cards.forEach(cardOnBoard => {
			const card = cardOnBoard.card
			const owner = cardOnBoard.owner
			card.setInitiative(game, owner, card.initiative - 1)
		})
	}

	public performCardAttack(game: ServerGame, cardOnBoard: ServerCardOnBoard, targetOnBoard: ServerCardOnBoard): void {
		const damage = cardOnBoard.card.attack
		targetOnBoard.card.dealDamage(game, targetOnBoard.owner, damage)
		if (targetOnBoard.card.health <= 0) {
			targetOnBoard.card.destroy(game, targetOnBoard.owner)
		}
		cardOnBoard.card.setInitiative(game, cardOnBoard.owner, cardOnBoard.card.baseInitiative)
	}
}
