import ServerGame from './ServerGame'
import BoardRow from '@shared/models/BoardRow'
import ServerUnit from './ServerUnit'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import Constants from '@shared/Constants'

export default class ServerBoardRow implements BoardRow {
	index: number
	game: ServerGame
	owner: ServerPlayerInGame | null
	cards: ServerUnit[]

	constructor(game: ServerGame, index: number) {
		this.index = index
		this.game = game
		this.owner = null
		this.cards = []
	}

	public isFull(): boolean {
		return this.cards.length === Constants.MAX_CARDS_PER_ROW
	}

	public insertUnitLocally(unit: ServerUnit, ordinal: number): void {
		this.cards.splice(ordinal, 0, unit)
	}

	public insertUnit(unit: ServerUnit, ordinal: number): void {
		this.insertUnitLocally(unit, ordinal)
		OutgoingMessageHandlers.notifyAboutUnitCreated(unit)
	}

	public removeUnitLocally(targetCard: ServerUnit): void {
		this.cards = this.cards.filter(cardOnBoard => cardOnBoard !== targetCard)
	}

	public removeUnit(unit: ServerUnit): void {
		this.removeUnitLocally(unit)
		OutgoingMessageHandlers.notifyAboutUnitDestroyed(unit)
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
}
