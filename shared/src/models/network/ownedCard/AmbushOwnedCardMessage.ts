import OwnedCard from '../../OwnedCard'
import AmbushCardMessage from '../card/AmbushCardMessage'
import PlayerInGameRefMessage from '../playerInGame/PlayerInGameRefMessage'
import OwnedCardMessage from './OwnedCardMessage'

export default class AmbushOwnedCardMessage implements OwnedCardMessage {
	card: AmbushCardMessage
	owner: PlayerInGameRefMessage

	constructor(ownedCard: OwnedCard) {
		this.card = new AmbushCardMessage(ownedCard.card)
		this.owner = new PlayerInGameRefMessage(ownedCard.owner)
	}
}
