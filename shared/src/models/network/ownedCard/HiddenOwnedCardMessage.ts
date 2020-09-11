import OwnedCard from '../../OwnedCard'
import OwnedCardMessage from './OwnedCardMessage'
import HiddenCardMessage from '../card/HiddenCardMessage'
import HiddenPlayerInGameMessage from '../playerInGame/HiddenPlayerInGameMessage'

export default class HiddenOwnedCardMessage implements OwnedCardMessage {
	card: HiddenCardMessage
	owner: HiddenPlayerInGameMessage

	constructor(ownedCard: OwnedCard) {
		this.card = new HiddenCardMessage(ownedCard.card)
		this.owner = new HiddenPlayerInGameMessage(ownedCard.owner)
	}
}
