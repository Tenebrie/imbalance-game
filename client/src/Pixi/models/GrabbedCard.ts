import RenderedCard from '@/Pixi/models/RenderedCard'
import TargetingArrow from '@/Pixi/models/TargetingArrow'
import { TargetingMode } from '@/Pixi/enums/TargetingMode'

export default class GrabbedCard {
	card: RenderedCard
	targetingMode: TargetingMode
	targetingArrow: TargetingArrow

	constructor(card: RenderedCard, targetingMode: TargetingMode) {
		this.card = card
		this.targetingMode = targetingMode
		this.targetingArrow = new TargetingArrow()
	}
}
