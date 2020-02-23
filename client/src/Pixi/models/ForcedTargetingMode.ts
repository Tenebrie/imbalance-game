import ClientCardTarget from '@/Pixi/models/ClientCardTarget'
import OutgoingMessageHandlers from '@/Pixi/handlers/OutgoingMessageHandlers'
import MouseHover from '@/Pixi/input/MouseHover'
import RenderedCardOnBoard from '@/Pixi/board/RenderedCardOnBoard'
import RenderedGameBoardRow from '@/Pixi/board/RenderedGameBoardRow'
import RichTextVariables from '@/Pixi/shared/models/RichTextVariables'
import RenderedCard from '@/Pixi/board/RenderedCard'

export default class ForcedTargetingMode {
	validTargets: ClientCardTarget[] = []
	selectedTarget: ClientCardTarget | null = null

	constructor(validTargets: ClientCardTarget[]) {
		this.validTargets = validTargets
	}

	public selectTarget(): void {
		const hoveredCard = MouseHover.getHoveredCard()
		const hoveredUnit = MouseHover.getHoveredUnit()
		const hoveredRow = MouseHover.getHoveredRow()

		this.selectedTarget = this.validTargets.find(target => {
			return (target.targetCard && target.targetCard === hoveredCard) || (target.targetUnit && target.targetUnit === hoveredUnit) || (target.targetRow && target.targetRow === hoveredRow)
		})
	}

	public isSelectedTargetValid(): boolean {
		if (!this.selectedTarget) {
			return false
		}

		const target = this.selectedTarget
		const hoveredCard = MouseHover.getHoveredCard()
		const hoveredUnit = MouseHover.getHoveredUnit()
		const hoveredRow = MouseHover.getHoveredRow()
		return (target.targetCard && target.targetCard === hoveredCard) || (target.targetUnit && target.targetUnit === hoveredUnit) || (target.targetRow && target.targetRow === hoveredRow)
	}

	public isUnitPotentialTarget(unit: RenderedCardOnBoard): boolean {
		return !!this.validTargets.find(target => target.targetUnit && target.targetUnit === unit)
	}

	public isRowPotentialTarget(row: RenderedGameBoardRow): boolean {
		return !!this.validTargets.find(target => target.targetRow && target.targetRow === row)
	}

	public getDisplayedLabel(): string {
		const hoveredCard = MouseHover.getHoveredCard()
		const hoveredUnit = MouseHover.getHoveredUnit()
		const hoveredRow = MouseHover.getHoveredRow()

		const hoveredTarget = this.validTargets.find(target => {
			return (target.targetCard && target.targetCard === hoveredCard) || (target.targetUnit && target.targetUnit === hoveredUnit) || (target.targetRow && target.targetRow === hoveredRow)
		})
		return hoveredTarget ? hoveredTarget.targetLabel : ''
	}

	public getDisplayedLabelVariables(): RichTextVariables {
		const hoveredCard = MouseHover.getHoveredCard()
		const hoveredUnit = MouseHover.getHoveredUnit()
		const hoveredRow = MouseHover.getHoveredRow()

		const hoveredTarget = this.validTargets.find(target => {
			return (target.targetCard && target.targetCard === hoveredCard) || (target.targetUnit && target.targetUnit === hoveredUnit) || (target.targetRow && target.targetRow === hoveredRow)
		})
		return hoveredTarget && hoveredTarget.sourceCard instanceof RenderedCard ? hoveredTarget.sourceCard.cardVariables : {}
	}

	public confirmTarget(): void {
		OutgoingMessageHandlers.sendCardTarget(this.selectedTarget)
		this.validTargets = []
		this.selectedTarget = null
	}
}
