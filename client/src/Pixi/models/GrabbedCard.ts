import RenderedCard from '@/Pixi/models/RenderedCard'
import TargetingLine from '@/Pixi/models/TargetingLine'
import { TargetingMode } from '@/Pixi/enums/TargetingMode'

export default class GrabbedCard {
	card: RenderedCard
	targetingMode: TargetingMode
	targetingLine: TargetingLine

	constructor(card: RenderedCard, targetingMode: TargetingMode) {
		this.card = card
		this.targetingMode = targetingMode
		this.targetingLine = new TargetingLine()
		this.targetingLine.create()
	}
}
