import CardMessage from './CardMessage'
import PlayerInGameMessage from './PlayerInGameMessage'
import OwnedCard from '../OwnedCard'

export default class OwnedCardMessage {
	card: CardMessage
	owner: PlayerInGameMessage

	constructor(ownedCard: OwnedCard) {
		this.card = CardMessage.fromCard(ownedCard.card)
		this.owner = PlayerInGameMessage.fromPlayerInGame(ownedCard.owner)
	}
}
