import CardMessage from '../card/CardMessage'
import CardDeckMessage from '../cardDeck/CardDeckMessage'
import CardHandMessage from '../cardHand/CardHandMessage'
import PlayerMessage from '../player/PlayerMessage'

export default interface PlayerInGameMessage {
	player: PlayerMessage
	cardHand: CardHandMessage
	cardDeck: CardDeckMessage
	cardGraveyard: CardDeckMessage
	leader: CardMessage
	unitMana: number
	spellMana: number
}
