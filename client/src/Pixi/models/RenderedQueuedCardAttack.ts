import RenderedCardOnBoard from '@/Pixi/models/RenderedCardOnBoard'
import TargetingArrow from '@/Pixi/models/TargetingArrow'
import QueuedCardAttackMessage from '@/shared/models/network/QueuedCardAttackMessage'
import Core from '@/Pixi/Core'

export default class RenderedQueuedCardAttack {
	attacker: RenderedCardOnBoard
	target: RenderedCardOnBoard
	targetingArrow: TargetingArrow

	constructor(attacker: RenderedCardOnBoard, target: RenderedCardOnBoard) {
		this.attacker = attacker
		this.target = target
		this.targetingArrow = new TargetingArrow()
	}

	public destroy() {
		this.targetingArrow.destroy()
	}

	public static fromMessage(message: QueuedCardAttackMessage): RenderedQueuedCardAttack {
		const attacker = Core.board.findCardById(message.attacker.id)
		const target = Core.board.findCardById(message.target.id)
		if (!attacker || !target) {
			throw new Error('One of the cards does not exist!')
		}
		return new RenderedQueuedCardAttack(attacker, target)
	}
}
