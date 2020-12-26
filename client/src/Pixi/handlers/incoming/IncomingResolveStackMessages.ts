import { IncomingMessageHandlerFunction } from '@/Pixi/handlers/IncomingMessageHandlers'
import Core from '@/Pixi/Core'
import { ResolveStackMessageType } from '@shared/models/network/messageHandlers/ServerToClientMessageTypes'
import RenderedCard from '@/Pixi/cards/RenderedCard'
import CardRefMessage from '@shared/models/network/card/CardRefMessage'
import OwnedCardMessage from '@shared/models/network/ownedCard/OwnedCardMessage'

const IncomingResolveStackMessages: { [index in ResolveStackMessageType]: IncomingMessageHandlerFunction } = {
	[ResolveStackMessageType.ADD]: (data: OwnedCardMessage) => {
		Core.resolveStack.addCard(RenderedCard.fromMessage(data.card), Core.getPlayer(data.owner.player.id))
	},

	[ResolveStackMessageType.REMOVE]: (data: CardRefMessage) => {
		Core.resolveStack.discardCardById(data.id)
		if (Core.resolveStack.isEmpty()) {
			Core.input.disableForcedTargetingMode()
		}
	},
}

export default IncomingResolveStackMessages
