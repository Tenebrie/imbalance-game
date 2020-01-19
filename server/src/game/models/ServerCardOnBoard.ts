import ServerGame from './ServerGame'
import ServerCard from './ServerCard'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import runCardEventHandler from '../utils/runCardEventHandler'
import ServerDamageInstance from './ServerDamageSource'
import ServerGameBoardRow from './ServerGameBoardRow'

export default class ServerCardOnBoard {
	game: ServerGame
	card: ServerCard
	owner: ServerPlayerInGame

	get rowIndex(): number {
		return this.game.board.rows.indexOf(this.game.board.getRowWithUnit(this)!)
	}

	get unitIndex(): number {
		return this.game.board.rows[this.rowIndex].cards.indexOf(this)
	}

	constructor(game: ServerGame, card: ServerCard, owner: ServerPlayerInGame) {
		this.game = game
		this.card = card
		this.owner = owner

		card.power = card.basePower
		card.attack = card.baseAttack
	}

	setPower(value: number): void {
		this.card.setPower(this, value)
	}

	setAttack(value: number): void {
		this.card.setAttack(this, value)
	}

	dealDamage(damage: ServerDamageInstance): void {
		this.dealDamageWithoutDestroying(damage)
		if (this.card.power <= 0) {
			this.destroy()
		}
	}

	dealDamageWithoutDestroying(damage: ServerDamageInstance): void {
		if (damage.value <= 0) {
			return
		}

		runCardEventHandler(() => this.card.onBeforeDamageTaken(this, damage))
		this.setPower(this.card.power - damage.value)
		runCardEventHandler(() => this.card.onAfterDamageTaken(this, damage))
		if (this.card.power > 0) {
			runCardEventHandler(() => this.card.onDamageSurvived(this, damage))
		}
	}

	heal(damage: ServerDamageInstance): void {
		if (damage.value <= 0) {
			return
		}

		this.setPower(Math.min(this.card.basePower, this.card.power + damage.value))
	}

	isDead(): boolean {
		return this.card.power <= 0
	}

	canAttackTarget(target: ServerCardOnBoard): boolean {
		const range = this.card.attackRange
		const distance = Math.abs(this.rowIndex - target.rowIndex)

		return this.owner !== target.owner && distance <= range
	}

	canMoveToRow(target: ServerGameBoardRow): boolean {
		const range = 1
		const distance = Math.abs(this.rowIndex - target.index)
		const opponentsUnits = target.cards.filter(unit => unit.owner === this.game.getOpponent(this.owner))

		return opponentsUnits.length === 0 && distance <= range
	}

	destroy(): void {
		runCardEventHandler(() => this.card.onDestroyUnit(this))

		const otherCards = this.game.board.getAllUnits().filter(cardOnBoard => cardOnBoard !== this)
		otherCards.forEach(cardOnBoard => {
			runCardEventHandler(() => cardOnBoard.card.onBeforeOtherUnitDestroyed(cardOnBoard, this))
		})
		this.game.board.removeCard(this)
		otherCards.forEach(cardOnBoard => {
			runCardEventHandler(() => cardOnBoard.card.onAfterOtherUnitDestroyed(cardOnBoard, this))
		})
	}
}
