import ServerGame from './ServerGame'
import Constants from '../shared/Constants'
import ServerCardOnBoard from './ServerCardOnBoard'
import GameBoard from '../shared/models/GameBoard'
import ServerGameBoardRow from './ServerGameBoardRow'
import ServerAttackOrder from './ServerAttackOrder'
import runCardEventHandler from '../utils/runCardEventHandler'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import ServerDamageInstance from './ServerDamageSource'

export default class ServerGameBoard extends GameBoard {
	game: ServerGame
	rows: ServerGameBoardRow[]
	queuedAttacks: ServerAttackOrder[]

	constructor(game: ServerGame) {
		super()
		this.game = game
		this.rows = []
		this.queuedAttacks = []
		for (let i = 0; i < Constants.GAME_BOARD_ROW_COUNT; i++) {
			this.rows.push(new ServerGameBoardRow(game, i))
		}
	}

	public findCardById(cardId: string): ServerCardOnBoard | null {
		const cards = this.rows.map(row => row.cards).flat()
		return cards.find(cardOnBoard => cardOnBoard.card.id === cardId) || null
	}

	public getRowWithCard(targetUnit: ServerCardOnBoard): ServerGameBoardRow | null {
		return this.rows.find(row => !!row.cards.find(unit => unit.card.id === targetUnit.card.id)) || null
	}

	public removeCard(cardOnBoard: ServerCardOnBoard): void {
		const rowWithCard = this.getRowWithCard(cardOnBoard)
		if (!rowWithCard) {
			console.error(`No row includes card ${cardOnBoard.card.id}`)
			return
		}

		rowWithCard.removeCard(cardOnBoard)
	}

	public getAllUnits() {
		return this.rows.map(row => row.cards).flat()
	}

	public getUnitsOwnedByPlayer(owner: ServerPlayerInGame) {
		return this.getAllUnits().filter(unit => unit.owner === owner)
	}

	public queueCardAttack(attacker: ServerCardOnBoard, target: ServerCardOnBoard): void {
		const queuedAttack = new ServerAttackOrder(attacker, target)
		const isOrderClear = this.queuedAttacks.find(queuedAttack => queuedAttack.attacker === attacker && queuedAttack.target === target)
		this.queuedAttacks = this.queuedAttacks.filter(queuedAttack => queuedAttack.attacker !== attacker)
		if (!isOrderClear) {
			this.queuedAttacks.push(queuedAttack)
		}
		OutgoingMessageHandlers.sendAttackOrders(attacker.owner.player, this.queuedAttacks)
	}

	public releaseQueuedAttacks(): void {
		/* Before attacks */
		this.queuedAttacks.forEach(queuedAttack => {
			runCardEventHandler(() => queuedAttack.attacker.card.onBeforePerformingAttack(queuedAttack.attacker, queuedAttack.target))
			runCardEventHandler(() => queuedAttack.target.card.onBeforeBeingAttacked(queuedAttack.target, queuedAttack.attacker))
		})

		/* Attacks */
		this.queuedAttacks.forEach(queuedAttack => {
			this.performCardAttack(queuedAttack.attacker, queuedAttack.target)
		})

		/* Destroy killed units */
		const killedUnits = this.getAllUnits().filter(unit => unit.card.power <= 0)
		killedUnits.forEach(destroyedUnit => {
			destroyedUnit.destroy()
		})

		/* After attacks */
		const survivingAttackers = this.queuedAttacks.filter(attack => attack.attacker.card.power > 0)
		const survivingTargets = this.queuedAttacks.filter(attack => attack.target.card.power > 0)
		survivingAttackers.forEach(attack => {
			runCardEventHandler(() => attack.attacker.card.onAfterPerformingAttack(attack.attacker, attack.target))
		})
		survivingTargets.forEach(attack => {
			runCardEventHandler(() => attack.target.card.onAfterBeingAttacked(attack.target, attack.attacker))
		})

		this.queuedAttacks = []
		this.game.players.forEach(playerInGame => {
			OutgoingMessageHandlers.sendAttackOrders(playerInGame.player, this.queuedAttacks)
		})
	}

	public performCardAttack(attackingUnit: ServerCardOnBoard, targetUnit: ServerCardOnBoard): void {
		const attack = attackingUnit.card.attack
		targetUnit.dealDamageWithoutDestroying(ServerDamageInstance.fromUnit(attack, attackingUnit))
	}
}
