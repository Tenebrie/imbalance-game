import Animation from '../Animation'
import AnimationType from '../../enums/AnimationType'

export default class AnimationMessage {
	type: AnimationType
	targetCardId: string | null
	sourceUnitId: string | null
	targetUnitId: string | null

	constructor(animation: Animation) {
		this.type = animation.type
		this.targetCardId = animation.targetCard ? animation.targetCard.id : null
		this.sourceUnitId = animation.sourceUnit ? animation.sourceUnit.card.id : null
		this.targetUnitId = animation.targetUnit ? animation.targetUnit.card.id : null
	}
}
