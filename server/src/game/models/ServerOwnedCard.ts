import OwnedCard from '@shared/models/OwnedCard'
import ServerCard from './ServerCard'
import ServerPlayerInGame from '../players/ServerPlayerInGame'

export default class ServerOwnedCard implements OwnedCard {
	card: ServerCard
	owner: ServerPlayerInGame

	constructor(card: ServerCard, owner: ServerPlayerInGame) {
		this.card = card
		this.owner = owner
	}
}
