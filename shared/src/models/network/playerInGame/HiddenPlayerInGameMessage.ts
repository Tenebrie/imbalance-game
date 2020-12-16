import PlayerInGame from '../../PlayerInGame'
import HiddenCardHandMessage from '../cardHand/HiddenCardHandMessage'
import HiddenCardDeckMessage from '../cardDeck/HiddenCardDeckMessage'
import PlayerInGameMessage from './PlayerInGameMessage'
import HiddenPlayerMessage from '../player/HiddenPlayerMessage'

export default class HiddenPlayerInGameMessage implements PlayerInGameMessage {
	player: HiddenPlayerMessage
	cardHand: HiddenCardHandMessage
	cardDeck: HiddenCardDeckMessage
	cardGraveyard: HiddenCardDeckMessage
	morale: number
	unitMana: number
	spellMana: number

	constructor(playerInGame: PlayerInGame) {
		this.player = new HiddenPlayerMessage(playerInGame.player)
		this.cardHand = new HiddenCardHandMessage(playerInGame.cardHand)
		this.cardDeck = new HiddenCardDeckMessage(playerInGame.cardDeck)
		this.cardGraveyard = new HiddenCardDeckMessage(playerInGame.cardGraveyard)
		this.morale = playerInGame.morale
		this.unitMana = playerInGame.unitMana
		this.spellMana = playerInGame.spellMana
	}
}
