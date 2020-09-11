import OwnedCard from '../../OwnedCard'
import OwnedCardMessage from './OwnedCardMessage'
import OpenCardMessage from '../card/OpenCardMessage'
import OpenPlayerInGameMessage from '../playerInGame/OpenPlayerInGameMessage'

export default class OpenOwnedCardMessage implements OwnedCardMessage {
	card: OpenCardMessage
	owner: OpenPlayerInGameMessage

	constructor(ownedCard: OwnedCard) {
		this.card = new OpenCardMessage(ownedCard.card)
		this.owner = new OpenPlayerInGameMessage(ownedCard.owner)
	}
}
