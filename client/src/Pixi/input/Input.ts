import Core from '@/Pixi/Core'
import * as PIXI from 'pixi.js'
import CardType from '@shared/enums/CardType'
import HoveredCard from '@/Pixi/models/HoveredCard'
import GrabbedCard from '@/Pixi/models/GrabbedCard'
import RenderedCard from '@/Pixi/cards/RenderedCard'
import { GrabbedCardMode } from '@/Pixi/enums/GrabbedCardMode'
import OutgoingMessageHandlers from '@/Pixi/handlers/OutgoingMessageHandlers'
import GameTurnPhase from '@shared/enums/GameTurnPhase'
import RenderedGameBoardRow from '@/Pixi/cards/RenderedGameBoardRow'
import TargetType from '@shared/enums/TargetType'
import ForcedTargetingMode from '@/Pixi/models/ForcedTargetingMode'
import MouseHover from '@/Pixi/input/MouseHover'
import AudioSystem from '@/Pixi/audio/AudioSystem'
import AudioEffectCategory from '@/Pixi/audio/AudioEffectCategory'
import store from '@/Vue/store'
import CardRefMessage from '@shared/models/network/card/CardRefMessage'
import TargetMode from '@shared/enums/TargetMode'
import CardTargetMessage from '@shared/models/network/CardTargetMessage'
import { isGrabbedCardPlayableToRow } from '@/Pixi/input/ValidActions'
import CardLocation from '@shared/enums/CardLocation'
import { HoveredCardLocation } from '@/Pixi/enums/HoveredCardLocation'
import AnonymousTargetMessage from '@shared/models/network/AnonymousTargetMessage'

export const LEFT_MOUSE_BUTTON = 0
export const RIGHT_MOUSE_BUTTON = 2

enum InspectCardMode {
	CLICK,
	HOLD,
}

interface ShadowUnit {
	card: RenderedCard
	rowIndex: number
	unitIndex: number
}

export default class Input {
	leftMouseDown = false
	rightMouseDown = false
	mousePosition: PIXI.Point = new PIXI.Point(-10000, -10000)
	cardLimbo: RenderedCard[] = []
	hoveredCard: HoveredCard | null = null
	grabbedCard: GrabbedCard | null = null
	inspectedCard: RenderedCard | null = null

	limboShadowUnit: ShadowUnit | null = null
	hoveredShadowUnit: ShadowUnit | null = null

	playableCards: CardTargetMessage[] = []
	forcedTargetingMode: ForcedTargetingMode | null = null
	forcedTargetingCards: RenderedCard[] = []

	inspectCardMode: InspectCardMode = InspectCardMode.CLICK

	constructor() {
		const view = Core.renderer.pixi.view

		view.addEventListener('mousedown', (event: MouseEvent) => {
			this.onMouseDown(event)
		})
		view.addEventListener('touchstart', (event: TouchEvent) => {
			this.onTouchStart(event)
		})

		view.addEventListener('mouseup', (event: MouseEvent) => {
			this.onMouseUp(event)
		})
		view.addEventListener('touchend', () => {
			this.onTouchEnd()
		})

		view.addEventListener('mousemove', (event: MouseEvent) => {
			this.onMouseMove(event)
			this.updateCardHoverStatus()
			if (this.rightMouseDown && this.inspectCardMode === InspectCardMode.HOLD) {
				this.inspectCard()
			}
		})
		view.addEventListener('touchmove', (event: TouchEvent) => {
			this.onTouchMove(event)
		})
	}

	public tick(): void {
		this.updateCardHoverStatus()
	}

	public updateGrabbedCard(): void {
		if (!this.grabbedCard || this.grabbedCard.card.location !== CardLocation.HAND || this.grabbedCard.card.owner !== Core.player) {
			return
		}

		const validRows = this.playableCards
			.filter((playableCard) => playableCard.sourceCardId === this.grabbedCard.card.id)
			.map((playableCard) => Core.board.getRow(playableCard.targetRowIndex))
		this.grabbedCard.updateValidTargetRows(validRows)
	}

	public updateCardHoverStatus(): void {
		let hoveredCard: HoveredCard | null = null
		const selectableCards = this.forcedTargetingCards.slice().reverse()
		if (selectableCards.length > 0 && store.state.gameStateModule.popupTargetingCardsVisible) {
			const hoveredSelectableCard = selectableCards.find((card) => card.isHovered()) || null
			if (hoveredSelectableCard) {
				hoveredCard = HoveredCard.fromSelectableCard(hoveredSelectableCard)
			}
			this.hoveredCard = hoveredCard
			return
		}

		const gameBoardCards = Core.board.rows.map((row) => row.cards).flat()
		const playerHandCards = Core.player.cardHand.allCards.slice().reverse()
		const opponentHandCards = Core.opponent ? Core.opponent.cardHand.allCards.slice().reverse() : []

		const hoveredCardOnBoard = gameBoardCards.find((cardOnBoard) => cardOnBoard.card.isHovered()) || null
		if (hoveredCardOnBoard) {
			hoveredCard = HoveredCard.fromCardOnBoard(hoveredCardOnBoard)
		}

		const hoveredCardInPlayerHand = playerHandCards.find((card) => card.isHovered()) || null
		if (hoveredCardInPlayerHand) {
			hoveredCard = HoveredCard.fromCardInHand(hoveredCardInPlayerHand, Core.player)
		}

		const hoveredCardInOpponentHand = opponentHandCards.find((card) => card.isHovered()) || null
		if (hoveredCardInOpponentHand) {
			hoveredCard = HoveredCard.fromCardInHand(hoveredCardInOpponentHand, Core.opponent)
		}

		if (Core.mainHandler.announcedCard && Core.mainHandler.announcedCard.isHovered()) {
			hoveredCard = HoveredCard.fromAnnouncedCard(Core.mainHandler.announcedCard)
		}

		this.hoveredCard = hoveredCard

		const hoveredRow = MouseHover.getHoveredRow()
		if (
			hoveredRow &&
			this.grabbedCard &&
			this.grabbedCard.mode === GrabbedCardMode.CARD_PLAY &&
			this.grabbedCard.validTargetRows.includes(hoveredRow) &&
			this.grabbedCard.card.type === CardType.UNIT
		) {
			this.hoveredShadowUnit = {
				card: this.grabbedCard.card,
				rowIndex: hoveredRow.index,
				unitIndex: this.getCardInsertIndex(hoveredRow),
			}
		} else {
			this.hoveredShadowUnit = null
		}
	}

	private onMouseDown(event: MouseEvent) {
		if (event.button === RIGHT_MOUSE_BUTTON && (event.ctrlKey || event.shiftKey)) {
			return
		}

		if (this.inspectedCard) {
			store.dispatch.inspectedCard.undoCard()
			return
		}

		if (event.button === LEFT_MOUSE_BUTTON && this.grabbedCard) {
			this.useGrabbedCard()
			return
		}

		if (event.button === RIGHT_MOUSE_BUTTON && this.grabbedCard) {
			this.releaseCard()
			return
		}

		if (event.button === RIGHT_MOUSE_BUTTON && this.hoveredCard) {
			this.inspectCardMode = InspectCardMode.CLICK
			this.inspectCard()
			return
		}

		if (event.button === LEFT_MOUSE_BUTTON && this.hoveredCard && this.hoveredCard.card === Core.mainHandler.announcedCard) {
			Core.mainHandler.skipCardAnnounce()
			return
		}

		if (Core.isSpectating) {
			return
		}

		if (this.forcedTargetingMode && this.forcedTargetingMode.targetMode === TargetMode.BROWSE) {
			return
		}

		if (this.forcedTargetingMode && event.button === LEFT_MOUSE_BUTTON && store.state.gameStateModule.popupTargetingCardsVisible) {
			this.forcedTargetingMode.selectTarget()
			return
		}

		if (event.button === LEFT_MOUSE_BUTTON) {
			this.leftMouseDown = true
			this.grabCard()
		} else if (event.button === RIGHT_MOUSE_BUTTON) {
			this.rightMouseDown = true
			this.inspectCardMode = InspectCardMode.HOLD
		}
	}

	private onTouchStart(event: TouchEvent) {
		// Notifications.info(`${}`)
		this.onTouchMove(event)

		if (this.inspectedCard) {
			store.dispatch.inspectedCard.undoCard()
			return
		}

		if (this.grabbedCard) {
			this.useGrabbedCard()
			return
		}

		if (this.hoveredCard && this.hoveredCard.card === Core.mainHandler.announcedCard) {
			Core.mainHandler.skipCardAnnounce()
			return
		}

		if (Core.isSpectating) {
			return
		}

		if (this.forcedTargetingMode && this.forcedTargetingMode.targetMode === TargetMode.BROWSE) {
			return
		}

		if (this.forcedTargetingMode && store.state.gameStateModule.popupTargetingCardsVisible) {
			this.forcedTargetingMode.selectTarget()
			return
		}

		this.leftMouseDown = true
		this.grabCard()
	}

	private onTouchMove(event: TouchEvent) {
		const view = Core.renderer.pixi.view
		const clientRect = view.getBoundingClientRect()
		this.mousePosition = new PIXI.Point(event.touches[0].clientX - clientRect.left, event.touches[0].clientY - clientRect.top)
	}

	private onMouseUp(event: MouseEvent) {
		if (this.forcedTargetingMode && this.forcedTargetingMode.isSelectedTargetValid() && event.button === LEFT_MOUSE_BUTTON) {
			this.forcedTargetingMode.confirmTarget()
			return
		}

		if (event.button === LEFT_MOUSE_BUTTON) {
			this.leftMouseDown = false
			if (this.grabbedCard && !this.grabbedCard.shouldStick()) {
				this.useGrabbedCard()
			}
		} else if (event.button === RIGHT_MOUSE_BUTTON && this.rightMouseDown) {
			this.rightMouseDown = false
			this.inspectCard()
		}
	}

	private onTouchEnd() {
		if (this.forcedTargetingMode && this.forcedTargetingMode.isSelectedTargetValid()) {
			this.forcedTargetingMode.confirmTarget()
			return
		}

		this.leftMouseDown = false
		if (this.grabbedCard && !this.grabbedCard.shouldStick()) {
			this.useGrabbedCard()
		}
	}

	private onMouseMove(event: MouseEvent) {
		const view = Core.renderer.pixi.view
		const clientRect = view.getBoundingClientRect()
		this.mousePosition = new PIXI.Point(event.clientX - clientRect.left, event.clientY - clientRect.top)
		this.mousePosition.x *= window.devicePixelRatio * Core.renderer.superSamplingLevel
		this.mousePosition.y *= window.devicePixelRatio * Core.renderer.superSamplingLevel
	}

	public grabCard(): void {
		const hoveredCard = this.hoveredCard
		if (!hoveredCard || hoveredCard.owner !== Core.player) {
			return
		}

		const card = hoveredCard.card

		if (hoveredCard.location === HoveredCardLocation.HAND && hoveredCard.owner === Core.player) {
			const validRows = this.playableCards
				.filter((playableCard) => playableCard.sourceCardId === card.id)
				.map((playableCard) => Core.board.getRow(playableCard.targetRowIndex))
			this.grabbedCard = GrabbedCard.cardPlay(card, validRows)
		} else if (
			hoveredCard.location === HoveredCardLocation.BOARD &&
			hoveredCard.owner === Core.player &&
			Core.game.turnPhase === GameTurnPhase.DEPLOY &&
			Core.board.getValidOrdersForUnit(Core.board.findUnitById(card.id)).length > 0
		) {
			const validOrders = Core.board.getValidOrdersForUnit(Core.board.findUnitById(card.id))
			const validCards = validOrders
				.filter((order) => order.targetType === TargetType.UNIT)
				.map((order) => order.targetCardId)
				.map((id) => Core.game.findRenderedCardById(id))
			const validRows = validOrders
				.filter((order) => order.targetType === TargetType.BOARD_ROW)
				.map((order) => Core.board.getRow(order.targetRowIndex))
			this.grabbedCard = GrabbedCard.cardOrder(card, validCards, validRows)
		} else if (hoveredCard.location === HoveredCardLocation.SELECTABLE) {
			this.grabbedCard = GrabbedCard.cardSelect(card)
		}
	}

	public inspectCard(): void {
		const hoveredCard = this.hoveredCard
		if (!hoveredCard) {
			store.dispatch.inspectedCard.undoCard()
			return
		}

		this.inspectedCard = hoveredCard.card
		store.commit.gameStateModule.setInspectedCard(this.inspectedCard)
		store.dispatch.inspectedCard.setCard({ card: hoveredCard.card })
	}

	public releaseInspectedCard(): void {
		this.inspectedCard = null
		store.commit.gameStateModule.setInspectedCard(null)
	}

	public useGrabbedCard(): void {
		if (!this.grabbedCard) {
			return
		}

		if (this.grabbedCard.mode === GrabbedCardMode.CARD_PLAY && isGrabbedCardPlayableToRow(MouseHover.getHoveredRow())) {
			this.onCardPlay(this.grabbedCard.card)
		} else if (this.grabbedCard.mode === GrabbedCardMode.CARD_ORDER) {
			this.onUnitOrder(this.grabbedCard.card)
		} else if (this.grabbedCard.mode === GrabbedCardMode.CARD_SELECT) {
			this.onCardSelect(this.grabbedCard.card)
		}

		this.releaseCard()
	}

	public releaseCard(): void {
		const grabbedCard = this.grabbedCard!
		grabbedCard.targetingLine.destroy()
		this.grabbedCard = null
		this.updateCardHoverStatus()
	}

	private getCardInsertIndex(hoveredRow: RenderedGameBoardRow): number {
		const hoveredUnit = this.hoveredCard
		if (!hoveredUnit || !hoveredRow.includesCard(hoveredUnit.card)) {
			return this.mousePosition.x > hoveredRow.container.position.x ? hoveredRow.cards.length : 0
		}
		let index = hoveredRow.getCardIndex(hoveredUnit.card)
		if (this.mousePosition.x > hoveredUnit.card.hitboxSprite.position.x) {
			index += 1
		}
		return index
	}

	private onCardPlay(card: RenderedCard): void {
		const hoveredRow = MouseHover.getHoveredRow()
		if (!hoveredRow) {
			return
		}

		if (card.type === CardType.SPELL) {
			OutgoingMessageHandlers.sendSpellCardPlayed(card)
		} else if (card.type === CardType.UNIT) {
			OutgoingMessageHandlers.sendUnitCardPlayed(card, hoveredRow, this.getCardInsertIndex(hoveredRow))
			this.limboShadowUnit = {
				card: card,
				rowIndex: hoveredRow.index,
				unitIndex: this.getCardInsertIndex(hoveredRow),
			}
		}
		this.cardLimbo.push(card)
		Core.player.cardHand.removeCard(card)
		Core.renderer.hideCard(card)
	}

	private onUnitOrder(orderedCard: RenderedCard): void {
		const orderedUnit = Core.board.findUnitById(orderedCard.id)!
		const hoveredCard = MouseHover.getHoveredCard()
		const hoveredRow = MouseHover.getHoveredRow()

		const validOrders = Core.board.getValidOrdersForUnit(orderedUnit)
		const performedOrder = validOrders.find(
			(order) => order.targetCardId === hoveredCard.id || (hoveredRow && Core.board.getRow(order.targetRowIndex) === hoveredRow)
		)
		if (performedOrder) {
			OutgoingMessageHandlers.sendUnitOrder(performedOrder)
		}
	}

	private onCardSelect(selectedCard: RenderedCard): void {
		const hoveredCard = MouseHover.getHoveredCard()
		if (hoveredCard !== selectedCard) {
			return
		}

		AudioSystem.playEffect(AudioEffectCategory.TARGETING_CONFIRM)
		const message = this.forcedTargetingMode.validTargets.find((target) => target.targetCardData.id === selectedCard.id)
		if ('sourceCardId' in message) {
			OutgoingMessageHandlers.sendCardTarget(message)
		} else {
			OutgoingMessageHandlers.sendAnonymousTarget(message)
		}
	}

	public restoreLimboCard(cardMessage: CardRefMessage): RenderedCard {
		const cardInLimbo = this.cardLimbo.find((card) => card.id === cardMessage.id)
		if (!cardInLimbo) {
			return
		}

		Core.renderer.showCard(cardInLimbo)
		this.evictCardFromLimbo(cardMessage.id)
		return cardInLimbo
	}

	private evictCardFromLimbo(cardId: string): void {
		this.cardLimbo = this.cardLimbo.filter((card) => card.id !== cardId)
		if (this.limboShadowUnit && this.limboShadowUnit.card.id === cardId) {
			this.limboShadowUnit = null
		}
	}

	public async enableForcedTargetingMode(
		targetMode: TargetMode,
		validTargets: CardTargetMessage[] | AnonymousTargetMessage[],
		source: CardRefMessage | null
	): Promise<void> {
		if (this.forcedTargetingMode) {
			this.forcedTargetingMode.destroy()
		}

		const sourceCard: RenderedCard | null = source ? Core.game.findRenderedCardById(source.id, [CardLocation.STACK]) : null
		await this.createForcedTargetingCards(validTargets)
		this.forcedTargetingMode = new ForcedTargetingMode(targetMode, validTargets, this.forcedTargetingCards.length === 0 ? sourceCard : null)
		store.commit.gameStateModule.setPopupTargetingMode(targetMode)
		store.commit.gameStateModule.setPopupTargetingCardCount(this.forcedTargetingCards.length)
		store.commit.gameStateModule.setPopupTargetingCardsVisible(true)
	}

	public async createForcedTargetingCards(targets: CardTargetMessage[] | AnonymousTargetMessage[]): Promise<void> {
		const newCards = targets
			.filter(
				(target) =>
					target.targetType === TargetType.CARD_IN_LIBRARY ||
					target.targetType === TargetType.CARD_IN_UNIT_DECK ||
					target.targetType === TargetType.CARD_IN_SPELL_DECK
			)
			.map((target) => target.targetCardData)

		const existingCards = this.forcedTargetingCards
		const addedCardMessages = newCards.filter((card) => !existingCards.find((existingCard) => existingCard.id === card.id))

		const cardsToAdd = addedCardMessages.map((message) => RenderedCard.fromMessage(message))
		const cardsToRemove = existingCards.filter((card) => newCards.every((newCard) => newCard.id !== card.id))
		const result = existingCards
			.reduce<RenderedCard[]>((result, existingCard) => {
				if (cardsToRemove.includes(existingCard) && cardsToAdd.length > 0) {
					return result.concat(cardsToAdd.shift())
				} else if (cardsToRemove.includes(existingCard)) {
					return result
				}

				return result.concat(existingCard)
			}, [])
			.concat(cardsToAdd)

		cardsToRemove.forEach((card) => Core.destroyCard(card))
		PIXI.Ticker.shared.addOnce(() => {
			result.forEach((card) => card.resetDisplayMode())
		})

		this.forcedTargetingCards = result
	}

	public disableForcedTargetingMode(): void {
		if (!this.forcedTargetingMode) {
			return
		}
		this.forcedTargetingMode.destroy()
		this.forcedTargetingMode = null
		this.forcedTargetingCards.forEach((card) => Core.destroyCard(card))
		this.forcedTargetingCards = []
		store.commit.gameStateModule.setPopupTargetingMode(null)
		store.commit.gameStateModule.setPopupTargetingCardCount(0)
	}
}
