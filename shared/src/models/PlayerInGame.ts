import Player from './Player'
import CardHand from './CardHand'
import CardDeck from './CardDeck'
import Card from './Card'

export default interface PlayerInGame {
	player: Player
	leader: Card
	cardHand: CardHand
	cardDeck: CardDeck
	morale: number
	unitMana: number
	spellMana: number
}
