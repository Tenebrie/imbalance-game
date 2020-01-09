import RenderedCard from '@/Pixi/models/RenderedCard'
import { CardLocation } from '@/Pixi/enums/CardLocation'
import ClientPlayerInGame from '@/Pixi/models/ClientPlayerInGame'
import RenderedCardOnBoard from '@/Pixi/models/RenderedCardOnBoard'

export default class HoveredCard {
	card: RenderedCard
	location: CardLocation
	owner: ClientPlayerInGame

	constructor(card: RenderedCard, location: CardLocation, owner: ClientPlayerInGame) {
		this.card = card
		this.location = location
		this.owner = owner
	}

	public static fromCardInHand(card: RenderedCard, owner: ClientPlayerInGame): HoveredCard {
		return new HoveredCard(card, CardLocation.HAND, owner)
	}

	public static fromCardOnBoard(cardOnBoard: RenderedCardOnBoard): HoveredCard {
		return new HoveredCard(cardOnBoard.card, CardLocation.BOARD, cardOnBoard.owner)
	}
}
