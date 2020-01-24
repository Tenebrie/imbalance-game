import Core from '@/Pixi/Core'
import store from '@/Vue/store'
import Player from '@/Pixi/shared/models/Player'
import PlayerInGame from '@/Pixi/shared/models/PlayerInGame'
import RenderedCardHand from '@/Pixi/models/RenderedCardHand'
import PlayerInGameMessage from '@/Pixi/shared/models/network/PlayerInGameMessage'
import ClientCardDeck from '@/Pixi/models/ClientCardDeck'

export default class ClientPlayerInGame extends PlayerInGame {
	isTurnActive = false
	cardHand: RenderedCardHand
	cardDeck: ClientCardDeck

	constructor(player: Player) {
		super(player)
		this.cardHand = new RenderedCardHand([])
		this.cardDeck = new ClientCardDeck([])
	}

	public startTurn(): void {
		this.isTurnActive = true
		if (this === Core.player) {
			store.commit.gameStateModule.setIsPlayersTurn(true)
		}
	}

	public endTurn(): void {
		this.isTurnActive = false
		if (this === Core.player) {
			store.commit.gameStateModule.setIsPlayersTurn(false)
		}
	}

	public static fromPlayer(player: Player): ClientPlayerInGame {
		return new ClientPlayerInGame(player)
	}

	public static fromMessage(message: PlayerInGameMessage): ClientPlayerInGame {
		const player = Player.fromPlayerMessage(message.player)
		const clientPlayerInGame = new ClientPlayerInGame(player)
		clientPlayerInGame.cardHand = RenderedCardHand.fromMessage(message.cardHand)
		clientPlayerInGame.cardDeck = ClientCardDeck.fromMessage(message.cardDeck)
		clientPlayerInGame.morale = message.morale
		clientPlayerInGame.timeUnits = message.timeUnits
		return clientPlayerInGame
	}
}
