import GroupOwnedCard from '@shared/models/GroupOwnedCard'
import ServerPlayerGroup from '@src/game/players/ServerPlayerGroup'

import ServerCard from './ServerCard'

export default class ServerGroupOwnedCard implements GroupOwnedCard {
	card: ServerCard
	owner: ServerPlayerGroup

	constructor(card: ServerCard, owner: ServerPlayerGroup) {
		this.card = card
		this.owner = owner
	}
}
