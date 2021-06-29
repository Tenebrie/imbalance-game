import { IncomingMessageHandlerFunction } from '@/Pixi/handlers/IncomingMessageHandlers'
import { CardUpdateMessageType } from '@shared/models/network/messageHandlers/ServerToClientMessageTypes'
import CardVariablesMessage from '@shared/models/network/CardVariablesMessage'
import Core from '@/Pixi/Core'
import ClientBuff from '@/Pixi/models/buffs/ClientBuff'
import CardStatsMessage from '@shared/models/network/cardStats/CardStatsMessage'
import OpenCardBuffMessage from '@shared/models/network/buffs/OpenCardBuffMessage'

const IncomingCardUpdateMessages: { [index in CardUpdateMessageType]: IncomingMessageHandlerFunction } = {
	[CardUpdateMessageType.STATS]: (data: CardStatsMessage) => {
		const card = Core.game.findCardById(data.cardId)
		if (!card) {
			console.warn('Trying to update stats on non-existing card')
			return
		}

		card.stats.power = data.power
		card.stats.armor = data.armor
		card.stats.maxPower = data.maxPower
		card.stats.maxArmor = data.maxArmor
		card.stats.unitCost = data.unitCost
		card.stats.spellCost = data.spellCost
	},

	[CardUpdateMessageType.VARIABLES]: (data: CardVariablesMessage[]) => {
		data.forEach((message) => {
			const matchingCard = Core.game.findRenderedCardById(message.cardId) || Core.board.findUnitById(message.cardId)?.card
			if (!matchingCard) {
				return
			}
			matchingCard.setCardVariables(message.cardVariables)
		})
	},

	[CardUpdateMessageType.CARD_BUFF_ADD]: (data: OpenCardBuffMessage) => {
		const card = Core.game.findRenderedCardById(data.parentId)
		if (!card) {
			return
		}

		card.buffs.add(new ClientBuff(data))
	},

	[CardUpdateMessageType.CARD_BUFF_DURATION]: (data: OpenCardBuffMessage) => {
		const card = Core.game.findRenderedCardById(data.parentId)
		if (!card) {
			return
		}

		const buff = card.buffs.findBuffById(data.id)
		if (!buff) {
			return
		}

		buff.duration = Number(data.duration)
		Core.player.players.forEach((player) => {
			if (player.cardHand.unitCards.includes(card)) {
				player.cardHand.sortCards()
			}
		})
	},

	[CardUpdateMessageType.CARD_BUFF_REMOVE]: (data: OpenCardBuffMessage) => {
		const card = Core.game.findRenderedCardById(data.parentId)
		if (!card) {
			return
		}

		card.buffs.removeById(data.id)
	},
}

export default IncomingCardUpdateMessages
