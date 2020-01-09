import RenderedCard from '@/Pixi/models/RenderedCard'
import { TargetingMode } from '@/Pixi/enums/TargetingMode'

export default class GrabbedCard {
	card: RenderedCard
	targeting: TargetingMode

	constructor(card: RenderedCard, targeting: TargetingMode) {
		this.card = card
		this.targeting = targeting
	}
}
