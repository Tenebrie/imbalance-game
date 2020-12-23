import ServerOwnedCard from '../../models/ServerOwnedCard'
import CardRefMessage from '@shared/models/network/card/CardRefMessage'
import { ResolveStackMessageType } from '@shared/models/network/messageHandlers/ServerToClientMessageTypes'
import OpenOwnedCardMessage from '@shared/models/network/ownedCard/OpenOwnedCardMessage'

export default {
	notifyAboutCardResolving(ownedCard: ServerOwnedCard): void {
		const data = new OpenOwnedCardMessage(ownedCard)

		ownedCard.owner.player.sendMessage({
			type: ResolveStackMessageType.ADD,
			data: data,
			highPriority: true,
		})
		ownedCard.owner.opponent?.player.sendMessage({
			type: ResolveStackMessageType.ADD,
			data: data,
			highPriority: ownedCard.card.game.activePlayer === ownedCard.owner.opponent,
		})
	},

	notifyAboutCardResolved(ownedCard: ServerOwnedCard): void {
		const data = new CardRefMessage(ownedCard.card)

		ownedCard.owner.player.sendMessage({
			type: ResolveStackMessageType.REMOVE,
			data: data,
		})
		ownedCard.owner.opponent?.player.sendMessage({
			type: ResolveStackMessageType.REMOVE,
			data: data,
		})
	},
}
