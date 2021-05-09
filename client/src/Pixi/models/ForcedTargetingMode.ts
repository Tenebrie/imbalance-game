import OutgoingMessageHandlers from '@/Pixi/handlers/OutgoingMessageHandlers'
import MouseHover from '@/Pixi/input/MouseHover'
import RenderedUnit from '@/Pixi/cards/RenderedUnit'
import RenderedGameBoardRow from '@/Pixi/cards/RenderedGameBoardRow'
import RichTextVariables from '@shared/models/RichTextVariables'
import RenderedCard from '@/Pixi/cards/RenderedCard'
import AudioSystem from '@/Pixi/audio/AudioSystem'
import AudioEffectCategory from '@/Pixi/audio/AudioEffectCategory'
import TargetMode from '@shared/enums/TargetMode'
import TargetingLine from '@/Pixi/models/TargetingLine'
import Core from '@/Pixi/Core'
import CardTargetMessage from '@shared/models/network/CardTargetMessage'
import AnonymousTargetMessage from '@shared/models/network/AnonymousTargetMessage'
import TargetType from '@shared/enums/TargetType'
import { getCardInsertIndex } from '@/utils/Utils'

export default class ForcedTargetingMode {
	readonly targetMode: TargetMode
	readonly validTargets: CardTargetMessage[] | AnonymousTargetMessage[]
	readonly source: RenderedCard | null
	selectedTarget: CardTargetMessage | AnonymousTargetMessage | null = null

	readonly targetingLine: TargetingLine | null

	constructor(targetMode: TargetMode, validTargets: CardTargetMessage[] | AnonymousTargetMessage[], source: RenderedCard | null) {
		this.targetMode = targetMode
		this.validTargets = validTargets
		this.source = source
		if (source) {
			this.targetingLine = new TargetingLine()
			this.targetingLine.create()
		}
	}

	public selectTarget(): void {
		const hoveredCard = MouseHover.getHoveredCard()
		const hoveredRow = MouseHover.getHoveredRow()

		this.selectedTarget = this.validTargets.find((target) => {
			return (
				(target.targetType === TargetType.BOARD_POSITION &&
					hoveredRow &&
					hoveredRow.index === target.targetRowIndex &&
					getCardInsertIndex(hoveredRow) === target.targetPosition) ||
				(hoveredCard && target.targetCardId === hoveredCard.id) ||
				(target.targetType === TargetType.BOARD_ROW && hoveredRow && hoveredRow.index === target.targetRowIndex)
			)
		})
	}

	public isSelectedTargetValid(): boolean {
		if (!this.selectedTarget) {
			return false
		}

		const target = this.selectedTarget
		const hoveredCard = MouseHover.getHoveredCard()
		const hoveredRow = MouseHover.getHoveredRow()
		return (
			(hoveredCard && target.targetCardId === hoveredCard.id) || (hoveredRow && Core.board.getRow(target.targetRowIndex) === hoveredRow)
		)
	}

	public isUnitPotentialTarget(unit: RenderedUnit): boolean {
		return !!this.validTargets.find((target) => target.targetCardId === unit.card.id)
	}

	public isRowPotentialTarget(row: RenderedGameBoardRow): boolean {
		return !!this.validTargets.find(
			(target) => Core.board.getRow(target.targetRowIndex) && Core.board.getRow(target.targetRowIndex) === row
		)
	}

	public getDisplayedLabel(): string {
		const hoveredCard = MouseHover.getHoveredCard()
		const hoveredRow = MouseHover.getHoveredRow()

		const hoveredTarget = this.validTargets.find((target) => {
			return (
				(hoveredCard && target.targetCardId === hoveredCard.id) ||
				(Core.board.getRow(target.targetRowIndex) && Core.board.getRow(target.targetRowIndex) === hoveredRow)
			)
		})
		return hoveredTarget ? hoveredTarget.targetLabel : ''
	}

	public getDisplayedLabelVariables(): RichTextVariables {
		const hoveredCard = MouseHover.getHoveredCard()
		const hoveredRow = MouseHover.getHoveredRow()

		const hoveredTarget = this.validTargets.find((target) => {
			return (
				(hoveredCard && target.targetCardId === hoveredCard.id) ||
				(Core.board.getRow(target.targetRowIndex) && Core.board.getRow(target.targetRowIndex) === hoveredRow)
			)
		})
		if (!hoveredTarget || !('sourceCardId' in hoveredTarget)) {
			return {}
		}
		const sourceCard = Core.game.findCardById(hoveredTarget.sourceCardId)
		return sourceCard && sourceCard instanceof RenderedCard ? sourceCard.variables : {}
	}

	public confirmTarget(): void {
		AudioSystem.playEffect(AudioEffectCategory.TARGETING_CONFIRM)
		if ('sourceCardId' in this.selectedTarget) {
			OutgoingMessageHandlers.sendCardTarget(this.selectedTarget)
		} else {
			OutgoingMessageHandlers.sendAnonymousTarget(this.selectedTarget)
		}
		this.selectedTarget = null
	}

	public destroy(): void {
		if (this.targetingLine) {
			this.targetingLine.destroy()
		}
	}
}
