import ServerGame from './ServerGame'
import Constants from '../../shared/Constants'
import ServerCardOnBoard from './ServerCardOnBoard'
import GameBoard from '../../shared/models/GameBoard'
import ServerGameBoardRow from './ServerGameBoardRow'
import QueuedCardAttack from '../../models/game/QueuedCardAttack'

export default class ServerGameBoard extends GameBoard {
	public rows: ServerGameBoardRow[]
	public queuedAttacks: QueuedCardAttack[]

	constructor() {
		super()
		this.rows = []
		this.queuedAttacks = []
		for (let i = 0; i < Constants.GAME_BOARD_ROW_COUNT; i++) {
			this.rows.push(new ServerGameBoardRow())
		}
	}

	public findCardById(cardId: string): ServerCardOnBoard | null {
		const cards = this.rows.map(row => row.cards).flat()
		return cards.find(cardOnBoard => cardOnBoard.card.id === cardId) || null
	}

	public getAllCards() {
		return this.rows.map(row => row.cards).flat()
	}

	public advanceCardInitiative(game: ServerGame): void {
		const cards = this.getAllCards().filter(cardOnBoard => cardOnBoard.card.initiative > 0)
		cards.forEach(cardOnBoard => {
			const card = cardOnBoard.card
			const owner = cardOnBoard.owner
			card.setInitiative(game, owner, card.initiative - 1)
		})
	}

	public queueCardAttack(attacker: ServerCardOnBoard, target: ServerCardOnBoard): void {
		const queuedAttack = new QueuedCardAttack(attacker, target)
		this.queuedAttacks = this.queuedAttacks.filter(queuedAttack => queuedAttack.attacker !== attacker)
		this.queuedAttacks.push(queuedAttack)
	}

	public releaseQueuedAttacks(game: ServerGame): void {
		this.queuedAttacks.forEach(queuedAttack => {
			this.performCardAttack(game, queuedAttack.attacker, queuedAttack.target)
		})
		this.queuedAttacks = []
	}

	public performCardAttack(game: ServerGame, cardOnBoard: ServerCardOnBoard, targetOnBoard: ServerCardOnBoard): void {
		const damage = cardOnBoard.card.attack
		targetOnBoard.card.dealDamage(game, targetOnBoard.owner, damage)
		if (targetOnBoard.card.health <= 0) {
			targetOnBoard.card.destroy(game, targetOnBoard.owner)
		}
		cardOnBoard.card.setInitiative(game, cardOnBoard.owner, cardOnBoard.card.baseInitiative)
	}
}
