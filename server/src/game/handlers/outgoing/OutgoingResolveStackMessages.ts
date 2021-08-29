import CardRefMessage from '@shared/models/network/card/CardRefMessage'
import { ResolveStackMessageType } from '@shared/models/network/messageHandlers/ServerToClientMessageTypes'
import OpenOwnedCardMessage from '@shared/models/network/ownedCard/OpenOwnedCardMessage'

import ServerOwnedCard from '../../models/ServerOwnedCard'

export default {
	notifyAboutCardResolving(ownedCard: ServerOwnedCard): void {
		const data = new OpenOwnedCardMessage(ownedCard)

		ownedCard.owner.player.sendMessage({
			type: ResolveStackMessageType.ADD,
			data: data,
			highPriority: true,
		})

		const opponentGroup = ownedCard.owner.opponent
		if (opponentGroup) {
			opponentGroup.players.forEach((playerInGame) =>
				playerInGame.player.sendMessage({
					type: ResolveStackMessageType.ADD,
					data: data,
					highPriority: ownedCard.card.game.activePlayer === ownedCard.owner.opponent,
				})
			)
		}
	},

	notifyAboutCardResolved(ownedCard: ServerOwnedCard): void {
		const data = new CardRefMessage(ownedCard.card)

		ownedCard.owner.player.sendMessage({
			type: ResolveStackMessageType.REMOVE,
			data: data,
		})

		const opponentGroup = ownedCard.owner.opponent
		if (opponentGroup) {
			opponentGroup.players.forEach((playerInGame) =>
				playerInGame.player.sendMessage({
					type: ResolveStackMessageType.REMOVE,
					data: data,
				})
			)
		}
	},
}
