import ServerGame from './ServerGame'
import Constants from '../../shared/Constants'
import ServerCardOnBoard from './ServerCardOnBoard'
import GameBoard from '../../shared/models/GameBoard'
import ServerGameBoardRow from './ServerGameBoardRow'
import ServerQueuedCardAttack from '../../models/game/ServerQueuedCardAttack'
import runCardEventHandler from '../../utils/runCardEventHandler'

export default class ServerGameBoard extends GameBoard {
	game: ServerGame
	rows: ServerGameBoardRow[]
	queuedAttacks: ServerQueuedCardAttack[]

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
		return this.rows.find(row => !!row.cards.find(unit => unit.card.id === targetUnit.card.id))
	}

	public removeCard(cardOnBoard: ServerCardOnBoard): void {
		const rowWithCard = this.getRowWithCard(cardOnBoard)
		if (!rowWithCard) {
			console.error(`No row includes card ${cardOnBoard.card.id}`)
			return
		}

		rowWithCard.removeCard(cardOnBoard)
	}

	public getAllCards() {
		return this.rows.map(row => row.cards).flat()
	}

	public advanceCardInitiative(): void {
		const cards = this.getAllCards().filter(cardOnBoard => cardOnBoard.card.initiative > 0)
		cards.forEach(cardOnBoard => {
			cardOnBoard.setInitiative(cardOnBoard.card.initiative - 1)
		})
	}

	public queueCardAttack(attacker: ServerCardOnBoard, target: ServerCardOnBoard): void {
		const queuedAttack = new ServerQueuedCardAttack(attacker, target)
		this.queuedAttacks = this.queuedAttacks.filter(queuedAttack => queuedAttack.attacker !== attacker)
		this.queuedAttacks.push(queuedAttack)
	}

	public releaseQueuedAttacks(): void {
		this.queuedAttacks.forEach(queuedAttack => {
			runCardEventHandler(() => queuedAttack.attacker.card.onBeforePerformingAttack(queuedAttack.attacker))
			runCardEventHandler(() => queuedAttack.target.card.onBeforeBeingAttacked(queuedAttack.target))
		})
		this.queuedAttacks.forEach(queuedAttack => {
			this.performCardAttack(queuedAttack.attacker, queuedAttack.target)
		})
		const survivingAttackers = this.queuedAttacks.map(queuedAttack => queuedAttack.attacker).filter(cardOnBoard => cardOnBoard.card.health > 0)
		const survivingTargets = this.queuedAttacks.map(queuedAttack => queuedAttack.target).filter(cardOnBoard => cardOnBoard.card.health > 0)
		survivingAttackers.forEach(attacker => {
			runCardEventHandler(() => attacker.card.onAfterPerformingAttack(attacker))
		})
		survivingTargets.forEach(target => {
			runCardEventHandler(() => target.card.onAfterBeingAttacked(target))
		})
		this.queuedAttacks = []
	}

	public performCardAttack(cardOnBoard: ServerCardOnBoard, targetOnBoard: ServerCardOnBoard): void {
		const damage = cardOnBoard.card.attack
		cardOnBoard.setInitiative(cardOnBoard.card.baseInitiative)
		targetOnBoard.dealDamage(damage)
	}
}
