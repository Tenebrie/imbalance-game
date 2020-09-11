import {IncomingMessageHandlerFunction} from '@/Pixi/handlers/IncomingMessageHandlers'
import {CardUpdateMessageType} from '@shared/models/network/messageHandlers/ServerToClientMessageTypes'
import CardVariablesMessage from '@shared/models/network/CardVariablesMessage'
import Core from '@/Pixi/Core'
import BuffMessage from '@shared/models/network/buffs/BuffMessage'
import ClientBuff from '@/Pixi/models/ClientBuff'
import BuffRefMessage from '@shared/models/network/buffs/BuffRefMessage'
import CardStatsMessage from '@shared/models/network/cardStats/CardStatsMessage'
import RenderedCard from '@/Pixi/cards/RenderedCard'

const IncomingCardUpdateMessages: {[ index in CardUpdateMessageType ]: IncomingMessageHandlerFunction } = {
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
		data.forEach(message => {
			const matchingCard = Core.game.findRenderedCardById(message.cardId) || Core.board.findUnitById(message.cardId).card
			if (!matchingCard) {
				return
			}
			matchingCard.setCardVariables(message.cardVariables)
		})
	},

	[CardUpdateMessageType.BUFF_ADD]: (data: BuffMessage) => {
		const card = Core.game.findRenderedCardById(data.cardId)
		if (!card) {
			return
		}

		card.buffs.add(new ClientBuff(data))
	},

	[CardUpdateMessageType.BUFF_DURATION]: (data: BuffMessage) => {
		const card = Core.game.findRenderedCardById(data.cardId)
		if (!card) {
			return
		}

		const buff = card.buffs.findBuffById(data.id)
		if (!buff) {
			return
		}

		buff.duration = Number(data.duration)
		if (Core.player.cardHand.unitCards.includes(card)) {
			Core.player.cardHand.sortCards()
		}
	},

	[CardUpdateMessageType.BUFF_INTENSITY]: (data: BuffMessage) => {
		const card = Core.game.findRenderedCardById(data.cardId)
		if (!card) {
			return
		}

		const buff = card.buffs.findBuffById(data.id)
		if (!buff) {
			return
		}

		buff.intensity = Number(data.intensity)
		if (Core.player.cardHand.unitCards.includes(card)) {
			Core.player.cardHand.sortCards()
		}
	},

	[CardUpdateMessageType.BUFF_REMOVE]: (data: BuffRefMessage) => {
		const card = Core.game.findRenderedCardById(data.cardId)
		if (!card) {
			return
		}

		card.buffs.removeById(data.id)
	},
}

export default IncomingCardUpdateMessages
