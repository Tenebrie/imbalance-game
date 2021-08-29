import OwnedCard from '@shared/models/OwnedCard'

import ServerPlayerInGame from '../players/ServerPlayerInGame'
import ServerCard from './ServerCard'

export default class ServerOwnedCard implements OwnedCard {
	card: ServerCard
	owner: ServerPlayerInGame

	constructor(card: ServerCard, owner: ServerPlayerInGame) {
		this.card = card
		this.owner = owner
	}
}
