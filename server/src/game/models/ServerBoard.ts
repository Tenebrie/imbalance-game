import ServerGame from './ServerGame'
import Constants from '@shared/Constants'
import ServerUnit from './ServerUnit'
import Board from '@shared/models/Board'
import ServerBoardRow from './ServerBoardRow'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import ServerBoardOrders from './ServerBoardOrders'
import ServerCard from './ServerCard'
import Utils from '../../utils/Utils'
import MoveDirection from '@shared/enums/MoveDirection'
import GameEventCreators from './events/GameEventCreators'
import ServerAnimation from './ServerAnimation'
import BuffDuration from '@shared/enums/BuffDuration'
import GameHookType, { UnitDestroyedHookArgs, UnitDestroyedHookValues } from './events/GameHookType'
import BuffTutoredCard from '../buffs/BuffTutoredCard'
import CardFeature from '@shared/enums/CardFeature'
import CardType from '@shared/enums/CardType'

export default class ServerBoard implements Board {
	readonly game: ServerGame
	readonly rows: ServerBoardRow[]
	readonly orders: ServerBoardOrders
	readonly unitsBeingDestroyed: ServerUnit[]

	constructor(game: ServerGame) {
		this.game = game
		this.rows = []
		this.orders = new ServerBoardOrders(game)
		this.unitsBeingDestroyed = []
		for (let i = 0; i < Constants.GAME_BOARD_ROW_COUNT; i++) {
			this.rows.push(new ServerBoardRow(game, i))
		}
	}

	public findUnitById(cardId: string): ServerUnit | undefined {
		const cards = Utils.flat(this.rows.map((row) => row.cards))
		return cards.find((cardOnBoard) => cardOnBoard.card.id === cardId)
	}

	public isExtraUnitPlayableToRow(rowIndex: number): boolean {
		if (rowIndex < 0 || rowIndex >= Constants.GAME_BOARD_ROW_COUNT) {
			return false
		}
		return this.rows[rowIndex].cards.length < Constants.MAX_CARDS_PER_ROW
	}

	public getRowWithUnit(targetUnit: ServerUnit): ServerBoardRow | null {
		return this.rows.find((row) => !!row.cards.find((unit) => unit.card.id === targetUnit.card.id)) || null
	}

	public getAdjacentRows(targetRow: ServerBoardRow): ServerBoardRow[] {
		const adjacentRows = []
		if (targetRow.index > 0) {
			adjacentRows.push(this.game.board.rows[targetRow.index - 1])
		}
		if (targetRow.index < Constants.GAME_BOARD_ROW_COUNT - 1) {
			adjacentRows.push(this.game.board.rows[targetRow.index + 1])
		}
		return adjacentRows
	}

	public getTotalPlayerPower(playerInGame: ServerPlayerInGame | null): number {
		if (!playerInGame) {
			return 0
		}
		return this.getUnitsOwnedByPlayer(playerInGame)
			.map((unit) => unit.card.stats.power)
			.reduce((total, value) => total + value, 0)
	}

	public getHorizontalUnitDistance(first: ServerUnit, second: ServerUnit): number {
		const firstOffsetFromCenter = first.unitIndex - (this.rows[first.rowIndex].cards.length - 1) / 2
		const secondOffsetFromCenter = second.unitIndex - (this.rows[second.rowIndex].cards.length - 1) / 2
		return Math.abs(firstOffsetFromCenter - secondOffsetFromCenter)
	}

	public getVerticalUnitDistance(firstUnit: ServerUnit, secondUnit: ServerUnit): number {
		const firstUnitRowIndex = firstUnit.rowIndex
		const secondUnitRowIndex = secondUnit.rowIndex
		const smallIndex = Math.min(firstUnitRowIndex, secondUnitRowIndex)
		const largeIndex = Math.max(firstUnitRowIndex, secondUnitRowIndex)
		if (smallIndex === largeIndex) {
			return 0
		}

		const obstacleRows = []
		for (let i = smallIndex + 1; i < largeIndex; i++) {
			const row = this.rows[i]
			if (row.cards.length > 0) {
				obstacleRows.push(row)
			}
		}

		return obstacleRows.length + 1
	}

	public getAllUnits(): ServerUnit[] {
		return Utils.flat(this.rows.map((row) => row.cards))
	}

	public isUnitAdjacent(first: ServerUnit | null, second: ServerUnit | null): boolean {
		if (!first || !second) {
			return false
		}
		return this.getHorizontalUnitDistance(first, second) <= 1 && first.rowIndex === second.rowIndex && first !== second
	}

	public getAdjacentUnits(centerUnit: ServerUnit | null): ServerUnit[] {
		if (!centerUnit) {
			return []
		}
		return this.getAllUnits().filter((unit) => this.isUnitAdjacent(centerUnit, unit))
	}

	public getOpposingUnits(thisUnit: ServerUnit): ServerUnit[] {
		return this.game.board
			.getUnitsOwnedByOpponent(thisUnit.card.ownerInGame)
			.filter((unit) => this.game.board.getHorizontalUnitDistance(unit, thisUnit) < 1)
			.sort((a, b) => {
				return this.game.board.getVerticalUnitDistance(a, thisUnit) - this.game.board.getVerticalUnitDistance(b, thisUnit)
			})
	}

	public getClosestOpposingUnits(thisUnit: ServerUnit): ServerUnit[] {
		const opposingEnemies = this.getOpposingUnits(thisUnit)
		if (opposingEnemies.length === 0) {
			return []
		}
		const shortestDistance = this.getVerticalUnitDistance(opposingEnemies[0], thisUnit)
		return opposingEnemies.filter((unit) => this.getVerticalUnitDistance(unit, thisUnit) === shortestDistance)
	}

	public getUnitsOwnedByPlayer(owner: ServerPlayerInGame | null): ServerUnit[] {
		if (!owner) {
			return []
		}
		return this.getAllUnits().filter((unit) => unit.owner === owner)
	}

	public getUnitsOwnedByOpponent(context: ServerCard | ServerPlayerInGame | null): ServerUnit[] {
		if (!context) {
			return []
		}
		const player = context instanceof ServerCard ? context.ownerInGame : context
		if (!player) {
			return []
		}
		return this.getUnitsOwnedByPlayer(player.opponent)
	}

	public getMoveDirection(player: ServerPlayerInGame, from: ServerBoardRow, to: ServerBoardRow): MoveDirection {
		let direction = from.index - to.index
		if (player.isInvertedBoard()) {
			direction *= -1
		}
		if (direction > 0) {
			return MoveDirection.FORWARD
		} else if (direction < 0) {
			return MoveDirection.BACK
		} else {
			return MoveDirection.SIDE
		}
	}

	public rowMove(player: ServerPlayerInGame, fromRowIndex: number, direction: MoveDirection, distance: number): number {
		if (direction === MoveDirection.SIDE) {
			return fromRowIndex
		}

		let scalar = 1
		if (direction === MoveDirection.BACK) {
			scalar *= -1
		}
		if (!player.isInvertedBoard()) {
			scalar *= -1
		}

		return Math.max(0, Math.min(fromRowIndex + distance * scalar, Constants.GAME_BOARD_ROW_COUNT - 1))
	}

	public getRowDistance(rowA: ServerBoardRow, rowB: ServerBoardRow): number {
		return Math.abs(rowA.index - rowB.index)
	}

	public getDistanceToStaticFront(rowIndex: number): number {
		const targetRow = this.rows[rowIndex]
		const player = targetRow.owner
		let playerRows = this.rows.filter((row) => row.owner === player)
		if (player && player.isInvertedBoard()) {
			playerRows = playerRows.reverse()
		}
		return playerRows.indexOf(targetRow)
	}

	public getDistanceToDynamicFrontForPlayer(rowIndex: number, player: ServerPlayerInGame): number {
		const targetRow = this.rows[rowIndex]
		const distanceToStaticFront = this.getDistanceToStaticFront(rowIndex)
		if (player !== targetRow.owner) {
			return distanceToStaticFront
		}

		let result = distanceToStaticFront
		for (let i = 0; i < distanceToStaticFront; i++) {
			const potentialRow = this.getRowWithDistanceToFront(player, i)
			if (potentialRow.cards.length === 0) {
				result -= 1
			}
		}
		return result
	}

	public getRowWithDistanceToFront(player: ServerPlayerInGame, distance: number): ServerBoardRow {
		let playerRows = this.rows.filter((row) => row.owner === player)
		if (player.isInvertedBoard()) {
			playerRows = playerRows.reverse()
		}
		return playerRows[Math.min(playerRows.length - 1, distance)]
	}

	public createUnit(card: ServerCard, owner: ServerPlayerInGame, rowIndex: number, unitIndex: number): ServerUnit | null {
		const targetRow = this.rows[rowIndex]
		if (card.features.includes(CardFeature.SPY)) {
			owner = owner.opponentInGame
		}
		return targetRow.createUnit(card, owner, unitIndex)
	}

	public moveUnit(unit: ServerUnit, rowIndex: number, unitIndex: number): void {
		if (unit.rowIndex === rowIndex && unit.unitIndex === unitIndex) {
			return
		}

		if (rowIndex < 0 || rowIndex >= Constants.GAME_BOARD_ROW_COUNT) {
			return
		}

		const fromRow = this.rows[unit.rowIndex]
		const fromIndex = unit.unitIndex
		const targetRow = this.rows[rowIndex]

		if (fromRow.owner !== targetRow.owner || targetRow.cards.length >= Constants.MAX_CARDS_PER_ROW) {
			return
		}

		fromRow.removeUnitLocally(unit)
		targetRow.insertUnitLocally(unit, unitIndex)
		OutgoingMessageHandlers.notifyAboutUnitMoved(unit)

		this.game.animation.play(ServerAnimation.unitMove())
		this.game.events.postEvent(
			GameEventCreators.unitMoved({
				triggeringUnit: unit,
				fromRow: fromRow,
				fromIndex: fromIndex,
				toRow: this.rows[unit.rowIndex],
				toIndex: unit.unitIndex,
				distance: this.getRowDistance(fromRow, targetRow),
				direction: this.getMoveDirection(unit.owner, fromRow, targetRow),
			})
		)
	}

	public moveUnitForward(unit: ServerUnit, distance = 1): void {
		if (this.getDistanceToStaticFront(unit.rowIndex) === 0) {
			return
		}
		this.moveUnitToFarRight(unit, this.game.board.rowMove(unit.owner, unit.rowIndex, MoveDirection.FORWARD, distance))
	}

	public moveUnitBack(unit: ServerUnit, distance = 1): void {
		const rowsOwnedByPlayer = this.rows.filter((row) => row.owner === unit.owner).length
		if (this.getDistanceToStaticFront(unit.rowIndex) === rowsOwnedByPlayer - 1) {
			return
		}
		this.moveUnitToFarRight(unit, this.game.board.rowMove(unit.owner, unit.rowIndex, MoveDirection.BACK, distance))
	}

	public moveUnitToFarLeft(unit: ServerUnit, rowIndex: number): void {
		return this.moveUnit(unit, rowIndex, 0)
	}

	public moveUnitToFarRight(unit: ServerUnit, rowIndex: number): void {
		return this.moveUnit(unit, rowIndex, this.rows[rowIndex].cards.length)
	}

	public sapUnit(target: ServerUnit, sapper: ServerCard): void {
		const targetCard = target.card
		const cardOwner = target.card.owner
		if (!cardOwner) {
			return
		}

		this.rows[target.rowIndex].removeUnit(target)
		cardOwner.cardHand.addUnit(targetCard)
		if (cardOwner !== sapper.owner) {
			targetCard.isRevealed = false
			targetCard.reveal()
		}
		const buffDuration = cardOwner === sapper.owner ? BuffDuration.END_OF_THIS_TURN : BuffDuration.END_OF_NEXT_TURN
		targetCard.buffs.add(BuffTutoredCard, sapper, buffDuration)
	}

	/* Remove this unit from the board
	 * -------------------------------
	 * Target unit is removed from the board. Client is notified.
	 */
	public removeUnit(unit: ServerUnit): void {
		const rowWithCard = this.getRowWithUnit(unit)
		if (!rowWithCard) {
			console.error(`No row includes unit ${unit.card.id}`)
			return
		}

		rowWithCard.removeUnit(unit)
	}

	/* Destroy this unit
	 * -----------------
	 * Target unit is destroyed and removed from the board.
	 * The associated card is then cleansed and transferred to the owner's graveyard with 0 Power.
	 */
	public destroyUnit(unit: ServerUnit, destroyer?: ServerCard): void {
		if (this.unitsBeingDestroyed.includes(unit)) {
			return
		}

		this.unitsBeingDestroyed.push(unit)

		const card = unit.card

		const hookValues = this.game.events.applyHooks<UnitDestroyedHookValues, UnitDestroyedHookArgs>(
			GameHookType.UNIT_DESTROYED,
			{
				destructionPrevented: false,
			},
			{
				targetUnit: unit,
			}
		)
		if (hookValues.destructionPrevented) {
			card.stats.power = 0
			this.unitsBeingDestroyed.splice(this.unitsBeingDestroyed.indexOf(unit), 1)
			return
		}

		if (destroyer) {
			this.game.animation.play(ServerAnimation.cardAffectsCards(destroyer, [unit.card]))
		}

		this.game.events.postEvent(
			GameEventCreators.unitDestroyed({
				triggeringUnit: unit,
			})
		)

		card.cleanse()
		this.removeUnit(unit)

		if (card.features.includes(CardFeature.HERO_POWER)) {
			card.cleanse()
			card.stats.power = card.stats.basePower
			unit.owner.cardDeck.addSpellToTop(card)
		} else if (card.type === CardType.UNIT) {
			unit.owner.cardGraveyard.addUnit(card)
		} else if (card.type === CardType.SPELL) {
			unit.owner.cardGraveyard.addSpell(card)
		}

		this.unitsBeingDestroyed.splice(this.unitsBeingDestroyed.indexOf(unit), 1)
	}
}
