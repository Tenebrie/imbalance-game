import Unit from '../../Unit'
import OpenCardMessage from '../card/OpenCardMessage'

export default class OpenUnitMessage {
	public readonly card: OpenCardMessage
	public readonly ownerId: string
	public readonly rowIndex: number
	public readonly unitIndex: number

	public constructor(unit: Unit) {
		this.card = new OpenCardMessage(unit.card)
		this.ownerId = unit.owner.id
		this.rowIndex = unit.rowIndex
		this.unitIndex = unit.unitIndex
	}
}
