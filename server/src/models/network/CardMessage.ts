import ServerCard from '../game/ServerCard'
import Vector2D from '../../../../common/Vector2D'
import ServerPlayer from '../../libraries/players/ServerPlayer'

export default class CardMessage {
	id: string
	isOwner: boolean
	position: Vector2D
	cardClass: string

	constructor(card: ServerCard, isOwner: boolean) {
		this.id = card.id
		this.isOwner = isOwner
		this.position = card.position
		this.cardClass = card.cardClass
	}

	static fromCard(card: ServerCard, targetPlayer: ServerPlayer): CardMessage {
		const isOwner = card.owner.id === targetPlayer.id
		return new CardMessage(card, isOwner)
	}
}
