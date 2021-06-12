import ServerGame from './ServerGame'
import BoardRow from '@shared/models/BoardRow'
import ServerUnit from './ServerUnit'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import Constants from '@shared/Constants'
import ServerCard from './ServerCard'
import ServerAnimation from './ServerAnimation'
import ServerGameEventCreators from './events/GameEventCreators'
import ServerBuffContainer from './buffs/ServerBuffContainer'

export default class ServerBoardRow implements BoardRow {
	public readonly index: number
	public readonly game: ServerGame

	public owner: ServerPlayerInGame | null
	public cards: ServerUnit[]
	public readonly buffs: ServerBuffContainer = new ServerBuffContainer(this)

	constructor(game: ServerGame, index: number) {
		this.index = index
		this.game = game
		this.owner = null
		this.cards = []
	}

	public isFull(): boolean {
		return this.cards.length === Constants.MAX_CARDS_PER_ROW
	}

	public get farRightUnitIndex(): number {
		return this.cards.length
	}

	public createUnit(card: ServerCard, unitIndex: number): ServerUnit | null {
		if (this.cards.length >= Constants.MAX_CARDS_PER_ROW) {
			return null
		}

		const unit = new ServerUnit(this.game, card, this.owner!)
		this.insertUnit(unit, unitIndex)

		/* Play deploy animation */
		this.game.animation.play(ServerAnimation.unitDeploy(card))

		this.game.events.postEvent(
			ServerGameEventCreators.unitCreated({
				game: this.game,
				triggeringUnit: unit,
			})
		)

		return unit
	}

	public insertUnitLocally(unit: ServerUnit, ordinal: number): void {
		this.cards.splice(ordinal, 0, unit)
	}

	private insertUnit(unit: ServerUnit, ordinal: number): void {
		this.insertUnitLocally(unit, ordinal)
		OutgoingMessageHandlers.notifyAboutUnitCreated(unit)
	}

	public removeUnitLocally(targetCard: ServerUnit): void {
		this.cards = this.cards.filter((cardOnBoard) => cardOnBoard !== targetCard)
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
		this.game.players.forEach((playerInGame) => {
			OutgoingMessageHandlers.notifyAboutRowOwnershipChanged(playerInGame.player, this)
		})
	}

	public getUnitsWithinHorizontalDistance(from: ServerUnit, distance: number): ServerUnit[] {
		return this.cards.filter((potentialTarget) => this.game.board.getHorizontalUnitDistance(potentialTarget, from) < distance)
	}
}
