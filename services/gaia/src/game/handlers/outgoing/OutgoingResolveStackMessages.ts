import CardRefMessage from '@shared/models/network/card/CardRefMessage'
import { ResolveStackMessageType } from '@shared/models/network/messageHandlers/ServerToClientGameMessages'
import AmbushOwnedCardMessage from '@shared/models/network/ownedCard/AmbushOwnedCardMessage'
import OpenOwnedCardMessage from '@shared/models/network/ownedCard/OpenOwnedCardMessage'

import ServerOwnedCard from '../../models/ServerOwnedCard'

export default {
	notifyAboutCardResolving(ownedCard: ServerOwnedCard): void {
		const friendlyData = new OpenOwnedCardMessage(ownedCard)
		const opponentData = ownedCard.card.isAmbush ? new AmbushOwnedCardMessage(ownedCard) : friendlyData

		ownedCard.owner.player.sendGameMessage({
			type: ResolveStackMessageType.ADD,
			data: friendlyData,
			skipQueue: true,
		})

		const opponentGroup = ownedCard.owner.opponentNullable
		if (opponentGroup) {
			opponentGroup.players.forEach((playerInGame) =>
				playerInGame.player.sendGameMessage({
					type: ResolveStackMessageType.ADD,
					data: opponentData,
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
