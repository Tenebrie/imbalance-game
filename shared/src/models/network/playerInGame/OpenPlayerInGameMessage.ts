import PlayerInGame from '../../PlayerInGame'
import OpenPlayerMessage from '../player/OpenPlayerMessage'
import OpenCardHandMessage from '../cardHand/OpenCardHandMessage'
import OpenCardDeckMessage from '../cardDeck/OpenCardDeckMessage'
import PlayerInGameMessage from './PlayerInGameMessage'

export default class OpenPlayerInGameMessage implements PlayerInGameMessage {
	player: OpenPlayerMessage
	cardHand: OpenCardHandMessage
	cardDeck: OpenCardDeckMessage
	cardGraveyard: OpenCardDeckMessage
	unitMana: number
	spellMana: number

	constructor(playerInGame: PlayerInGame) {
		this.player = new OpenPlayerMessage(playerInGame.player)
		this.cardHand = new OpenCardHandMessage(playerInGame.cardHand)
		this.cardDeck = new OpenCardDeckMessage(playerInGame.cardDeck)
		this.cardGraveyard = new OpenCardDeckMessage(playerInGame.cardGraveyard)
		this.unitMana = playerInGame.unitMana
		this.spellMana = playerInGame.spellMana
	}
}
