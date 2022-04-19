import Constants from '@shared/Constants'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import MoveDirection from '@shared/enums/MoveDirection'
import Board from '@shared/models/Board'
import UnitDestructionReason from '@src/enums/UnitDestructionReason'
import ServerPlayerGroup from '@src/game/players/ServerPlayerGroup'
import { getRandomArrayValue, toRowIndex } from '@src/utils/Utils'

import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import GameEventCreators from './events/GameEventCreators'
import GameHookType from './events/GameHookType'
import ServerAnimation from './ServerAnimation'
import ServerBoardOrders from './ServerBoardOrders'
import ServerBoardRow from './ServerBoardRow'
import ServerCard from './ServerCard'
import ServerGame from './ServerGame'
import ServerOwnedCard from './ServerOwnedCard'
import ServerUnit from './ServerUnit'

export default class ServerBoard implements Board {
	readonly game: ServerGame
	readonly rows: ServerBoardRow[]
	readonly orders: ServerBoardOrders
	readonly unitsBeingDestroyed: ServerUnit[]

	private readonly __insertedUnitList: ServerOwnedCard[] = []

	constructor(game: ServerGame) {
		this.game = game
		this.rows = []
		this.orders = new ServerBoardOrders(game)
		this.unitsBeingDestroyed = []
		for (let i = 0; i < game.ruleset.constants.GAME_BOARD_ROW_COUNT; i++) {
			this.rows.push(new ServerBoardRow(game, i))
		}
	}

	public findUnitById(cardId: string): ServerUnit | undefined {
		const cards = this.rows.flatMap((row) => row.cards)
		return cards.find((cardOnBoard) => cardOnBoard.card.id === cardId)
	}

	public isExtraUnitPlayableToRow(rowIndex: number): boolean {
		const rulesetConstants = this.game.ruleset.constants
		if (rowIndex < 0 || rowIndex >= rulesetConstants.GAME_BOARD_ROW_COUNT) {
			return false
		}
		return this.rows[rowIndex].cards.length < Constants.MAX_CARDS_PER_ROW
	}

	public getRowWithUnit(targetUnit: ServerUnit): ServerBoardRow | null {
		return this.rows.find((row) => !!row.cards.find((unit) => unit.card.id === targetUnit.card.id)) || null
	}

	public getControlledRows(playerOrGroup: ServerPlayerInGame | ServerPlayerGroup | null): ServerBoardRow[] {
		if (!playerOrGroup) {
			return []
		}
		const group = playerOrGroup instanceof ServerPlayerInGame ? playerOrGroup.group : playerOrGroup
		const rows = this.rows.filter((row) => row.owner === group)
		if (group.isInvertedBoard()) {
			rows.reverse()
		}
		return rows
	}

	public getAdjacentRows(targetRow: ServerBoardRow): ServerBoardRow[] {
		const adjacentRows = []
		if (targetRow.index > 0) {
			adjacentRows.push(this.game.board.rows[targetRow.index - 1])
		}
		const rulesetConstants = this.game.ruleset.constants
		if (targetRow.index < rulesetConstants.GAME_BOARD_ROW_COUNT - 1) {
			adjacentRows.push(this.game.board.rows[targetRow.index + 1])
		}
		return adjacentRows
	}

	public getTotalPlayerPower(playerGroup: ServerPlayerGroup | null): number {
		if (!playerGroup) {
			return 0
		}
		const passiveLeaders = this.game.ruleset.constants.PASSIVE_LEADERS
		const leaderPower = passiveLeaders
			? playerGroup.players
					.map((player) => player.leader)
					.filter((card) => !card.features.includes(CardFeature.APATHY))
					.map((card) => card.stats.power)
					.reduce((total, value) => total + value, 0)
			: 0
		const boardPower = this.getUnitsOwnedByGroup(playerGroup)
			.filter((unit) => !unit.card.features.includes(CardFeature.APATHY))
			.map((unit) => unit.card.stats.power)
			.reduce((total, value) => total + value, 0)
		return boardPower + leaderPower
	}

	public isPositionAdjacentToUnit(unit: ServerUnit, rowIndex: number, unitIndex: number): boolean {
		return unit.rowIndex === rowIndex && unitIndex <= unit.unitIndex + 1 && unitIndex >= unit.unitIndex
	}

	public getHorizontalUnitDistance(
		first: ServerUnit | { rowIndex: number; unitIndex: number; extraUnits?: number },
		second: ServerUnit | { rowIndex: number; unitIndex: number; extraUnits?: number }
	): number {
		return this.getHorizontalUnitDistanceForUnitCount(
			{
				rowIndex: first.rowIndex,
				unitIndex: first.unitIndex,
				unitCount: this.rows[first.rowIndex].cards.length + ('extraUnits' in first ? first.extraUnits ?? 0 : 0),
			},
			{
				rowIndex: second.rowIndex,
				unitIndex: second.unitIndex,
				unitCount: this.rows[second.rowIndex].cards.length + ('extraUnits' in second ? second.extraUnits ?? 0 : 0),
			}
		)
	}

	public getHorizontalUnitDistanceForUnitCount(
		first: { rowIndex: number; unitIndex: number; unitCount: number },
		second: { rowIndex: number; unitIndex: number; unitCount: number }
	): number {
		const firstOffsetFromCenter = first.unitIndex - (first.unitCount - 1) / 2
		const secondOffsetFromCenter = second.unitIndex - (second.unitCount - 1) / 2
		return Math.abs(firstOffsetFromCenter - secondOffsetFromCenter)
	}

	public getVerticalUnitDistance(
		firstUnit: ServerUnit | { rowIndex: number; unitIndex: number },
		secondUnit: ServerUnit | { rowIndex: number; unitIndex: number }
	): number {
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
		return this.rows.flatMap((row) => row.cards)
	}

	public getAllTargetableUnits(): ServerUnit[] {
		return this.getAllUnits().filter((unit) => !unit.card.features.includes(CardFeature.UNTARGETABLE))
	}

	public isUnitAdjacent(first: ServerUnit | null, second: ServerUnit | null): boolean {
		if (!first || !second) {
			return false
		}
		// return this.getHorizontalUnitDistance(first, second) <= 1 && first.rowIndex === second.rowIndex && first !== second
		return first.rowIndex === second.rowIndex && Math.abs(first.unitIndex - second.unitIndex) === 1
	}

	public getAdjacentUnits(reference: ServerUnit | { targetRow: ServerBoardRow; targetPosition: number } | null): ServerUnit[] {
		if (!reference) {
			return []
		}

		let row: ServerBoardRow
		let unitIndex: number
		let requiredDistances: number[]

		if (reference instanceof ServerUnit) {
			row = this.rows[reference.rowIndex]
			unitIndex = reference.unitIndex
			requiredDistances = [1]
		} else {
			row = reference.targetRow
			unitIndex = reference.targetPosition
			requiredDistances = [0, 1]
		}
		return row.cards.filter((card) => requiredDistances.includes(Math.abs(card.unitIndex - unitIndex)))
	}

	public getLeftAdjacentUnit(reference: ServerUnit | { targetRow: ServerBoardRow; targetPosition: number } | null): ServerUnit | null {
		if (!reference) {
			return null
		}
		const unitIndex = reference instanceof ServerUnit ? reference.unitIndex : reference.targetPosition
		const adjacentUnits = this.getAdjacentUnits(reference)
		return adjacentUnits.find((unit) => unit.unitIndex < unitIndex) || null
	}

	public getRightAdjacentUnit(reference: ServerUnit | { targetRow: ServerBoardRow; targetPosition: number } | null): ServerUnit | null {
		if (!reference) {
			return null
		}
		const unitIndex = reference instanceof ServerUnit ? reference.unitIndex : reference.targetPosition
		const adjacentUnits = this.getAdjacentUnits(reference)
		return adjacentUnits.find((unit) => unit.unitIndex > unitIndex) || null
	}

	public getOpposingUnits(thisUnit: ServerUnit): ServerUnit[] {
		return this.game.board
			.getUnitsOwnedByOpponent(thisUnit.card.ownerPlayer)
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

	public getClosestEnemyUnits(thisUnit: ServerUnit): ServerUnit[] {
		const enemyUnits = this.game.board.getUnitsOwnedByOpponent(thisUnit)
		const enemyUnitsWithDistance = enemyUnits
			.map((unit) => ({
				unit,
				distance: this.getHorizontalUnitDistance(unit, thisUnit) + this.getVerticalUnitDistance(unit, thisUnit) * 100,
			}))
			.sort((a, b) => a.distance - b.distance)

		if (enemyUnitsWithDistance.length === 0) {
			return []
		}

		const shortestDistance = enemyUnitsWithDistance[0].distance
		return enemyUnitsWithDistance.filter((unit) => unit.distance === shortestDistance).map((unitWithDistance) => unitWithDistance.unit)
	}

	public getRandomClosestEnemyUnit(thisUnit: ServerUnit): ServerUnit | null {
		const closestEnemyUnits = this.getClosestEnemyUnits(thisUnit)
		if (closestEnemyUnits.length === 0) {
			return null
		}
		return getRandomArrayValue(closestEnemyUnits)
	}

	public getUnitsOwnedByPlayer(owner: ServerPlayerInGame | null): ServerUnit[] {
		if (!owner) {
			return []
		}
		return this.getAllUnits().filter((unit) => unit.originalOwner === owner)
	}

	public getUnitsOwnedByGroup(owner: ServerPlayerGroup | null): ServerUnit[] {
		if (!owner) {
			return []
		}
		return this.getAllUnits().filter((unit) => unit.owner === owner)
	}

	public getUnitsOwnedByOpponent(context: ServerCard | ServerUnit | ServerPlayerInGame | ServerPlayerGroup | null): ServerUnit[] {
		if (!context) {
			return []
		}
		const playerGroup: ServerPlayerGroup =
			context instanceof ServerPlayerGroup
				? context
				: context instanceof ServerCard
				? context.ownerGroup
				: context instanceof ServerUnit
				? context.card.ownerGroup
				: context.group
		return this.getUnitsOwnedByGroup(playerGroup.opponent)
	}

	public getUnitsOfTribe(tribe: CardTribe, player: ServerPlayerGroup | null): ServerUnit[] {
		return this.getUnitsOwnedByGroup(player).filter((unit) => unit.card.tribes.includes(tribe))
	}

	public getMoveDirection(player: ServerPlayerGroup, from: ServerBoardRow, to: ServerBoardRow): MoveDirection {
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

	public rowMove(player: ServerPlayerGroup, fromRowIndex: number, direction: MoveDirection, distance: number): number {
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

		const rulesetConstants = this.game.ruleset.constants
		return Math.max(0, Math.min(fromRowIndex + distance * scalar, rulesetConstants.GAME_BOARD_ROW_COUNT - 1))
	}

	public getRowDistance(rowA: ServerBoardRow, rowB: ServerBoardRow): number {
		return Math.abs(rowA.index - rowB.index)
	}

	public getDistanceToFront(rowIndex: number): number {
		const targetRow = this.rows[rowIndex]
		const player = targetRow.owner
		let playerRows = this.rows.filter((row) => row.owner === player)
		if (player && player.isInvertedBoard()) {
			playerRows = playerRows.reverse()
		}
		return playerRows.indexOf(targetRow)
	}

	public getDistanceToDynamicFrontForPlayer(rowOrIndex: number | ServerBoardRow, player: ServerPlayerGroup): number {
		const rowIndex = toRowIndex(rowOrIndex)
		const targetRow = this.rows[rowIndex]
		const distanceToStaticFront = this.getDistanceToFront(rowIndex)
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

	/**
	 * @deprecated
	 */
	public getDistanceToFrontLegacy(player: ServerPlayerInGame | ServerPlayerGroup, rowOrIndex: number | ServerBoardRow): number {
		const row = typeof rowOrIndex === 'number' ? this.rows[rowOrIndex] : rowOrIndex
		if (player instanceof ServerPlayerInGame) {
			player = player.group
		}

		const isOpponent = row.owner !== player
		if (isOpponent) {
			player = player.opponent
		}

		let playerRows = this.rows.filter((row) => row.owner === player)
		if (player.isInvertedBoard()) {
			playerRows = playerRows.reverse()
		}

		const index = playerRows.indexOf(row)
		return isOpponent ? -index : index
	}

	public getRowWithDistanceToFront(player: ServerPlayerInGame | ServerPlayerGroup, distance: number): ServerBoardRow {
		const targetRow = this.getRowWithDistanceToFrontNullable(player, distance)
		if (!targetRow) {
			throw new Error(`No row owned by player at distance ${distance}!`)
		}
		return targetRow
	}

	public getRowWithDistanceToFrontNullable(player: ServerPlayerInGame | ServerPlayerGroup, distance: number): ServerBoardRow | null {
		if (player instanceof ServerPlayerInGame) {
			player = player.group
		}
		let playerRows = this.rows.filter((row) => row.owner === player)
		if (player.isInvertedBoard()) {
			playerRows = playerRows.reverse()
		}
		const targetRow = playerRows[Math.min(playerRows.length - 1, distance)]
		if (!targetRow) {
			return null
		}
		return targetRow
	}

	public getOppositeRow(rowOrIndex: ServerBoardRow | number): ServerBoardRow {
		const row = rowOrIndex instanceof ServerBoardRow ? rowOrIndex : this.rows[rowOrIndex]
		if (!row.owner) {
			throw new Error(`Row ${row.index} has no owner.`)
		}
		const relativeDistance = this.getDistanceToFront(row.index)
		return this.getControlledRows(row.owner.opponent)[relativeDistance]
	}

	public createUnit(card: ServerCard, createdBy: ServerPlayerInGame, rowIndex: number, unitIndex: number): ServerUnit | null {
		const targetRow = this.rows[rowIndex]
		return targetRow.createUnit(card, createdBy, unitIndex)
	}

	public get insertedUnitList(): ServerOwnedCard[] {
		return this.__insertedUnitList.slice()
	}

	public rememberInsertedUnit(card: ServerCard, owner: ServerPlayerInGame): void {
		this.__insertedUnitList.push(new ServerOwnedCard(card, owner))
	}

	public moveUnit(unit: ServerUnit, rowIndex: number, unitIndex: number, args?: { charmingPlayer: ServerPlayerInGame }): void {
		if (unit.rowIndex === rowIndex && unit.unitIndex === unitIndex) {
			return
		}

		const rulesetConstants = this.game.ruleset.constants
		if (rowIndex < 0 || rowIndex >= rulesetConstants.GAME_BOARD_ROW_COUNT) {
			return
		}

		const fromRow = this.rows[unit.rowIndex]
		const fromIndex = unit.unitIndex
		const targetRow = this.rows[rowIndex]

		if (targetRow.isFull()) {
			return
		}

		const adjustment = fromRow === targetRow && unit.unitIndex < unitIndex ? -1 : 0
		fromRow.removeUnitLocally(unit)

		const isCharming = targetRow.owner && fromRow.owner !== targetRow.owner
		const charmingPlayer = args?.charmingPlayer
		if (isCharming && !charmingPlayer) {
			throw new Error(`Attempting to charm a unit without specifying charming player!`)
		}

		const newUnit = isCharming && charmingPlayer ? new ServerUnit(this.game, unit.card, charmingPlayer.group, charmingPlayer) : unit

		targetRow.insertUnitLocally(newUnit, unitIndex + adjustment)
		OutgoingMessageHandlers.notifyAboutUnitMoved(newUnit)

		this.game.animation.play(ServerAnimation.unitMove())
		this.game.events.postEvent(
			GameEventCreators.unitMoved({
				game: this.game,
				triggeringUnit: newUnit,
				fromRow: fromRow,
				fromIndex: fromIndex,
				toRow: this.rows[newUnit.rowIndex],
				toIndex: newUnit.unitIndex,
				distance: this.getRowDistance(fromRow, targetRow),
				direction: this.getMoveDirection(newUnit.owner, fromRow, targetRow),
			})
		)
	}

	public moveUnitForward(unit: ServerUnit, distance = 1): void {
		if (this.getDistanceToFront(unit.rowIndex) === 0) {
			return
		}
		this.moveUnitToFarRight(unit, this.game.board.rowMove(unit.owner, unit.rowIndex, MoveDirection.FORWARD, distance))
	}

	public moveUnitBack(unit: ServerUnit, distance = 1): void {
		const rowsOwnedByPlayer = this.rows.filter((row) => row.owner === unit.owner).length
		if (this.getDistanceToFront(unit.rowIndex) === rowsOwnedByPlayer - 1) {
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
	public destroyUnit(
		unit: ServerUnit,
		args: Partial<{
			reason?: UnitDestructionReason
			destroyer?: ServerCard
			affectedCards?: ServerCard[]
		}> = {}
	): void {
		if (this.unitsBeingDestroyed.includes(unit)) {
			return
		}

		this.unitsBeingDestroyed.push(unit)

		const card = unit.card
		const reason = args.reason ?? UnitDestructionReason.CARD_EFFECT

		const hookValues = this.game.events.applyHooks(
			GameHookType.UNIT_DESTROYED,
			{
				destructionPrevented: false,
			},
			{
				targetUnit: unit,
				reason,
			}
		)
		if (hookValues.destructionPrevented) {
			card.stats.power = 0
			this.unitsBeingDestroyed.splice(this.unitsBeingDestroyed.indexOf(unit), 1)
			return
		}

		if (args.destroyer) {
			this.game.animation.play(ServerAnimation.cardAffectsCards(args.destroyer, [unit.card]))
		}

		const destroyEventArgs = {
			game: this.game,
			triggeringCard: unit.card,
			triggeringUnit: unit,
			destroyer: args.destroyer || null,
			owner: unit.originalOwner,
			rowIndex: unit.rowIndex,
			unitIndex: unit.unitIndex,
			reason,
		}

		this.game.events.postEvent(GameEventCreators.unitDestroyed(destroyEventArgs))

		if (args.affectedCards) {
			this.game.animation.play(ServerAnimation.unitDestroyWithAffect(card, args.affectedCards))
		} else {
			this.game.animation.play(ServerAnimation.unitDestroy(card))
		}
		this.removeUnit(unit)

		this.game.events.postEvent(GameEventCreators.afterUnitDestroyed(destroyEventArgs))

		if (!card.tribes.includes(CardTribe.DOOMED)) {
			if (card.features.includes(CardFeature.HERO_POWER)) {
				card.cleanse()
				// card.stats.power = card.stats.basePower
				unit.originalOwner.cardDeck.addSpellToTop(card)
			} else if (card.type === CardType.UNIT) {
				unit.originalOwner.cardGraveyard.addUnit(card)
			} else if (card.type === CardType.SPELL) {
				unit.originalOwner.cardGraveyard.addSpell(card)
			}
		}

		this.unitsBeingDestroyed.splice(this.unitsBeingDestroyed.indexOf(unit), 1)
	}
}
