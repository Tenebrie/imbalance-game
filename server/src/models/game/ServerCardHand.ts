import ServerCard from './ServerCard'
import Card from '../../shared/models/Card'
import CardHand from '../../shared/models/CardHand'
import ServerGame from '../../libraries/game/ServerGame'
import ServerPlayer from '../../libraries/players/ServerPlayer'

export default class ServerCardHand extends CardHand {
	player: ServerPlayer

	constructor(player: ServerPlayer, cards: Card[]) {
		super(cards)
		this.player = player
	}

	public drawCard(card: ServerCard, game: ServerGame): void {
		this.addCard(card)
	}

	public findCardById(cardId: string): ServerCard | null {
		return this.cards.find(card => card.id === cardId) || null
	}
}
