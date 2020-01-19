import CardOnBoard from '../CardOnBoard'

export default class MoveOrderMessage {
	unitId: string
	targetRowIndex: number

	constructor(unitId: string, targetRowIndex: number) {
		this.unitId = unitId
		this.targetRowIndex = targetRowIndex
	}

	public static fromUnitAndIndex(unit: CardOnBoard, targetRowIndex: number): MoveOrderMessage {
		return new MoveOrderMessage(unit.card.id, targetRowIndex)
	}
}
