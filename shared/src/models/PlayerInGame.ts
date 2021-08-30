import Card from './Card'
import CardDeck from './CardDeck'
import CardHand from './CardHand'
import Player from './Player'

export default interface PlayerInGame {
	player: Player
	leader: Card
	cardHand: CardHand
	cardDeck: CardDeck
	cardGraveyard: CardDeck
	unitMana: number
	spellMana: number
}
