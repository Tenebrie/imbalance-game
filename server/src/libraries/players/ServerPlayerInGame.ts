import ServerPlayer from './ServerPlayer'
import Card from '../../shared/models/Card'
import ServerGame from '../game/ServerGame'
import ServerCard from '../../models/game/ServerCard'
import PlayerInGame from '../../shared/models/PlayerInGame'
import ServerCardHand from '../../models/game/ServerCardHand'
import ServerCardDeck from '../../models/game/ServerCardDeck'
import OutgoingMessageHandlers from '../../handlers/OutgoingMessageHandlers'

export default class ServerPlayerInGame extends PlayerInGame {
	player: ServerPlayer
	cardHand: ServerCardHand
	cardDeck: ServerCardDeck

	constructor(player: ServerPlayer, cardDeck: ServerCardDeck) {
		super(player)
		this.player = player
		this.cardHand = new ServerCardHand(this.player, [])
		this.cardDeck = cardDeck
	}

	public playCard(game: ServerGame, card: ServerCard): void {
		console.log(`Card ${card.cardClass} played!`)
	}

	public drawCards(game: ServerGame, count: number): void {
		const cards: Card[] = []
		for (let i = 0; i < count; i++) {
			const card = this.cardDeck.drawCard(game)
			if (!card) {
				// TODO: Fatigue damage?
				continue
			}

			this.cardHand.drawCard(card, game)
			cards.push(card)
		}

		OutgoingMessageHandlers.notifyAboutCardsDrawn(this.player, cards)
		const opponent = game.players.find(playerInGame => playerInGame.player !== this.player)
		if (opponent) {
			OutgoingMessageHandlers.notifyAboutOpponentCardsDrawn(opponent.player, cards)
		}
	}

	static newInstance(player: ServerPlayer, cardDeck: ServerCardDeck) {
		return new ServerPlayerInGame(player, cardDeck)
	}
}
