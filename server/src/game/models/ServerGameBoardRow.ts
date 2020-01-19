import ServerGame from './ServerGame'
import ServerCardOnBoard from './ServerCardOnBoard'
import ServerCard from './ServerCard'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import runCardEventHandler from '../utils/runCardEventHandler'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import Constants from '../shared/Constants'

export default class ServerGameBoardRow {
	game: ServerGame
	index: number
	cards: ServerCardOnBoard[]

	constructor(game: ServerGame, index: number) {
		this.game = game
		this.index = index
		this.cards = []
	}

	public playCard(card: ServerCard, owner: ServerPlayerInGame, ordinal: number): ServerCardOnBoard {
		const cardOnBoard = this.insertCard(card, owner, ordinal)
		runCardEventHandler(() => card.onPlayUnit(cardOnBoard, this))
		return cardOnBoard
	}

	public insertCard(card: ServerCard, owner: ServerPlayerInGame, ordinal: number): ServerCardOnBoard {
		const cardOnBoard = new ServerCardOnBoard(this.game, card, owner)
		this.cards.splice(ordinal, 0, cardOnBoard)
		this.game.players.forEach(playerInGame => {
			OutgoingMessageHandlers.notifyAboutUnitCreated(playerInGame.player, cardOnBoard, this.index, ordinal)
		})
		return cardOnBoard
	}

	public removeCard(targetCard: ServerCardOnBoard): void {
		this.cards = this.cards.filter(cardOnBoard => cardOnBoard !== targetCard)
		this.game.players.forEach(playerInGame => {
			OutgoingMessageHandlers.notifyAboutUnitDestroyed(playerInGame.player, targetCard)
		})
	}

	public isOwnedByPlayer(playerInGame: ServerPlayerInGame): boolean {
		const invertedBoard = this.game.players.indexOf(playerInGame) === 1

		return (invertedBoard && this.index < playerInGame.rowsOwned) || (!invertedBoard && this.index >= Constants.GAME_BOARD_ROW_COUNT - playerInGame.rowsOwned)
	}
}
