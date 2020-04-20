import Core from '@/Pixi/Core'
import Unit from '@shared/models/Unit'
import RenderedCard from '@/Pixi/board/RenderedCard'
import ClientPlayerInGame from '@/Pixi/models/ClientPlayerInGame'
import UnitMessage from '@shared/models/network/UnitMessage'

export default class RenderedUnit extends Unit {
	public card: RenderedCard
	public owner: ClientPlayerInGame

	public get rowIndex(): number {
		return Core.board.rows.indexOf(Core.board.getRowWithCard(this)!)
	}

	public get unitIndex(): number {
		return Core.board.rows[this.rowIndex].cards.indexOf(this)
	}

	public constructor(card: RenderedCard, owner: ClientPlayerInGame) {
		super(card, owner)
		this.card = card
		this.owner = owner
	}

	public setPower(value: number): void {
		this.card.setPower(value)
	}

	public static fromMessage(message: UnitMessage): RenderedUnit {
		const renderedCard = RenderedCard.fromMessage(message.card)
		const owner = Core.getPlayer(message.owner.id)
		return new RenderedUnit(renderedCard, owner)
	}
}
