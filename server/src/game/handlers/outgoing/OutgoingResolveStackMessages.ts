import ServerPlayer from '../../players/ServerPlayer'
import ServerOwnedCard from '../../models/ServerOwnedCard'
import { ServerCardTargetCard, ServerCardTargetRow, ServerCardTargetUnit } from '../../models/ServerCardTarget'
import TargetType from '@shared/enums/TargetType'
import CardRefMessage from '@shared/models/network/card/CardRefMessage'
import { ResolveStackMessageType } from '@shared/models/network/messageHandlers/ServerToClientMessageTypes'
import OpenOwnedCardMessage from '@shared/models/network/ownedCard/OpenOwnedCardMessage'
import ResolvingCardTargetsMessage from '@shared/models/network/ResolvingCardTargetsMessage'
import TargetMode from '@shared/enums/TargetMode'
import ServerCard from '../../models/ServerCard'

export default {
	notifyAboutCardResolving(ownedCard: ServerOwnedCard): void {
		const data = new OpenOwnedCardMessage(ownedCard)

		ownedCard.owner.player.sendMessage({
			type: ResolveStackMessageType.ADD,
			data: data,
			highPriority: true,
		})
		ownedCard.owner.opponent?.player.sendMessage({
			type: ResolveStackMessageType.ADD,
			data: data,
			highPriority: ownedCard.card.game.activePlayer === ownedCard.owner.opponent,
		})
	},

	notifyAboutRequestedTargets(
		player: ServerPlayer,
		targetMode: TargetMode,
		validTargets: (ServerCardTargetUnit | ServerCardTargetCard | ServerCardTargetRow)[],
		source: ServerCard | null
	): void {
		const highPriorityTargets = [TargetType.UNIT, TargetType.BOARD_ROW, TargetType.CARD_IN_UNIT_HAND, TargetType.CARD_IN_SPELL_HAND]
		const highPriority = validTargets.every((target) => highPriorityTargets.includes(target.targetType))
		player.sendMessage({
			type: ResolveStackMessageType.TARGETS,
			data: new ResolvingCardTargetsMessage(targetMode, validTargets, source),
			highPriority: highPriority,
		})
	},

	notifyAboutCardResolved(ownedCard: ServerOwnedCard): void {
		const data = new CardRefMessage(ownedCard.card)

		ownedCard.owner.player.sendMessage({
			type: ResolveStackMessageType.REMOVE,
			data: data,
		})
		ownedCard.owner.opponent?.player.sendMessage({
			type: ResolveStackMessageType.REMOVE,
			data: data,
		})
	},
}
