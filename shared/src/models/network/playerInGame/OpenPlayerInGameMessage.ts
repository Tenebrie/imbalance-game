import PlayerInGame from '../../PlayerInGame'
import OpenCardMessage from '../card/OpenCardMessage'
import OpenCardDeckMessage from '../cardDeck/OpenCardDeckMessage'
import OpenCardHandMessage from '../cardHand/OpenCardHandMessage'
import OpenPlayerMessage from '../player/OpenPlayerMessage'
import PlayerInGameMessage from './PlayerInGameMessage'

export default class OpenPlayerInGameMessage implements PlayerInGameMessage {
	player: OpenPlayerMessage
	leader: OpenCardMessage
	cardHand: OpenCardHandMessage
	cardDeck: OpenCardDeckMessage
	cardGraveyard: OpenCardDeckMessage
	unitMana: number
	spellMana: number

	constructor(playerInGame: PlayerInGame) {
		this.player = new OpenPlayerMessage(playerInGame.player)
		this.leader = new OpenCardMessage(playerInGame.leader)
		this.cardHand = new OpenCardHandMessage(playerInGame.cardHand)
		this.cardDeck = new OpenCardDeckMessage(playerInGame.cardDeck)
		this.cardGraveyard = new OpenCardDeckMessage(playerInGame.cardGraveyard)
		this.unitMana = playerInGame.unitMana
		this.spellMana = playerInGame.spellMana
	}
}
