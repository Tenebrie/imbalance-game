import Constants from '@shared/Constants'
import CardFeature from '@shared/enums/CardFeature'
import BoardRow from '@shared/models/BoardRow'
import ServerPlayerGroup from '@src/game/players/ServerPlayerGroup'
import ServerPlayerInGame from '@src/game/players/ServerPlayerInGame'

import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import ServerBuffContainer from './buffs/ServerBuffContainer'
import ServerGameEventCreators from './events/GameEventCreators'
import ServerAnimation from './ServerAnimation'
import ServerCard from './ServerCard'
import ServerGame from './ServerGame'
import ServerUnit from './ServerUnit'

export default class ServerBoardRow implements BoardRow {
	public readonly index: number
	public readonly game: ServerGame

	public owner: ServerPlayerGroup | null
	public cards: ServerUnit[]
	public readonly buffs: ServerBuffContainer = new ServerBuffContainer(this)

	constructor(game: ServerGame, index: number) {
		this.index = index
		this.game = game
		this.owner = null
		this.cards = []
	}

	public get id(): string {
		return `row:${this.index}`
	}

	public isFull(): boolean {
		return this.cards.length === Constants.MAX_CARDS_PER_ROW
	}

	public isNotFull(): boolean {
		return !this.isFull()
	}

	public get farRightUnitIndex(): number {
		return this.cards.length
	}

	public createUnit(card: ServerCard, createdBy: ServerPlayerInGame, unitIndex: number): ServerUnit | null {
		if (this.cards.length >= Constants.MAX_CARDS_PER_ROW) {
			return null
		}

		const rowOwner = this.owner
		if (!rowOwner) {
			throw new Error('Attempting to create a unit on a neutral row!')
		}

		if (card.features.includes(CardFeature.SPY) && rowOwner !== createdBy.group) {
			createdBy = rowOwner.players[0]
		}

		const unit = new ServerUnit(this.game, card, rowOwner, createdBy)
		this.insertUnit(unit, unitIndex)

		/* Play deploy animation */
		this.game.animation.play(ServerAnimation.unitDeploy(card))

		this.game.events.postEvent(
			ServerGameEventCreators.unitCreated({
				game: this.game,
				owner: this.owner!,
				triggeringCard: unit.card,
				triggeringUnit: unit,
			})
		)

		return unit
	}

	public insertUnitLocally(unit: ServerUnit, ordinal: number): void {
		this.cards.splice(ordinal, 0, unit)
	}

	public insertUnit(unit: ServerUnit, ordinal: number): void {
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

	public setOwner(player: ServerPlayerGroup | null): void {
		if (this.owner === player) {
			return
		}

		this.owner = player
		this.game.players.forEach(() => {
			OutgoingMessageHandlers.notifyAboutRowOwnershipChanged(this)
		})
	}

	public getUnitsWithinHorizontalDistance(from: ServerUnit, distance: number): ServerUnit[] {
		return this.cards.filter((potentialTarget) => this.game.board.getHorizontalUnitDistance(potentialTarget, from) < distance)
	}
}
