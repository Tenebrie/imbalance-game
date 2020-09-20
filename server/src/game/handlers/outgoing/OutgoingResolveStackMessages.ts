import ServerPlayer from '../../players/ServerPlayer'
import ServerOwnedCard from '../../models/ServerOwnedCard'
import ServerCardTarget from '../../models/ServerCardTarget'
import TargetType from '@shared/enums/TargetType'
import CardRefMessage from '@shared/models/network/card/CardRefMessage'
import {ResolveStackMessageType} from '@shared/models/network/messageHandlers/ServerToClientMessageTypes'
import OpenOwnedCardMessage from '@shared/models/network/ownedCard/OpenOwnedCardMessage'
import ResolvingCardTargetsMessage from '@shared/models/network/ResolvingCardTargetsMessage'
import TargetMode from '@shared/enums/TargetMode'

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

	notifyAboutRequestedTargets(player: ServerPlayer, targetMode: TargetMode, validTargets: ServerCardTarget[]): void {
		const highPriorityTargets = [TargetType.UNIT, TargetType.BOARD_ROW, TargetType.CARD_IN_UNIT_HAND, TargetType.CARD_IN_SPELL_HAND]
		const highPriority = validTargets.every(target => highPriorityTargets.includes(target.targetType))
		player.sendMessage({
			type: ResolveStackMessageType.TARGETS,
			data: new ResolvingCardTargetsMessage(targetMode, validTargets),
			highPriority: highPriority,
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
