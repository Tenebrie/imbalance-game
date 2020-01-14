import ServerGame from './ServerGame'
import ServerCard from '../../models/game/ServerCard'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import runCardEventHandler from '../../utils/runCardEventHandler'

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

	dealDamage(damage: number): void {
		runCardEventHandler(() => this.card.onBeforeDamageTaken(this, damage))
		this.setPower(this.card.power - damage)
		runCardEventHandler(() => this.card.onAfterDamageTaken(this, damage))
		if (this.card.power <= 0) {
			this.destroy()
		} else {
			runCardEventHandler(() => this.card.onDamageSurvived(this, damage))
		}
	}

	setPower(value: number): void {
		this.card.setPower(this, value)
	}

	setAttack(value: number): void {
		this.card.setAttack(this, value)
	}

	destroy(): void {
		runCardEventHandler(() => this.card.onDestroyUnit(this))

		const otherCards = this.game.board.getAllCards().filter(cardOnBoard => cardOnBoard !== this)
		otherCards.forEach(cardOnBoard => {
			runCardEventHandler(() => cardOnBoard.card.onBeforeOtherUnitDestroyed(cardOnBoard, this))
		})
		this.game.board.removeCard(this)
		otherCards.forEach(cardOnBoard => {
			runCardEventHandler(() => cardOnBoard.card.onAfterOtherUnitDestroyed(cardOnBoard, this))
		})
	}

	getValidAttackTargets(): ServerCardOnBoard[] {
		const allCards = this.game.board.getAllCards()
		const opponent = this.game.getOpponent(this.owner)
		return allCards.filter(unit => unit.owner === opponent)
	}

	canAttackAnyTarget(): boolean {
		const opponent = this.game.getOpponent(this.owner)
		if (!opponent) {
			return false
		}

		const allUnits = this.game.board.getAllCards()
		const opponentsUnits = allUnits.filter(cardOnBoard => cardOnBoard.owner === opponent)
		if (opponentsUnits.length === 0) {
			return false
		}

		return true
	}
}
