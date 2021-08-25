import ServerCard from './ServerCard'
import ServerPlayerGroup from '@src/game/players/ServerPlayerGroup'
import GroupOwnedCard from '@shared/models/GroupOwnedCard'

export default class ServerGroupOwnedCard implements GroupOwnedCard {
	card: ServerCard
	owner: ServerPlayerGroup

	constructor(card: ServerCard, owner: ServerPlayerGroup) {
		this.card = card
		this.owner = owner
	}
}
