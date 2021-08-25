import PlayerInGame from '../../PlayerInGame'
import HiddenCardHandMessage from '../cardHand/HiddenCardHandMessage'
import HiddenCardDeckMessage from '../cardDeck/HiddenCardDeckMessage'
import PlayerInGameMessage from './PlayerInGameMessage'
import HiddenPlayerMessage from '../player/HiddenPlayerMessage'
import OpenCardMessage from '../card/OpenCardMessage'

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
