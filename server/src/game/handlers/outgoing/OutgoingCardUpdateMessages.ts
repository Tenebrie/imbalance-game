import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'
import CardVariablesMessage from '@shared/models/network/CardVariablesMessage'
import { isCardPublic } from '@src/utils/Utils'
import { ServerCardBuff } from '../../models/buffs/ServerBuff'
import OpenCardStatsMessage from '@shared/models/network/cardStats/OpenCardStatsMessage'
import HiddenCardStatsMessage from '@shared/models/network/cardStats/HiddenCardStatsMessage'
import OpenCardBuffMessage from '@shared/models/network/buffs/OpenCardBuffMessage'
import { CardUpdateMessageType } from '@shared/models/network/messageHandlers/ServerToClientMessageTypes'

export default {
	notifyAboutCardStatsChange(card: ServerCard): void {
		if (card.game.name === 'Card Library Placeholder Game') {
			return
		}

		const owner = card.owner
		if (!owner || !owner.opponent) {
			return
		}

		owner.player.sendMessage({
			type: CardUpdateMessageType.STATS,
			data: new OpenCardStatsMessage(card.stats),
		})
		owner.opponent.player.sendMessage({
			type: CardUpdateMessageType.STATS,
			data: isCardPublic(card) ? new OpenCardStatsMessage(card.stats) : new HiddenCardStatsMessage(card.stats),
		})
	},

	notifyAboutCardVariablesUpdated(game: ServerGame): void {
		game.players.forEach((playerInGame) => {
			const cardsToNotify = game.board
				.getUnitsOwnedByPlayer(playerInGame)
				.map((unit) => unit.card)
				.concat(playerInGame.leader)
				.concat(playerInGame.cardHand.allCards)
			const messages = cardsToNotify.map((card) => new CardVariablesMessage(card))
			playerInGame.player.sendMessage({
				type: CardUpdateMessageType.VARIABLES,
				data: messages,
			})

			const resolveStackCards = game.cardPlay.cardResolveStack.cards
			if (resolveStackCards.length > 0) {
				const stackMessages = resolveStackCards.map((ownedCard) => new CardVariablesMessage(ownedCard.card))
				playerInGame.player.sendMessage({
					type: CardUpdateMessageType.VARIABLES,
					data: stackMessages,
					highPriority: true,
				})
			}
		})
	},

	notifyAboutCardBuffAdded(buff: ServerCardBuff): void {
		const card = buff.parent
		if (!card.owner || !card.owner.opponent) {
			return
		}

		const owner = card.owner.player
		const opponent = card.owner.opponent.player
		const message = new OpenCardBuffMessage(buff)

		owner.sendMessage({
			type: CardUpdateMessageType.CARD_BUFF_ADD,
			data: message,
		})
		opponent.sendMessage({
			type: CardUpdateMessageType.CARD_BUFF_ADD,
			data: message,
		})
	},

	notifyAboutCardBuffDurationChanged(buff: ServerCardBuff): void {
		const card = buff.parent
		if (!card.owner || !card.owner.opponent) {
			return
		}

		const owner = card.owner.player
		const opponent = card.owner.opponent.player
		const message = new OpenCardBuffMessage(buff)

		owner.sendMessage({
			type: CardUpdateMessageType.CARD_BUFF_DURATION,
			data: message,
		})
		opponent.sendMessage({
			type: CardUpdateMessageType.CARD_BUFF_DURATION,
			data: message,
		})
	},

	notifyAboutCardBuffRemoved(buff: ServerCardBuff): void {
		const card = buff.parent
		if (!card.owner || !card.owner.opponent) {
			return
		}

		const owner = card.owner.player
		const opponent = card.owner.opponent.player
		const message = new OpenCardBuffMessage(buff)

		owner.sendMessage({
			type: CardUpdateMessageType.CARD_BUFF_REMOVE,
			data: message,
		})
		opponent.sendMessage({
			type: CardUpdateMessageType.CARD_BUFF_REMOVE,
			data: message,
		})
	},
}
