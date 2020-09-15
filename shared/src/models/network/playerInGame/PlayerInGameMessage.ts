import PlayerMessage from '../PlayerMessage'
import CardHandMessage from '../cardHand/CardHandMessage'
import CardDeckMessage from '../cardDeck/CardDeckMessage'

export default interface PlayerInGameMessage {
	player: PlayerMessage
	cardHand: CardHandMessage
	cardDeck: CardDeckMessage
	cardGraveyard: CardDeckMessage
	morale: number
	unitMana: number
	spellMana: number
}
