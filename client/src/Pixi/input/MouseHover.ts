import RenderedCard from '@/Pixi/board/RenderedCard'
import Core from '@/Pixi/Core'
import RenderedCardOnBoard from '@/Pixi/board/RenderedCardOnBoard'
import RenderedGameBoardRow from '@/Pixi/board/RenderedGameBoardRow'

export default class MouseHover {
	public static getHoveredCard(): RenderedCard | null {
		if (!Core.input.hoveredCard) {
			return null
		}

		return Core.input.hoveredCard.card
	}

	public static getHoveredUnit(): RenderedCardOnBoard | null {
		if (!Core.input.hoveredCard) {
			return null
		}

		const unit = Core.board.findUnitById(Core.input.hoveredCard.card.id)
		if (!unit) {
			return null
		}

		return unit
	}

	public static getHoveredRow(): RenderedGameBoardRow | null {
		return Core.board.rows.find(row => row.isHovered())
	}
}
