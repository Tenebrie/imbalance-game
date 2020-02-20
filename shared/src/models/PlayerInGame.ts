import Player from './Player'
import CardHand from './CardHand'
import CardDeck from './CardDeck'

export default interface PlayerInGame {
	player: Player
	cardHand: CardHand
	cardDeck: CardDeck
	morale: number
	unitMana: number
	spellMana: number
}
