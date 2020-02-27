import AnimationType from '../enums/AnimationType'
import Unit from './Unit'
import Card from './Card'

export default class Animation {
	type: AnimationType
	targetCard: Card | null
	sourceUnit: Unit | null
	targetUnits: Unit[] | null
	projectileCount: number

	constructor(type: AnimationType) {
		this.type = type
	}
}
