import ServerGame from './ServerGame'
import ServerCard from '../../models/game/ServerCard'
import ServerPlayerInGame from '../players/ServerPlayerInGame'

export default class ServerCardOnBoard {
	card: ServerCard
	owner: ServerPlayerInGame

	constructor(card: ServerCard, owner: ServerPlayerInGame) {
		this.card = card
		this.owner = owner

		card.attack = card.baseAttack
		card.health = card.baseHealth
		card.initiative = card.baseInitiative
	}

	canAttackAnyTarget(game: ServerGame): boolean {
		if (this.card.initiative > 0) {
			return false
		}

		const opponent = game.getOpponent(this.owner)
		if (!opponent) {
			return false
		}

		const allUnits = game.board.getAllCards()
		const opponentsUnits = allUnits.filter(cardOnBoard => cardOnBoard.owner === opponent)
		if (opponentsUnits.length === 0) {
			return false
		}

		return true
	}
}
