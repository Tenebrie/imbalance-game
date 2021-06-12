import Animation from '../Animation'
import AnimationType from '../../enums/AnimationType'

export default class AnimationMessage {
	type: AnimationType
	sourceCardId: string | null
	sourceRowIndex: number | null
	sourceUnitId: string | null
	targetCardId: string | null
	targetCardIDs: string[] | null
	targetRowIndices: number[] | null
	params: any

	constructor(animation: Animation) {
		this.type = animation.type
		this.sourceCardId = animation.sourceCard ? animation.sourceCard.id : null
		this.sourceRowIndex = animation.sourceRow ? animation.sourceRow.index : null
		this.sourceUnitId = animation.sourceUnit ? animation.sourceUnit.card.id : null
		this.targetCardId = animation.targetCard ? animation.targetCard.id : null
		this.targetCardIDs = animation.targetCards ? animation.targetCards.map((card) => card.id) : null
		this.targetRowIndices = animation.targetRows ? animation.targetRows.map((row) => row.index) : null
		this.params = animation.params
	}
}
