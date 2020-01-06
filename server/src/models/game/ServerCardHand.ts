import ServerCard from './ServerCard'
import CardHand from '../../shared/models/CardHand'
import ServerGame from '../../libraries/game/ServerGame'
import OutgoingMessageHandlers from '../../handlers/OutgoingMessageHandlers'
import ServerPlayer from '../../libraries/players/ServerPlayer'
import Card from '../../shared/models/Card'

export default class ServerCardHand extends CardHand {
	player: ServerPlayer

	constructor(player: ServerPlayer, cards: Card[]) {
		super(cards)
		this.player = player
	}

	public drawCard(card: ServerCard, game: ServerGame): void {
		this.addCard(card)
	}
}
