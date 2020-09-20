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

	notifyAboutPopupTargets(player: ServerPlayer, targetMode: TargetMode, validTargets: ServerCardTarget[]): void {
		player.sendMessage({
			type: ResolveStackMessageType.TARGETS,
			data: new ResolvingCardTargetsMessage(targetMode, validTargets),
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
