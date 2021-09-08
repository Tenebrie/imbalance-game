import CardRefMessage from '@shared/models/network/card/CardRefMessage'
import { ResolveStackMessageHandlers, ResolveStackMessageType } from '@shared/models/network/messageHandlers/ServerToClientGameMessages'
import OwnedCardMessage from '@shared/models/network/ownedCard/OwnedCardMessage'

import RenderedCard from '@/Pixi/cards/RenderedCard'
import Core from '@/Pixi/Core'

const IncomingResolveStackMessages: ResolveStackMessageHandlers = {
	[ResolveStackMessageType.ADD]: (data: OwnedCardMessage) => {
		const cardToProtect = Core.resolveStack.cards[Core.resolveStack.cards.length - 1]
		if (cardToProtect && cardToProtect.card.id === data.card.id) {
			cardToProtect.protected = true
			return
		}
		Core.resolveStack.addCard(RenderedCard.fromMessage(data.card), Core.getPlayer(data.owner.playerId))
	},

	[ResolveStackMessageType.REMOVE]: (data: CardRefMessage) => {
		Core.resolveStack.discardCardById(data.id)
		if (Core.resolveStack.isEmpty()) {
			Core.input.disableForcedTargetingMode()
		}
	},
}

export default IncomingResolveStackMessages
