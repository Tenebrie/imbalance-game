import ServerPlayer from '../../players/ServerPlayer'
import ServerOwnedCard from '../../models/ServerOwnedCard'
import ServerCardTarget from '../../models/ServerCardTarget'
import CardTargetMessage from '@shared/models/network/CardTargetMessage'
import TargetType from '@shared/enums/TargetType'
import Utils from '../../../utils/Utils'
import OpenCardMessage from '@shared/models/network/card/OpenCardMessage'
import CardRefMessage from '@shared/models/network/card/CardRefMessage'
import {ResolveStackMessageType} from '@shared/models/network/messageHandlers/ServerToClientMessageTypes'
import OpenOwnedCardMessage from '@shared/models/network/ownedCard/OpenOwnedCardMessage'

export default {
	notifyAboutCardResolving(ownedCard: ServerOwnedCard): void {
		const owner = ownedCard.owner.player
		const opponent = ownedCard.owner.opponent.player
		const data = new OpenOwnedCardMessage(ownedCard)

		owner.sendMessage({
			type: ResolveStackMessageType.ADD,
			data: data,
			highPriority: true
		})
		opponent.sendMessage({
			type: ResolveStackMessageType.ADD,
			data: data
		})
	},

	notifyAboutResolvingCardTargets(player: ServerPlayer, validTargets: ServerCardTarget[]): void {
		const messages = validTargets.map(target => {
			const message = new CardTargetMessage(target)
			if (target.targetType === TargetType.CARD_IN_LIBRARY || target.targetType === TargetType.CARD_IN_UNIT_DECK || target.targetType === TargetType.CARD_IN_SPELL_DECK) {
				message.attachTargetCardData(target.targetCard)
			}
			return message
		})
		const shuffledMessages = Utils.shuffle(messages)
		player.sendMessage({
			type: ResolveStackMessageType.TARGETS,
			data: shuffledMessages,
			highPriority: true
		})
	},

	notifyAboutCardResolved(ownedCard: ServerOwnedCard): void {
		const owner = ownedCard.owner.player
		const opponent = ownedCard.owner.opponent.player
		const data = new CardRefMessage(ownedCard.card)

		owner.sendMessage({
			type: ResolveStackMessageType.REMOVE,
			data: data
		})
		opponent.sendMessage({
			type: ResolveStackMessageType.REMOVE,
			data: data
		})
	},
}
