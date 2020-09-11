import {IncomingMessageHandlerFunction} from '@/Pixi/handlers/IncomingMessageHandlers'
import Core from '@/Pixi/Core'
import {ResolveStackMessageType} from '@shared/models/network/messageHandlers/ServerToClientMessageTypes'
import RenderedCard from '@/Pixi/cards/RenderedCard'
import CardTargetMessage from '@shared/models/network/CardTargetMessage'
import ClientCardTarget from '@/Pixi/models/ClientCardTarget'
import CardRefMessage from '@shared/models/network/card/CardRefMessage'
import CardMessage from '@shared/models/network/card/CardMessage'
import OwnedCardMessage from '@shared/models/network/ownedCard/OwnedCardMessage'

const IncomingResolveStackMessages: {[ index in ResolveStackMessageType ]: IncomingMessageHandlerFunction } = {
	[ResolveStackMessageType.ADD]: (data: OwnedCardMessage) => {
		Core.resolveStack.addCard(RenderedCard.fromMessage(data.card), Core.getPlayer(data.owner.player.id))
	},

	[ResolveStackMessageType.TARGETS]: (data: CardTargetMessage[]) => {
		const validTargets = data.map(data => ClientCardTarget.fromMessage(data))
		Core.input.enableForcedTargetingMode(validTargets)
	},

	[ResolveStackMessageType.REMOVE]: (data: CardRefMessage) => {
		Core.resolveStack.destroyCardById(data.id)
		if (Core.resolveStack.isEmpty()) {
			Core.input.disableForcedTargetingMode()
		}
	},
}

export default IncomingResolveStackMessages
