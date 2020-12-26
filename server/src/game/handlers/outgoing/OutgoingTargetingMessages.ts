import ServerPlayer from '../../players/ServerPlayer'
import { ServerAnonymousTargetCard, ServerCardTargetCard, ServerCardTargetRow, ServerCardTargetUnit } from '../../models/ServerCardTarget'
import TargetType from '@shared/enums/TargetType'
import { TargetingMessageType } from '@shared/models/network/messageHandlers/ServerToClientMessageTypes'
import ResolvingCardTargetsMessage from '@shared/models/network/ResolvingCardTargetsMessage'
import TargetMode from '@shared/enums/TargetMode'
import ServerCard from '../../models/ServerCard'
import AnonymousTargetsMessage from '@shared/models/network/AnonymousTargetsMessage'

export default {
	notifyAboutRequestedCardTargets(
		player: ServerPlayer,
		targetMode: TargetMode,
		validTargets: (ServerCardTargetCard | ServerCardTargetUnit | ServerCardTargetRow)[],
		source: ServerCard
	): void {
		const highPriorityTargets = [TargetType.UNIT, TargetType.BOARD_ROW, TargetType.CARD_IN_UNIT_HAND, TargetType.CARD_IN_SPELL_HAND]
		const highPriority = validTargets.every((target) => highPriorityTargets.includes(target.targetType))
		player.sendMessage({
			type: TargetingMessageType.CARD_PLAY,
			data: new ResolvingCardTargetsMessage(targetMode, validTargets, source),
			highPriority: highPriority,
		})
	},

	notifyAboutRequestedCardTargetsForReconnect(
		player: ServerPlayer,
		targetMode: TargetMode,
		validTargets: (ServerCardTargetCard | ServerCardTargetUnit | ServerCardTargetRow)[],
		source: ServerCard
	): void {
		player.sendMessage({
			type: TargetingMessageType.CARD_PLAY,
			data: new ResolvingCardTargetsMessage(targetMode, validTargets, source),
		})
	},

	notifyAboutRequestedAnonymousTargets(player: ServerPlayer, targetMode: TargetMode, validTargets: ServerAnonymousTargetCard[]): void {
		const highPriorityTargets = [TargetType.UNIT, TargetType.BOARD_ROW, TargetType.CARD_IN_UNIT_HAND, TargetType.CARD_IN_SPELL_HAND]
		const highPriority = validTargets.every((target) => highPriorityTargets.includes(target.targetType))
		player.sendMessage({
			type: TargetingMessageType.ANONYMOUS,
			data: new AnonymousTargetsMessage(targetMode, validTargets),
			highPriority: highPriority,
		})
	},
}
