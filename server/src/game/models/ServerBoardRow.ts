import ServerGame from './ServerGame'
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
	}

	public removeUnit(targetCard: ServerUnit): void {
		this.cards = this.cards.filter(cardOnBoard => cardOnBoard !== targetCard)
	}

	public destroyUnit(targetCard: ServerUnit): void {
		this.removeUnit(targetCard)
		this.game.players.forEach(playerInGame => {
			OutgoingMessageHandlers.notifyAboutUnitDestroyed(playerInGame.player, targetCard)
		})
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
