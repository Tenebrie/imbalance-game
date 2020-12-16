import ClientCardTarget from '@/Pixi/models/ClientCardTarget'
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

export default class ForcedTargetingMode {
	readonly targetMode: TargetMode
	readonly validTargets: ClientCardTarget[]
	readonly source: RenderedCard | null
	selectedTarget: ClientCardTarget | null = null

	readonly targetingLine: TargetingLine | null

	constructor(targetMode: TargetMode, validTargets: ClientCardTarget[], source: RenderedCard | null) {
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

		this.selectedTarget = this.validTargets.find(target => {
			return (target.targetCard && hoveredCard && target.targetCard.id === hoveredCard.id) ||
				(target.targetRow && target.targetRow === hoveredRow)
		})
	}

	public isSelectedTargetValid(): boolean {
		if (!this.selectedTarget) {
			return false
		}

		const target = this.selectedTarget
		const hoveredCard = MouseHover.getHoveredCard()
		const hoveredRow = MouseHover.getHoveredRow()
		return (target.targetCard && hoveredCard && target.targetCard.id === hoveredCard.id) ||
			(target.targetRow && target.targetRow === hoveredRow)
	}

	public isUnitPotentialTarget(unit: RenderedUnit): boolean {
		return !!this.validTargets.find(target => target.targetCard === unit.card)
	}

	public isRowPotentialTarget(row: RenderedGameBoardRow): boolean {
		return !!this.validTargets.find(target => target.targetRow && target.targetRow === row)
	}

	public getDisplayedLabel(): string {
		const hoveredCard = MouseHover.getHoveredCard()
		const hoveredRow = MouseHover.getHoveredRow()

		const hoveredTarget = this.validTargets.find(target => {
			return (target.targetCard && target.targetCard === hoveredCard) || (target.targetCard === hoveredCard) || (target.targetRow && target.targetRow === hoveredRow)
		})
		return hoveredTarget ? hoveredTarget.targetLabel : ''
	}

	public getDisplayedLabelVariables(): RichTextVariables {
		const hoveredCard = MouseHover.getHoveredCard()
		const hoveredRow = MouseHover.getHoveredRow()

		const hoveredTarget = this.validTargets.find(target => {
			return (target.targetCard && target.targetCard === hoveredCard) || (target.targetCard === hoveredCard) || (target.targetRow && target.targetRow === hoveredRow)
		})
		return hoveredTarget && hoveredTarget.sourceCard instanceof RenderedCard ? hoveredTarget.sourceCard.variables : {}
	}

	public confirmTarget(): void {
		AudioSystem.playEffect(AudioEffectCategory.TARGETING_CONFIRM)
		OutgoingMessageHandlers.sendCardTarget(this.selectedTarget)
		this.selectedTarget = null
	}

	public destroy(): void {
		if (this.targetingLine) {
			this.targetingLine.destroy()
		}
	}
}
