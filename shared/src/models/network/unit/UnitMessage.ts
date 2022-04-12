import PlayerInGame from '../../PlayerInGame'
import Unit from '../../Unit'
import AmbushCardMessage from '../card/AmbushCardMessage'
import CardMessage from '../card/CardMessage'
import OpenCardMessage from '../card/OpenCardMessage'

export default class UnitMessage {
	public readonly card: CardMessage
	public readonly ownerId: string
	public readonly rowIndex: number
	public readonly unitIndex: number

	public constructor(unit: Unit, forPlayer: PlayerInGame) {
		this.card = new OpenCardMessage(unit.card)
		if (unit.card.isAmbush && !unit.owner.players.some((player) => player.player.id === forPlayer.player.id)) {
			this.card = new AmbushCardMessage(unit.card)
		}
		this.ownerId = unit.owner.id
		this.rowIndex = unit.rowIndex
		this.unitIndex = unit.unitIndex
	}
}
