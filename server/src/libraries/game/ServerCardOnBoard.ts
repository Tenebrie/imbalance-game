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
}
