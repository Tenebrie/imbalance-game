import Core from '@/Pixi/Core'
import CardOnBoard from '@/Pixi/shared/models/CardOnBoard'
import RenderedCard from '@/Pixi/models/RenderedCard'
import ClientPlayerInGame from '@/Pixi/models/ClientPlayerInGame'
import CardOnBoardMessage from '@/Pixi/shared/models/network/CardOnBoardMessage'
import UnitOrder from '@/Pixi/shared/models/UnitOrder'

export default class RenderedCardOnBoard extends CardOnBoard {
	card: RenderedCard
	owner: ClientPlayerInGame
	lastOrder: UnitOrder | null

	get rowIndex(): number {
		return Core.board.rows.indexOf(Core.board.getRowWithCard(this)!)
	}

	get unitIndex(): number {
		return Core.board.rows[this.rowIndex].cards.indexOf(this)
	}

	constructor(card: RenderedCard, owner: ClientPlayerInGame) {
		super(card, owner)
		this.card = card
		this.owner = owner
		this.lastOrder = null
	}

	public setPower(value: number): void {
		this.card.setPower(value)
	}

	public setAttack(value: number): void {
		this.card.setAttack(value)
	}

	public isTargetInRange(target: RenderedCardOnBoard): boolean {
		return Math.abs(this.rowIndex - target.rowIndex) <= this.card.attackRange
	}

	public static fromMessage(message: CardOnBoardMessage): RenderedCardOnBoard {
		const renderedCard = RenderedCard.fromMessage(message.card)
		const owner = Core.getPlayer(message.owner.id)
		return new RenderedCardOnBoard(renderedCard, owner)
	}
}
