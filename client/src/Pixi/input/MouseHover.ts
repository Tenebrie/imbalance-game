import RenderedCard from '@/Pixi/board/RenderedCard'
import Core from '@/Pixi/Core'
import RenderedUnit from '@/Pixi/board/RenderedUnit'
import RenderedGameBoardRow from '@/Pixi/board/RenderedGameBoardRow'

export default class MouseHover {
	public static getHoveredCard(): RenderedCard | null {
		if (!Core.input.hoveredCard) {
			return null
		}

		return Core.input.hoveredCard.card
	}

	public static getHoveredUnit(): RenderedUnit | null {
		if (!Core.input.hoveredCard || !Core.input.hoveredCard.card) {
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
