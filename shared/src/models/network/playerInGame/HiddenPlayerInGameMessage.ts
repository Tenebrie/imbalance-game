import PlayerInGame from '../../PlayerInGame'
import OpenCardMessage from '../card/OpenCardMessage'
import HiddenCardDeckMessage from '../cardDeck/HiddenCardDeckMessage'
import HiddenCardHandMessage from '../cardHand/HiddenCardHandMessage'
import HiddenPlayerMessage from '../player/HiddenPlayerMessage'
import PlayerInGameMessage from './PlayerInGameMessage'

export default class HiddenPlayerInGameMessage implements PlayerInGameMessage {
	player: HiddenPlayerMessage
	leader: OpenCardMessage
	cardHand: HiddenCardHandMessage
	cardDeck: HiddenCardDeckMessage
	cardGraveyard: HiddenCardDeckMessage
	unitMana: number
	spellMana: number

	constructor(playerInGame: PlayerInGame) {
		this.player = new HiddenPlayerMessage(playerInGame.player)
		this.leader = new OpenCardMessage(playerInGame.leader)
		this.cardHand = new HiddenCardHandMessage(playerInGame.cardHand)
		this.cardDeck = new HiddenCardDeckMessage(playerInGame.cardDeck)
		this.cardGraveyard = new HiddenCardDeckMessage(playerInGame.cardGraveyard)
		this.unitMana = playerInGame.unitMana
		this.spellMana = playerInGame.spellMana
	}
}
