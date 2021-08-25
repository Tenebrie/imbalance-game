import Card from './Card'
import Player from './Player'
import CardHand from './CardHand'
import CardDeck from './CardDeck'

export default interface PlayerInGame {
	player: Player
	leader: Card
	cardHand: CardHand
	cardDeck: CardDeck
	cardGraveyard: CardDeck
	unitMana: number
	spellMana: number
}
