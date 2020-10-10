import Card from './Card'
import Player from './Player'
import CardHand from './CardHand'
import CardDeck from './CardDeck'

export default interface PlayerInGame {
	player: Player
	leader: Card | null
	cardHand: CardHand
	cardDeck: CardDeck
	cardGraveyard: CardDeck
	morale: number
	unitMana: number
	spellMana: number
}
