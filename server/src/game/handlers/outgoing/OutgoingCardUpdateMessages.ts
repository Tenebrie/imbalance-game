import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'
import CardVariablesMessage from '@shared/models/network/CardVariablesMessage'
import {isCardPublic} from '../../../utils/Utils'
import ServerBuff from '../../models/ServerBuff'
import CardLibraryPlaceholderGame from '../../utils/CardLibraryPlaceholderGame'
import OpenCardStatsMessage from '@shared/models/network/cardStats/OpenCardStatsMessage'
import HiddenCardStatsMessage from '@shared/models/network/cardStats/HiddenCardStatsMessage'
import OpenBuffMessage from '@shared/models/network/buffs/OpenBuffMessage'
import BuffRefMessage from '@shared/models/network/buffs/BuffRefMessage'
import {CardUpdateMessageType} from '@shared/models/network/messageHandlers/ServerToClientMessageTypes'

export default {
	notifyAboutCardStatsChange(card: ServerCard): void {
		if (card.game === CardLibraryPlaceholderGame) {
			return
		}

		const owner = card.owner
		if (!owner || !owner.opponent) {
			return
		}

		owner.player.sendMessage({
			type: CardUpdateMessageType.STATS,
			data: new OpenCardStatsMessage(card.stats)
		})
		owner.opponent.player.sendMessage({
			type: CardUpdateMessageType.STATS,
			data: isCardPublic(card) ? new OpenCardStatsMessage(card.stats) : new HiddenCardStatsMessage(card.stats)
		})
	},

	notifyAboutCardVariablesUpdated(game: ServerGame): void {
		game.players.forEach(playerInGame => {
			const cardsToNotify = game.board.getUnitsOwnedByPlayer(playerInGame).map(unit => unit.card).concat(playerInGame.cardHand.allCards)
			const messages = cardsToNotify.map(card => new CardVariablesMessage(card))
			playerInGame.player.sendMessage({
				type: CardUpdateMessageType.VARIABLES,
				data: messages,
			})

			const resolveStackCards = game.cardPlay.cardResolveStack.cards
			if (resolveStackCards.length > 0) {
				const stackMessages = resolveStackCards.map(ownedCard => new CardVariablesMessage(ownedCard.card))
				playerInGame.player.sendMessage({
					type: CardUpdateMessageType.VARIABLES,
					data: stackMessages,
					highPriority: true
				})
			}
		})
	},

	notifyAboutCardBuffAdded(card: ServerCard, buff: ServerBuff): void {
		if (!card.owner || !card.owner.opponent) {
			return
		}

		const owner = card.owner.player
		const opponent = card.owner.opponent.player
		const message = new OpenBuffMessage(buff)

		owner.sendMessage({
			type: CardUpdateMessageType.BUFF_ADD,
			data: message
		})
		opponent.sendMessage({
			type: CardUpdateMessageType.BUFF_ADD,
			data: message
		})
	},

	notifyAboutCardBuffDurationChanged(card: ServerCard, buff: ServerBuff): void {
		if (!card.owner || !card.owner.opponent) {
			return
		}

		const owner = card.owner.player
		const opponent = card.owner.opponent.player
		const message = new OpenBuffMessage(buff)

		owner.sendMessage({
			type: CardUpdateMessageType.BUFF_DURATION,
			data: message
		})
		opponent.sendMessage({
			type: CardUpdateMessageType.BUFF_DURATION,
			data: message
		})
	},

	notifyAboutCardBuffIntensityChanged(card: ServerCard, buff: ServerBuff): void {
		if (!card.owner || !card.owner.opponent) {
			return
		}

		const owner = card.owner.player
		const opponent = card.owner.opponent.player
		const message = new OpenBuffMessage(buff)

		owner.sendMessage({
			type: CardUpdateMessageType.BUFF_INTENSITY,
			data: message
		})
		opponent.sendMessage({
			type: CardUpdateMessageType.BUFF_INTENSITY,
			data: message
		})
	},

	notifyAboutCardBuffRemoved(card: ServerCard, buff: ServerBuff): void {
		if (!card.owner || !card.owner.opponent) {
			return
		}

		const owner = card.owner.player
		const opponent = card.owner.opponent.player
		const message = new BuffRefMessage(buff)

		owner.sendMessage({
			type: CardUpdateMessageType.BUFF_REMOVE,
			data: message
		})
		opponent.sendMessage({
			type: CardUpdateMessageType.BUFF_REMOVE,
			data: message
		})
	},
}
