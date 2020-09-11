import OwnedCard from '../../OwnedCard'

export default class OwnedCardRefMessage {
	public readonly cardId: string
	public readonly ownerId: string

	public constructor(ownedCard: OwnedCard) {
		this.cardId = ownedCard.card.id
		this.ownerId = ownedCard.owner.player.id
	}
}
