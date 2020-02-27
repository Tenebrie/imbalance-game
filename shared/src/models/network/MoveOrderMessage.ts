import Unit from '../Unit'

export default class MoveOrderMessage {
	unitId: string
	targetRowIndex: number

	constructor(unitId: string, targetRowIndex: number) {
		this.unitId = unitId
		this.targetRowIndex = targetRowIndex
	}

	public static fromUnitAndIndex(unit: Unit, targetRowIndex: number): MoveOrderMessage {
		return new MoveOrderMessage(unit.card.id, targetRowIndex)
	}
}
