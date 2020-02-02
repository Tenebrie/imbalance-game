import Animation from '../Animation'
import AnimationType from '../../enums/AnimationType'

export default class AnimationMessage {
	type: AnimationType
	targetCardID: string | null
	sourceUnitID: string | null
	targetUnitIDs: string[] | null

	constructor(animation: Animation) {
		this.type = animation.type
		this.targetCardID = animation.targetCard ? animation.targetCard.id : null
		this.sourceUnitID = animation.sourceUnit ? animation.sourceUnit.card.id : null
		this.targetUnitIDs = animation.targetUnits ? animation.targetUnits.map(unit => unit.card.id) : null
	}
}
