import RenderedCardOnBoard from '@/Pixi/models/RenderedCardOnBoard'
import TargetingArrow from '@/Pixi/models/TargetingArrow'
import Core from '@/Pixi/Core'
import AttackOrderMessage from '@/Pixi/shared/models/network/AttackOrderMessage'
import AttackOrder from '@/Pixi/shared/models/AttackOrder'

export default class RenderedAttackOrder extends AttackOrder {
	attacker: RenderedCardOnBoard
	target: RenderedCardOnBoard
	targetingArrow: TargetingArrow

	constructor(attacker: RenderedCardOnBoard, target: RenderedCardOnBoard) {
		super(attacker, target)
		this.attacker = attacker
		this.target = target
		this.targetingArrow = new TargetingArrow()
	}

	public destroy() {
		this.targetingArrow.destroy()
	}

	public static fromMessage(message: AttackOrderMessage): RenderedAttackOrder {
		const attacker = Core.board.findCardById(message.attackerId)
		const target = Core.board.findCardById(message.targetId)
		if (!attacker || !target) {
			throw new Error('One of the cards does not exist!')
		}
		return new RenderedAttackOrder(attacker, target)
	}
}
