import Player from '@/shared/models/Player'
import PlayerInGame from '@/shared/models/PlayerInGame'
import RenderedCardHand from '@/Pixi/models/RenderedCardHand'
import PlayerInGameMessage from '@/shared/models/network/PlayerInGameMessage'
import ClientCardDeck from '@/Pixi/models/ClientCardDeck'

export default class ClientPlayerInGame extends PlayerInGame {
	cardHand: RenderedCardHand
	cardDeck: ClientCardDeck

	constructor(player: Player) {
		super(player)
		this.cardHand = new RenderedCardHand([])
		this.cardDeck = new ClientCardDeck([])
	}

	public static fromPlayer(player: Player): ClientPlayerInGame {
		return new ClientPlayerInGame(player)
	}

	public static fromMessage(message: PlayerInGameMessage): ClientPlayerInGame {
		const player = Player.fromPlayerMessage(message.player)
		const clientPlayerInGame = new ClientPlayerInGame(player)
		clientPlayerInGame.cardHand = RenderedCardHand.fromMessage(message.cardHand)
		clientPlayerInGame.cardDeck = ClientCardDeck.fromMessage(message.cardDeck)
		return clientPlayerInGame
	}
}
