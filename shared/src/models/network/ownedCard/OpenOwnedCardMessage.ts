import OwnedCard from '../../OwnedCard'
import OwnedCardMessage from './OwnedCardMessage'
import OpenCardMessage from '../card/OpenCardMessage'
import PlayerInGameRefMessage from '../playerInGame/PlayerInGameRefMessage'

export default class OpenOwnedCardMessage implements OwnedCardMessage {
	card: OpenCardMessage
	owner: PlayerInGameRefMessage

	constructor(ownedCard: OwnedCard) {
		this.card = new OpenCardMessage(ownedCard.card)
		this.owner = new PlayerInGameRefMessage(ownedCard.owner)
	}
}
