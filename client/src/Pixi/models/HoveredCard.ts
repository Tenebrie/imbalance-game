import RenderedCard from '@/Pixi/cards/RenderedCard'
import RenderedUnit from '@/Pixi/cards/RenderedUnit'
import Core from '@/Pixi/Core'
import { HoveredCardLocation } from '@/Pixi/enums/HoveredCardLocation'
import ClientPlayerGroup from '@/Pixi/models/ClientPlayerGroup'
import ClientPlayerInGame from '@/Pixi/models/ClientPlayerInGame'

export default class HoveredCard {
	card: RenderedCard
	location: HoveredCardLocation
	owner: ClientPlayerInGame | ClientPlayerGroup | null

	constructor(card: RenderedCard, location: HoveredCardLocation, owner: ClientPlayerInGame | ClientPlayerGroup | null) {
		this.card = card
		this.location = location
		this.owner = owner
	}

	public static fromCardInHand(card: RenderedCard, owner: ClientPlayerInGame): HoveredCard {
		return new HoveredCard(card, HoveredCardLocation.HAND, owner)
	}

	public static fromCardOnBoard(cardOnBoard: RenderedUnit): HoveredCard {
		return new HoveredCard(cardOnBoard.card, HoveredCardLocation.BOARD, cardOnBoard.owner)
	}

	public static fromAnnouncedCard(card: RenderedCard): HoveredCard {
		return new HoveredCard(card, HoveredCardLocation.ANNOUNCED, Core.opponent)
	}

	public static fromSelectableCard(card: RenderedCard): HoveredCard {
		return new HoveredCard(card, HoveredCardLocation.SELECTABLE, null)
	}
}
