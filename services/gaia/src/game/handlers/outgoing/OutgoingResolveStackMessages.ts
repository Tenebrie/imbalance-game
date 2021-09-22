import CardRefMessage from '@shared/models/network/card/CardRefMessage'
import { ResolveStackMessageType } from '@shared/models/network/messageHandlers/ServerToClientGameMessages'
import OpenOwnedCardMessage from '@shared/models/network/ownedCard/OpenOwnedCardMessage'

import ServerOwnedCard from '../../models/ServerOwnedCard'

export default {
	notifyAboutCardResolving(ownedCard: ServerOwnedCard): void {
		const data = new OpenOwnedCardMessage(ownedCard)

		ownedCard.owner.player.sendGameMessage({
			type: ResolveStackMessageType.ADD,
			data: data,
			skipQueue: true,
		})

		const opponentGroup = ownedCard.owner.opponentNullable
		if (opponentGroup) {
			opponentGroup.players.forEach((playerInGame) =>
				playerInGame.player.sendGameMessage({
					type: ResolveStackMessageType.ADD,
					data: data,
					skipQueue: ownedCard.card.game.activePlayer === ownedCard.owner.opponentNullable,
				})
			)
		}
	},

	notifyAboutCardResolved(ownedCard: ServerOwnedCard): void {
		const data = new CardRefMessage(ownedCard.card)

		ownedCard.owner.player.sendGameMessage({
			type: ResolveStackMessageType.REMOVE,
			data: data,
		})

		const opponentGroup = ownedCard.owner.opponentNullable
		if (opponentGroup) {
			opponentGroup.players.forEach((playerInGame) =>
				playerInGame.player.sendGameMessage({
					type: ResolveStackMessageType.REMOVE,
					data: data,
				})
			)
		}
	},
}
