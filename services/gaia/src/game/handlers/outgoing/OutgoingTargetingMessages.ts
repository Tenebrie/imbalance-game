import TargetMode from '@shared/enums/TargetMode'
import TargetType from '@shared/enums/TargetType'
import AnonymousTargetsMessage from '@shared/models/network/AnonymousTargetsMessage'
import InvalidCardTargetMessage from '@shared/models/network/InvalidCardTargetMessage'
import { TargetingMessageType } from '@shared/models/network/messageHandlers/ServerToClientGameMessages'
import ResolvingCardTargetsMessage from '@shared/models/network/ResolvingCardTargetsMessage'
import { ValidServerCardTarget } from '@src/game/models/ServerCardTargeting'

import ServerCard from '../../models/ServerCard'
import { ServerAnonymousTargetCard } from '../../models/ServerCardTarget'
import ServerPlayer from '../../players/ServerPlayer'

export default {
	notifyAboutRequestedCardTargets(
		player: ServerPlayer,
		targetMode: TargetMode,
		validTargets: ValidServerCardTarget[],
		source: ServerCard
	): void {
		const skipQueueForTargets = [
			TargetType.UNIT,
			TargetType.BOARD_ROW,
			TargetType.BOARD_POSITION,
			TargetType.CARD_IN_UNIT_HAND,
			TargetType.CARD_IN_SPELL_HAND,
		]
		const skipQueue =
			validTargets.every((target) => skipQueueForTargets.includes(target.targetType)) &&
			!validTargets.some((target) => target.targetMode === TargetMode.CARD_PLAY)
		if (!skipQueue) {
			player.sendGameMessage({
				type: TargetingMessageType.CARD_PLAY,
				data: new ResolvingCardTargetsMessage(targetMode, [], source),
				skipQueue: true,
			})
		}
		player.sendGameMessage({
			type: TargetingMessageType.CARD_PLAY,
			data: new ResolvingCardTargetsMessage(targetMode, validTargets, source),
			skipQueue: skipQueue,
		})
	},

	notifyAboutRequestedCardTargetsForReconnect(
		player: ServerPlayer,
		targetMode: TargetMode,
		validTargets: ValidServerCardTarget[],
		source: ServerCard
	): void {
		player.sendGameMessage({
			type: TargetingMessageType.CARD_PLAY,
			data: new ResolvingCardTargetsMessage(targetMode, validTargets, source),
		})
	},

	notifyAboutRequestedAnonymousTargets(player: ServerPlayer, targetMode: TargetMode, validTargets: ServerAnonymousTargetCard[]): void {
		const skipQueueForTargets = [
			TargetType.UNIT,
			TargetType.BOARD_ROW,
			TargetType.BOARD_POSITION,
			TargetType.CARD_IN_UNIT_HAND,
			TargetType.CARD_IN_SPELL_HAND,
		]
		const skipQueue =
			validTargets.every((target) => skipQueueForTargets.includes(target.targetType)) &&
			!validTargets.some((target) => target.targetMode === TargetMode.CARD_PLAY)
		player.sendGameMessage({
			type: TargetingMessageType.ANONYMOUS,
			data: new AnonymousTargetsMessage(targetMode, validTargets),
			skipQueue: skipQueue,
		})
	},

	notifyAboutInvalidTarget(player: ServerPlayer, targetMode: TargetMode, source: ServerCard): void {
		player.sendGameMessage({
			type: TargetingMessageType.INVALID,
			data: new InvalidCardTargetMessage(targetMode, source),
			skipQueue: true,
		})
	},
}
