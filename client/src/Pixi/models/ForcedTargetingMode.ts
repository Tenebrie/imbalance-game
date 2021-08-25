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
	readonly validTargets: (CardTargetMessage | AnonymousTargetMessage)[]
	readonly sourceCardId: string | null
	selectedTarget: CardTargetMessage | AnonymousTargetMessage | null = null

	readonly targetingLine: TargetingLine | null = null

	constructor(targetMode: TargetMode, validTargets: CardTargetMessage[] | AnonymousTargetMessage[], source: RenderedCard | null) {
		this.targetMode = targetMode
		this.validTargets = validTargets
		this.sourceCardId = source ? source.id : null
		if (source) {
			this.targetingLine = new TargetingLine()
			this.targetingLine.create()
		}
	}

	public get source(): RenderedCard | null {
		return this.sourceCardId ? Core.game.findRenderedCardById(this.sourceCardId) : null
	}

	public selectTarget(): void {
		this.selectedTarget = this.findValidTarget()
	}

	private findValidTarget(): CardTargetMessage | AnonymousTargetMessage | null {
		const hoveredCard = MouseHover.getHoveredCard()
		const hoveredRow = MouseHover.getHoveredRow()
		return (
			this.validTargets.find((target) => {
				return (
					(target.targetType === TargetType.BOARD_POSITION &&
						hoveredRow &&
						hoveredRow.index === target.targetRowIndex &&
						(target instanceof AnonymousTargetMessage || getCardInsertIndex(hoveredRow) === target.targetPosition)) ||
					(hoveredCard && target.targetCardId === hoveredCard.id) ||
					(target.targetType === TargetType.BOARD_ROW && hoveredRow && hoveredRow.index === target.targetRowIndex)
				)
			}) || null
		)
	}

	public isSelectedTargetValid(): boolean {
		if (!this.selectedTarget) {
			return false
		}

		return this.findValidTarget() === this.selectedTarget
	}

	public isCardPotentialTarget(card: RenderedCard): boolean {
		return !!this.validTargets.find((target) => target.targetCardId === card.id)
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
		const hoveredTarget = this.findValidTarget()
		return hoveredTarget ? (hoveredTarget.targetMode === TargetMode.CARD_PLAY ? 'card.play' : hoveredTarget.targetLabel) : ''
	}

	public getDisplayedLabelVariables(): RichTextVariables {
		const hoveredTarget = this.findValidTarget()
		if (!hoveredTarget || !('sourceCardId' in hoveredTarget)) {
			return {}
		}
		const sourceCard = Core.game.findCardById(hoveredTarget.sourceCardId)
		return sourceCard && sourceCard instanceof RenderedCard ? sourceCard.variables : {}
	}

	public confirmTarget(): void {
		if (!this.selectedTarget) {
			return
		}

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
