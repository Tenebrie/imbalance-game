import ServerGame from './ServerGame'
import ServerCard from '../../models/game/ServerCard'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import runCardEventHandler from '../../utils/runCardEventHandler'
import ServerDamageInstance from '../../models/ServerDamageSource'

export default class ServerCardOnBoard {
	game: ServerGame
	card: ServerCard
	owner: ServerPlayerInGame

	constructor(game: ServerGame, card: ServerCard, owner: ServerPlayerInGame) {
		this.game = game
		this.card = card
		this.owner = owner

		card.power = card.basePower
		card.attack = card.baseAttack
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

	setPower(value: number): void {
		this.card.setPower(this, value)
	}

	setAttack(value: number): void {
		this.card.setAttack(this, value)
	}

	isAlive(): boolean {
		return this.card.power > 0
	}

	isDead(): boolean {
		return this.card.power <= 0
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

	getValidAttackTargets(): ServerCardOnBoard[] {
		const allCards = this.game.board.getAllUnits()
		const opponent = this.game.getOpponent(this.owner)
		return allCards.filter(unit => unit.owner === opponent)
	}

	canAttackAnyTarget(): boolean {
		const opponent = this.game.getOpponent(this.owner)
		if (!opponent) {
			return false
		}

		const allUnits = this.game.board.getAllUnits()
		const opponentsUnits = allUnits.filter(cardOnBoard => cardOnBoard.owner === opponent)
		if (opponentsUnits.length === 0) {
			return false
		}

		return true
	}
}
