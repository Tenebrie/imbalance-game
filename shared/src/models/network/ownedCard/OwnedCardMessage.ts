import CardMessage from '../card/CardMessage'
import PlayerInGameMessage from '../playerInGame/PlayerInGameMessage'

export default interface OwnedCardMessage {
	card: CardMessage
	owner: PlayerInGameMessage
}
