import ServerGame from './ServerGame'
import ServerCard from './ServerCard'
import ServerCardOnBoard from './ServerCardOnBoard'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import runCardEventHandler from '../utils/runCardEventHandler'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import GameBoardRow from '../shared/models/GameBoardRow'

export default class ServerGameBoardRow extends GameBoardRow {
	game: ServerGame
	owner: ServerPlayerInGame | null
	cards: ServerCardOnBoard[]

	constructor(game: ServerGame, index: number) {
		super(index)
		this.game = game
		this.owner = null
		this.cards = []
	}

	public createUnit(card: ServerCard, owner: ServerPlayerInGame, ordinal: number): ServerCardOnBoard {
		const unit = new ServerCardOnBoard(this.game, card, owner)
		this.insertUnit(unit, ordinal)
		this.game.players.forEach(playerInGame => {
			OutgoingMessageHandlers.notifyAboutUnitCreated(playerInGame.player, unit, this.index, ordinal)
		})
		return unit
	}

	public insertUnit(unit: ServerCardOnBoard, ordinal: number): void {
		this.cards.splice(ordinal, 0, unit)
		this.updateOwner()
	}

	public removeUnit(targetCard: ServerCardOnBoard): void {
		this.cards = this.cards.filter(cardOnBoard => cardOnBoard !== targetCard)
		this.updateOwner()
	}

	public destroyUnit(targetCard: ServerCardOnBoard): void {
		this.removeUnit(targetCard)
		this.game.players.forEach(playerInGame => {
			OutgoingMessageHandlers.notifyAboutUnitDestroyed(playerInGame.player, targetCard)
		})
		this.updateOwner()
	}

	public updateOwner(): void {
		const playerOneUnits = this.cards.filter(card => card.owner === this.game.players[0])
		const playerTwoUnits = this.cards.filter(card => card.owner === this.game.players[1])
		if (playerOneUnits.length > 0 && playerTwoUnits.length > 0) {
			this.setOwner(null)
		} else if (playerOneUnits.length > 0) {
			this.setOwner(this.game.players[0])
		} else if (playerTwoUnits.length > 0) {
			this.setOwner(this.game.players[1])
		}
	}

	public setOwner(player: ServerPlayerInGame | null): void {
		if (this.owner === player) {
			return
		}

		this.owner = player
		this.game.players.forEach(playerInGame => {
			OutgoingMessageHandlers.notifyAboutRowOwnershipChanged(playerInGame.player, this)
		})
	}

	public distanceTo(targetRow: ServerGameBoardRow): number {
		return Math.abs(this.index - targetRow.index)
	}
}
