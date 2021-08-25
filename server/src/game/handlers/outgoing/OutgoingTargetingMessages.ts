import ServerPlayer from '../../players/ServerPlayer'
import { ServerAnonymousTargetCard } from '../../models/ServerCardTarget'
import TargetType from '@shared/enums/TargetType'
import { TargetingMessageType } from '@shared/models/network/messageHandlers/ServerToClientMessageTypes'
import ResolvingCardTargetsMessage from '@shared/models/network/ResolvingCardTargetsMessage'
import InvalidCardTargetMessage from '@shared/models/network/InvalidCardTargetMessage'
import TargetMode from '@shared/enums/TargetMode'
import ServerCard from '../../models/ServerCard'
import AnonymousTargetsMessage from '@shared/models/network/AnonymousTargetsMessage'
import { ValidServerCardTarget } from '@src/game/models/ServerCardTargeting'

export default {
	notifyAboutRequestedCardTargets(
		player: ServerPlayer,
		targetMode: TargetMode,
		validTargets: ValidServerCardTarget[],
		source: ServerCard
	): void {
		const highPriorityTargets = [
			TargetType.UNIT,
			TargetType.BOARD_ROW,
			TargetType.BOARD_POSITION,
			TargetType.CARD_IN_UNIT_HAND,
			TargetType.CARD_IN_SPELL_HAND,
		]
		const highPriority =
			validTargets.every((target) => highPriorityTargets.includes(target.targetType)) &&
			!validTargets.some((target) => target.targetMode === TargetMode.CARD_PLAY)
		if (!highPriority) {
			player.sendMessage({
				type: TargetingMessageType.CARD_PLAY,
				data: new ResolvingCardTargetsMessage(targetMode, [], source),
				highPriority: true,
			})
		}
		player.sendMessage({
			type: TargetingMessageType.CARD_PLAY,
			data: new ResolvingCardTargetsMessage(targetMode, validTargets, source),
			highPriority: highPriority,
		})
	},

	notifyAboutRequestedCardTargetsForReconnect(
		player: ServerPlayer,
		targetMode: TargetMode,
		validTargets: ValidServerCardTarget[],
		source: ServerCard
	): void {
		player.sendMessage({
			type: TargetingMessageType.CARD_PLAY,
			data: new ResolvingCardTargetsMessage(targetMode, validTargets, source),
		})
	},

	notifyAboutRequestedAnonymousTargets(player: ServerPlayer, targetMode: TargetMode, validTargets: ServerAnonymousTargetCard[]): void {
		const highPriorityTargets = [
			TargetType.UNIT,
			TargetType.BOARD_ROW,
			TargetType.BOARD_POSITION,
			TargetType.CARD_IN_UNIT_HAND,
			TargetType.CARD_IN_SPELL_HAND,
		]
		const highPriority =
			validTargets.every((target) => highPriorityTargets.includes(target.targetType)) &&
			!validTargets.some((target) => target.targetMode === TargetMode.CARD_PLAY)
		player.sendMessage({
			type: TargetingMessageType.ANONYMOUS,
			data: new AnonymousTargetsMessage(targetMode, validTargets),
			highPriority: highPriority,
		})
	},

	notifyAboutInvalidTarget(player: ServerPlayer, targetMode: TargetMode, source: ServerCard): void {
		player.sendMessage({
			type: TargetingMessageType.INVALID,
			data: new InvalidCardTargetMessage(targetMode, source),
			highPriority: true,
		})
	},
}
