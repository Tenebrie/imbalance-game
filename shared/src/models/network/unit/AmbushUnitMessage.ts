import Unit from '../../Unit'
import AmbushCardMessage from '../card/AmbushCardMessage'

export default class AmbushUnitMessage {
	public readonly card: AmbushCardMessage
	public readonly ownerId: string
	public readonly rowIndex: number
	public readonly unitIndex: number

	public constructor(unit: Unit) {
		this.card = new AmbushCardMessage(unit.card)
		this.ownerId = unit.owner.id
		this.rowIndex = unit.rowIndex
		this.unitIndex = unit.unitIndex
	}
}
