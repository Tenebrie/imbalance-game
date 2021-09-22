import OpenCardBuffMessage from '@shared/models/network/buffs/OpenCardBuffMessage'
import HiddenCardStatsMessage from '@shared/models/network/cardStats/HiddenCardStatsMessage'
import OpenCardStatsMessage from '@shared/models/network/cardStats/OpenCardStatsMessage'
import CardVariablesMessage from '@shared/models/network/CardVariablesMessage'
import { CardUpdateMessageType } from '@shared/models/network/messageHandlers/ServerToClientGameMessages'
import { getOwnerGroup, isCardPublic } from '@src/utils/Utils'

import { ServerCardBuff } from '../../models/buffs/ServerBuff'
import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'

export default {
	notifyAboutCardStatsChange(card: ServerCard): void {
		if (card.game.name === 'Card Library Placeholder Game') {
			return
		}

		const owner = getOwnerGroup(card)
		if (!owner || !owner.opponent) {
			return
		}

		owner.players.forEach((playerInGame) =>
			playerInGame.player.sendGameMessage({
				type: CardUpdateMessageType.STATS,
				data: new OpenCardStatsMessage(card.stats),
			})
		)
		owner.opponent.players.forEach((playerInGame) =>
			playerInGame.player.sendGameMessage({
				type: CardUpdateMessageType.STATS,
				data: isCardPublic(card) ? new OpenCardStatsMessage(card.stats) : new HiddenCardStatsMessage(card.stats),
			})
		)
	},

	notifyAboutCardVariablesUpdated(game: ServerGame): void {
		game.players.forEach((playerGroup) => {
			const cardsToNotify = game.board
				.getUnitsOwnedByGroup(playerGroup)
				.map((unit) => unit.card)
				.concat(playerGroup.players.map((player) => player.leader))
				.concat(playerGroup.players.flatMap((player) => player.cardHand.allCards))
			const messages = cardsToNotify.map((card) => new CardVariablesMessage(card))

			playerGroup.players.forEach((playerInGame) =>
				playerInGame.player.sendGameMessage({
					type: CardUpdateMessageType.VARIABLES,
					data: messages,
				})
			)

			const resolveStackCards = game.cardPlay.cardResolveStack.cards
			if (resolveStackCards.length > 0) {
				const stackMessages = resolveStackCards.map((ownedCard) => new CardVariablesMessage(ownedCard.card))
				playerGroup.players.forEach((playerInGame) =>
					playerInGame.player.sendGameMessage({
						type: CardUpdateMessageType.VARIABLES,
						data: stackMessages,
						skipQueue: true,
					})
				)
			}
		})
	},

	notifyAboutCardBuffAdded(buff: ServerCardBuff): void {
		const message = new OpenCardBuffMessage(buff)

		buff.game.players
			.flatMap((playerGroup) => playerGroup.players)
			.forEach((playerInGame) =>
				playerInGame.player.sendGameMessage({
					type: CardUpdateMessageType.CARD_BUFF_ADD,
					data: message,
				})
			)
	},

	notifyAboutCardBuffDurationChanged(buff: ServerCardBuff): void {
		const message = new OpenCardBuffMessage(buff)

		buff.game.players
			.flatMap((playerGroup) => playerGroup.players)
			.forEach((playerInGame) =>
				playerInGame.player.sendGameMessage({
					type: CardUpdateMessageType.CARD_BUFF_DURATION,
					data: message,
				})
			)
	},

	notifyAboutCardBuffRemoved(buff: ServerCardBuff): void {
		const message = new OpenCardBuffMessage(buff)

		buff.game.players
			.flatMap((playerGroup) => playerGroup.players)
			.forEach((playerInGame) =>
				playerInGame.player.sendGameMessage({
					type: CardUpdateMessageType.CARD_BUFF_REMOVE,
					data: message,
				})
			)
	},
}
