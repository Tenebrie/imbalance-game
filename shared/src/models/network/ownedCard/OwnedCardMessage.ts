import CardMessage from '../card/CardMessage'
import PlayerInGameRefMessage from '../playerInGame/PlayerInGameRefMessage'

export default interface OwnedCardMessage {
	card: CardMessage
	owner: PlayerInGameRefMessage
}
