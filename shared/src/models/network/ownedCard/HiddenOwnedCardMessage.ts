import OwnedCard from '../../OwnedCard'
import HiddenCardMessage from '../card/HiddenCardMessage'
import PlayerInGameRefMessage from '../playerInGame/PlayerInGameRefMessage'
import OwnedCardMessage from './OwnedCardMessage'

export default class HiddenOwnedCardMessage implements OwnedCardMessage {
	card: HiddenCardMessage
	owner: PlayerInGameRefMessage

	constructor(ownedCard: OwnedCard) {
		this.card = new HiddenCardMessage(ownedCard.card)
		this.owner = new PlayerInGameRefMessage(ownedCard.owner)
	}
}
