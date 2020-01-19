import ServerGame from './ServerGame'
import ServerCardOnBoard from './ServerCardOnBoard'
import ServerCard from './ServerCard'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import runCardEventHandler from '../utils/runCardEventHandler'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import Constants from '../shared/Constants'
import GameBoardRow from '../shared/models/GameBoardRow'

export default class ServerGameBoardRow extends GameBoardRow {
	game: ServerGame
	cards: ServerCardOnBoard[]

	constructor(game: ServerGame, index: number) {
		super(index)
		this.game = game
		this.cards = []
	}

	public playCard(card: ServerCard, owner: ServerPlayerInGame, ordinal: number): ServerCardOnBoard {
		const cardOnBoard = this.insertUnit(card, owner, ordinal)
		runCardEventHandler(() => card.onPlayUnit(cardOnBoard, this))
		return cardOnBoard
	}

	public insertUnit(card: ServerCard, owner: ServerPlayerInGame, ordinal: number): ServerCardOnBoard {
		const cardOnBoard = new ServerCardOnBoard(this.game, card, owner)
		this.cards.splice(ordinal, 0, cardOnBoard)
		this.game.players.forEach(playerInGame => {
			OutgoingMessageHandlers.notifyAboutUnitCreated(playerInGame.player, cardOnBoard, this.index, ordinal)
		})
		return cardOnBoard
	}

	public removeUnit(targetCard: ServerCardOnBoard): void {
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
