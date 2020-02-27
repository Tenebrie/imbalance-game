import ServerGame from './ServerGame'
import ServerCard from './ServerCard'
import BoardRow from '@shared/models/BoardRow'
import ServerUnit from './ServerUnit'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'

export default class ServerBoardRow extends BoardRow {
	game: ServerGame
	owner: ServerPlayerInGame | null
	cards: ServerUnit[]

	constructor(game: ServerGame, index: number) {
		super(index)
		this.game = game
		this.owner = null
		this.cards = []
	}

	public insertUnit(unit: ServerUnit, ordinal: number): void {
		this.cards.splice(ordinal, 0, unit)
		this.updateOwner()
	}

	public removeUnit(targetCard: ServerUnit): void {
		this.cards = this.cards.filter(cardOnBoard => cardOnBoard !== targetCard)
		this.updateOwner()
	}

	public destroyUnit(targetCard: ServerUnit): void {
		this.removeUnit(targetCard)
		this.game.players.forEach(playerInGame => {
			OutgoingMessageHandlers.notifyAboutUnitDestroyed(playerInGame.player, targetCard)
		})
		this.updateOwner()
	}

	public updateOwner(): void {
		const playerOneUnits = this.cards.filter(card => card.owner === this.game.players[0])
		const playerTwoUnits = this.cards.filter(card => card.owner === this.game.players[1])
		if (playerOneUnits.length === 0 && playerTwoUnits.length === 0) {
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

	public distanceTo(targetRow: ServerBoardRow): number {
		return Math.abs(this.index - targetRow.index)
	}
}
