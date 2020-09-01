import Core from '@/Pixi/Core'
import Unit from '@shared/models/Unit'
import RenderedCard from '@/Pixi/cards/RenderedCard'
import ClientPlayerInGame from '@/Pixi/models/ClientPlayerInGame'
import UnitMessage from '@shared/models/network/UnitMessage'

export default class RenderedUnit implements Unit {
	public card: RenderedCard
	public owner: ClientPlayerInGame

	public constructor(card: RenderedCard, owner: ClientPlayerInGame) {
		this.card = card
		this.owner = owner
	}

	public get rowIndex(): number {
		return Core.board.rows.indexOf(Core.board.getRowWithCard(this)!)
	}

	public get unitIndex(): number {
		return Core.board.rows[this.rowIndex].cards.indexOf(this)
	}

	public setPower(value: number): void {
		this.card.setPower(value)
	}

	public setArmor(value: number): void {
		this.card.setArmor(value)
	}

	public static fromMessage(message: UnitMessage): RenderedUnit {
		const renderedCard = RenderedCard.fromMessage(message.card)
		const owner = Core.getPlayer(message.ownerId)
		return new RenderedUnit(renderedCard, owner)
	}
}
