import Card from '@/shared/models/Card'
import Player from '@/shared/models/Player'
import PlayerInGame from '@/shared/models/PlayerInGame'
import RenderedCardHand from '@/Pixi/models/RenderedCardHand'
import PlayerInGameMessage from '@/shared/models/network/PlayerInGameMessage'

export default class ClientPlayerInGame extends PlayerInGame {
	cardHand: RenderedCardHand

	constructor(player: Player) {
		super(player)
		this.cardHand = new RenderedCardHand([])
	}

	public static fromPlayer(player: Player): ClientPlayerInGame {
		return new ClientPlayerInGame(player)
	}

	public static fromMessage(message: PlayerInGameMessage): ClientPlayerInGame {
		const player = Player.fromPlayerMessage(message.player)
		const clientPlayerInGame = new ClientPlayerInGame(player)
		console.log(clientPlayerInGame)
		message.cardHand.forEach(cardMessage => {
			clientPlayerInGame.cardHand.addCard(Card.fromMessage(cardMessage))
		})
		message.cardDeck.forEach(cardMessage => {
			clientPlayerInGame.cardDeck.addCard(Card.fromMessage(cardMessage))
		})
		return clientPlayerInGame
	}
}
