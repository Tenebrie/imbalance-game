import CardHandMessage from '../cardHand/CardHandMessage'
import CardDeckMessage from '../cardDeck/CardDeckMessage'
import PlayerMessage from '../player/PlayerMessage'
import CardMessage from '../card/CardMessage'

export default interface PlayerInGameMessage {
	player: PlayerMessage
	cardHand: CardHandMessage
	cardDeck: CardDeckMessage
	cardGraveyard: CardDeckMessage
	leader: CardMessage
	unitMana: number
	spellMana: number
}
