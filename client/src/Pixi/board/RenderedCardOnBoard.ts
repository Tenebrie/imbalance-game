import Core from '@/Pixi/Core'
import CardOnBoard from '@/Pixi/shared/models/CardOnBoard'
import RenderedCard from '@/Pixi/board/RenderedCard'
import ClientPlayerInGame from '@/Pixi/models/ClientPlayerInGame'
import CardOnBoardMessage from '@/Pixi/shared/models/network/CardOnBoardMessage'

export default class RenderedCardOnBoard extends CardOnBoard {
	card: RenderedCard
	owner: ClientPlayerInGame

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
	}

	public setPower(value: number): void {
		this.card.setPower(value)
	}

	public static fromMessage(message: CardOnBoardMessage): RenderedCardOnBoard {
		const renderedCard = RenderedCard.fromMessage(message.card)
		const owner = Core.getPlayer(message.owner.id)
		return new RenderedCardOnBoard(renderedCard, owner)
	}
}
