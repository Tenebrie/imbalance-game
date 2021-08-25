import RenderedCard from '@/Pixi/cards/RenderedCard'
import Core from '@/Pixi/Core'
import RenderedUnit from '@/Pixi/cards/RenderedUnit'
import RenderedGameBoardRow from '@/Pixi/cards/RenderedGameBoardRow'

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
		return Core.board.rows.find((row) => row.isHovered()) || null
	}
}
