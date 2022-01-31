import CardLocation from '@shared/enums/CardLocation'
import CardType from '@shared/enums/CardType'
import GameTurnPhase from '@shared/enums/GameTurnPhase'
import TargetMode from '@shared/enums/TargetMode'
import TargetType from '@shared/enums/TargetType'
import AnonymousTargetMessage from '@shared/models/network/AnonymousTargetMessage'
import CardRefMessage from '@shared/models/network/card/CardRefMessage'
import CardTargetMessage from '@shared/models/network/CardTargetMessage'
import gsap from 'gsap'
import * as PIXI from 'pixi.js'

import AudioEffectCategory from '@/Pixi/audio/AudioEffectCategory'
import AudioSystem from '@/Pixi/audio/AudioSystem'
import RenderedCard from '@/Pixi/cards/RenderedCard'
import Core from '@/Pixi/Core'
import { GrabbedCardMode } from '@/Pixi/enums/GrabbedCardMode'
import { HoveredCardLocation } from '@/Pixi/enums/HoveredCardLocation'
import OutgoingMessageHandlers from '@/Pixi/handlers/OutgoingMessageHandlers'
import MouseHover from '@/Pixi/input/MouseHover'
import { isGrabbedCardPlayableToRow } from '@/Pixi/input/ValidActions'
import ClientPlayerGroup from '@/Pixi/models/ClientPlayerGroup'
import ClientPlayerInGame from '@/Pixi/models/ClientPlayerInGame'
import ForcedTargetingMode from '@/Pixi/models/ForcedTargetingMode'
import GrabbedCard from '@/Pixi/models/GrabbedCard'
import HoveredCard from '@/Pixi/models/HoveredCard'
import { getRenderScale } from '@/Pixi/renderer/RendererUtils'
import { boopTheBoard, flushBoardBoopPreps, getCardInsertIndex, getDistance, normalizeBoardRowIndex, scrollBoopColor } from '@/utils/Utils'
import store from '@/Vue/store'
import gameObjectiveStore from '@/Vue/store/GameObjectiveStore'
import InspectedCardStore from '@/Vue/store/InspectedCardStore'

export const LEFT_MOUSE_BUTTON = 0
export const RIGHT_MOUSE_BUTTON = 2
export const MIDDLE_MOUSE_BUTTON = 1

enum InspectCardMode {
	CLICK,
	HOLD,
}

interface ShadowUnit {
	card: RenderedCard | null
	rowIndex: number
	unitIndex: number
}

export default class Input {
	leftMouseDown = false
	rightMouseDown = false
	mousePosition: PIXI.Point = new PIXI.Point(-10000, -10000)
	windowMousePosition: PIXI.Point = new PIXI.Point(-10000, -10000)
	cardLimbo: RenderedCard[] = []
	hoveredCard: HoveredCard | null = null
	grabbedCard: GrabbedCard | null = null
	inspectedCard: RenderedCard | null = null

	limboShadowUnit: ShadowUnit | null = null
	hoveredShadowUnit: ShadowUnit | null = null
	tutoredShadowUnit: ShadowUnit | null = null

	playableCards: CardTargetMessage[] = []
	forcedTargetingMode: ForcedTargetingMode | null = null
	forcedTargetingCards: RenderedCard[] = []
	discardedForcedTargetingCards: RenderedCard[] = []

	inspectCardMode: InspectCardMode = InspectCardMode.CLICK

	boardBoopStartedAt: PIXI.Point | null = null
	boopTrailLastSeenAt: PIXI.Point | null = null

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
		document.addEventListener('mousemove', (event: MouseEvent) => {
			this.onWindowMouseMove(event)
		})
		view.addEventListener('touchmove', (event: TouchEvent) => {
			this.onTouchMove(event)
		})

		view.addEventListener('wheel', (event: WheelEvent) => {
			if (event.deltaY > 0) {
				Input.onScrollDown(event)
			} else if (event.deltaY < 0) {
				Input.onScrollUp(event)
			}
		})

		view.addEventListener('mouseleave', () => {
			Input.onMouseLeave()
			if (this.grabbedCard) {
				this.releaseCard()
			}
			this.leftMouseDown = false
			this.rightMouseDown = false
		})
	}

	public tick(): void {
		this.updateCardHoverStatus()
		if (this.inspectedCard && !this.inspectedCard.hasVisualPosition()) {
			InspectedCardStore.dispatch.clear()
		}
	}

	public restoreMousePosition(): void {
		this.mousePosition = this.windowMousePosition
		this.updateCardHoverStatus()
	}

	public updateGrabbedCard(): void {
		const grabbedCard = this.grabbedCard
		if (!grabbedCard || grabbedCard.card.location !== CardLocation.HAND || grabbedCard.card.owner !== Core.player.players[0]) {
			return
		}

		const validRows = this.playableCards
			.filter((playableCard) => playableCard.sourceCardId === grabbedCard.card.id)
			.map((playableCard) => ({
				row: Core.board.getRow(playableCard.targetRowIndex)!,
				position: playableCard.targetPosition,
			}))
			.filter((rowWrapper) => !!rowWrapper.row)
		grabbedCard.updateValidTargetRows(validRows)
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

		const leaderCards = Core.allPlayers.map((player) => player.leader)
		const gameBoardCards = Core.board.rows.map((row) => row.cards).flat()
		const playerHandCards = Core.allPlayers
			.flatMap((player) => player.cardHand.allCards)
			.slice()
			.reverse()

		const hoveredLeaderCard = leaderCards.find((leaderCard) => leaderCard?.isHovered()) || null
		if (hoveredLeaderCard) {
			hoveredCard = HoveredCard.fromCardInHand(hoveredLeaderCard, hoveredLeaderCard.ownerPlayer)
		}

		const hoveredCardOnBoard = gameBoardCards.find((cardOnBoard) => cardOnBoard.card.isHovered()) || null
		if (hoveredCardOnBoard) {
			hoveredCard = HoveredCard.fromCardOnBoard(hoveredCardOnBoard)
		}

		const hoveredCardInPlayerHand = playerHandCards.find((card) => card.isHovered()) || null
		if (hoveredCardInPlayerHand) {
			hoveredCard = HoveredCard.fromCardInHand(hoveredCardInPlayerHand, hoveredCardInPlayerHand.ownerPlayer)
		}

		if (Core.mainHandler.announcedCard && Core.mainHandler.announcedCard.isHovered()) {
			hoveredCard = HoveredCard.fromAnnouncedCard(Core.mainHandler.announcedCard)
		}

		this.hoveredCard = hoveredCard

		const hoveredRow = MouseHover.getHoveredRow()
		if (hoveredRow) {
			const cardInsertIndex = getCardInsertIndex(hoveredRow)
			const isGrabbingCard =
				hoveredRow &&
				this.grabbedCard &&
				this.grabbedCard.mode === GrabbedCardMode.CARD_PLAY &&
				this.grabbedCard.validTargetPositions.find(
					(targetPosition) => targetPosition.row === hoveredRow && targetPosition.position === cardInsertIndex
				) &&
				this.grabbedCard.card.type === CardType.UNIT
			const isTargetingPosition =
				hoveredRow &&
				this.forcedTargetingMode &&
				this.forcedTargetingMode.validTargets.some(
					(target) =>
						target.targetType === TargetType.BOARD_POSITION &&
						hoveredRow.index === target.targetRowIndex &&
						(target instanceof AnonymousTargetMessage || cardInsertIndex === target.targetPosition)
				)

			if (isGrabbingCard || isTargetingPosition) {
				this.hoveredShadowUnit = {
					card: null,
					rowIndex: normalizeBoardRowIndex(hoveredRow.index, 'player'),
					unitIndex: cardInsertIndex,
				}
			} else {
				this.hoveredShadowUnit = null
			}
		} else {
			this.hoveredShadowUnit = null
		}
		if (hoveredCard && !this.grabbedCard) {
			store.commit.gameStateModule.setPlayerSpellManaInDanger(hoveredCard.card.stats.spellCost)
		} else if (!this.grabbedCard) {
			store.commit.gameStateModule.setPlayerSpellManaInDanger(0)
		}
	}

	private onMouseDown(event: MouseEvent) {
		if (event.button === LEFT_MOUSE_BUTTON) {
			this.leftMouseDown = true
		} else if (event.button === RIGHT_MOUSE_BUTTON) {
			this.rightMouseDown = true
		}

		if (event.button === RIGHT_MOUSE_BUTTON && event.ctrlKey) {
			return
		}

		gameObjectiveStore.commit.hide()

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

		if (event.button === LEFT_MOUSE_BUTTON && this.hoveredCard) {
			this.grabCard()
			return
		}

		if (event.button === LEFT_MOUSE_BUTTON && !this.grabbedCard && !this.hoveredCard) {
			boopTheBoard(event, this.mousePosition, 'down')
		} else if (event.button === RIGHT_MOUSE_BUTTON && !this.grabbedCard && !this.hoveredCard) {
			boopTheBoard(event, this.mousePosition, 'down')
		} else if (event.button === MIDDLE_MOUSE_BUTTON) {
			boopTheBoard(event, this.mousePosition, 'down')
		}
		this.boardBoopStartedAt = this.mousePosition.clone()
	}

	private onTouchStart(event: TouchEvent) {
		this.onTouchMove(event)
		gameObjectiveStore.commit.hide()

		if (this.inspectedCard) {
			InspectedCardStore.dispatch.undoCard()
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
		if (event.button === LEFT_MOUSE_BUTTON) {
			this.leftMouseDown = false
		} else if (event.button === RIGHT_MOUSE_BUTTON) {
			this.rightMouseDown = false
		}

		if (this.forcedTargetingMode && this.forcedTargetingMode.isSelectedTargetValid() && event.button === LEFT_MOUSE_BUTTON) {
			if (
				this.forcedTargetingMode.targetMode === TargetMode.CARD_PLAY &&
				this.forcedTargetingMode.source &&
				this.forcedTargetingMode.selectedTarget
			) {
				this.tutoredShadowUnit = {
					card: this.forcedTargetingMode.source,
					rowIndex: normalizeBoardRowIndex(this.forcedTargetingMode.selectedTarget.targetRowIndex, 'player'),
					unitIndex: getCardInsertIndex(Core.board.rows[this.forcedTargetingMode.selectedTarget.targetRowIndex]),
				}
			}
			this.forcedTargetingMode.confirmTarget()
			if (this.forcedTargetingMode.targetMode === TargetMode.CARD_PLAY) {
				this.enableForcedTargetingMode(TargetMode.CARD_PLAY, [], null)
			}
			return
		}

		if (event.button === LEFT_MOUSE_BUTTON && !this.grabbedCard && this.boardBoopStartedAt) {
			boopTheBoard(event, this.boardBoopStartedAt, 'up')
		} else if (event.button === RIGHT_MOUSE_BUTTON && !this.hoveredCard && !this.grabbedCard) {
			boopTheBoard(event, this.boardBoopStartedAt, 'up')
		} else if (event.button === MIDDLE_MOUSE_BUTTON) {
			boopTheBoard(event, this.boardBoopStartedAt, 'up')
		}

		if (event.button === LEFT_MOUSE_BUTTON && this.grabbedCard && !this.grabbedCard.shouldStick()) {
			this.useGrabbedCard()
		} else if (event.button === RIGHT_MOUSE_BUTTON && this.rightMouseDown) {
			this.inspectCard()
		}
		this.boardBoopStartedAt = null
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

	private static onScrollDown(event: WheelEvent) {
		scrollBoopColor(event, 1)
	}

	private static onScrollUp(event: WheelEvent) {
		scrollBoopColor(event, -1)
	}

	private onWindowMouseMove(event: MouseEvent) {
		this.windowMousePosition = new PIXI.Point(event.clientX, event.clientY)
		this.windowMousePosition.x *= window.devicePixelRatio * Core.renderer.superSamplingLevel
		this.windowMousePosition.y *= window.devicePixelRatio * Core.renderer.superSamplingLevel
	}
	private onMouseMove(event: MouseEvent) {
		const view = Core.renderer.pixi.view
		const clientRect = view.getBoundingClientRect()
		this.mousePosition = new PIXI.Point(event.clientX - clientRect.left, event.clientY - clientRect.top)
		this.mousePosition.x *= window.devicePixelRatio * Core.renderer.superSamplingLevel
		this.mousePosition.y *= window.devicePixelRatio * Core.renderer.superSamplingLevel

		if (
			this.boardBoopStartedAt &&
			this.leftMouseDown &&
			!this.grabbedCard &&
			!this.hoveredCard &&
			getDistance(this.boopTrailLastSeenAt || { x: 0, y: 0 }, this.mousePosition) > 4
		) {
			this.boopTrailLastSeenAt = this.mousePosition.clone()
			Core.particleSystem.createSmallBoardBoopEffect(this.mousePosition)
		}

		if (this.rightMouseDown && this.hoveredCard !== null) {
			flushBoardBoopPreps()
		}
	}

	private static onMouseLeave() {
		flushBoardBoopPreps()
	}

	public grabCard(): void {
		const hoveredCard = this.hoveredCard
		if (!hoveredCard) {
			return
		}
		const owner = hoveredCard.owner
		if (
			!owner ||
			(owner instanceof ClientPlayerInGame && owner !== Core.player.players[0]) ||
			(owner instanceof ClientPlayerGroup && owner !== Core.player)
		) {
			return
		}

		const card = hoveredCard.card

		if (hoveredCard.location === HoveredCardLocation.HAND) {
			const validPositions = this.playableCards
				.filter((playableCard) => playableCard.sourceCardId === card.id)
				.map((playableCard) => ({
					row: Core.board.getRow(playableCard.targetRowIndex)!,
					position: playableCard.targetPosition,
				}))
				.filter((positionWrapper) => !!positionWrapper.row)
			this.grabbedCard = GrabbedCard.cardPlay(card, validPositions)
			if (card.type === CardType.SPELL) {
				store.commit.gameStateModule.setPlayerSpellManaInDanger(card.stats.spellCost)
			}
		} else if (
			hoveredCard.location === HoveredCardLocation.BOARD &&
			Core.game.turnPhase === GameTurnPhase.DEPLOY &&
			Core.board.getValidOrdersForUnit(Core.board.findUnitById(card.id)).length > 0
		) {
			const validOrders = Core.board.getValidOrdersForUnit(Core.board.findUnitById(card.id))
			const validCards = validOrders
				.filter((order) => order.targetType === TargetType.UNIT)
				.map((order) => order.targetCardId)
				.map((id) => Core.game.findRenderedCardById(id)!)
			const validPositions = validOrders
				.filter((order) => order.targetType === TargetType.BOARD_ROW)
				.map((order) => ({
					row: Core.board.getRow(order.targetRowIndex)!,
					position: order.targetPosition,
				}))
				.filter((positionWrapper) => !!positionWrapper.row)
			this.grabbedCard = GrabbedCard.cardOrder(card, validCards, validPositions)
		} else if (hoveredCard.location === HoveredCardLocation.SELECTABLE) {
			this.grabbedCard = GrabbedCard.cardSelect(card)
		}
	}

	public inspectCard(): void {
		const hoveredCard = this.hoveredCard
		if (!hoveredCard) {
			InspectedCardStore.dispatch.undoCard()
			return
		}

		this.inspectedCard = hoveredCard.card
		store.commit.gameStateModule.setInspectedCard(this.inspectedCard)
		InspectedCardStore.dispatch.setCard({ card: hoveredCard.card })
	}

	public releaseInspectedCard(): void {
		this.inspectedCard = null
		store.commit.gameStateModule.setInspectedCard(null)
	}

	public useGrabbedCard(): void {
		if (!this.grabbedCard) {
			return
		}

		if (this.grabbedCard.mode === GrabbedCardMode.CARD_PLAY) {
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
		store.commit.gameStateModule.setPlayerSpellManaInDanger(0)
		this.updateCardHoverStatus()
	}

	private onCardPlay(card: RenderedCard): void {
		const hoveredRow = MouseHover.getHoveredRow()
		const spellScreenPositionThreshold = Core.renderer.pixi.screen.height * (1 - Core.renderer.PLAYER_HAND_WINDOW_FRACTION)

		if (card.type === CardType.SPELL && this.mousePosition.y < spellScreenPositionThreshold) {
			OutgoingMessageHandlers.sendSpellCardPlayed(card)
		} else if (card.type === CardType.UNIT && hoveredRow && isGrabbedCardPlayableToRow(hoveredRow)) {
			OutgoingMessageHandlers.sendUnitCardPlayed(card, hoveredRow, getCardInsertIndex(hoveredRow))
			this.limboShadowUnit = {
				card: card,
				rowIndex: normalizeBoardRowIndex(hoveredRow.index, 'player'),
				unitIndex: getCardInsertIndex(hoveredRow),
			}
		} else {
			return
		}
		this.cardLimbo.push(card)
		card.ownerPlayer.cardHand.removeCard(card)
		Core.renderer.hideCard(card)
	}

	private onUnitOrder(orderedCard: RenderedCard): void {
		const orderedUnit = Core.board.findUnitById(orderedCard.id)!
		const hoveredCard = MouseHover.getHoveredCard()
		const hoveredRow = MouseHover.getHoveredRow()

		const validOrders = Core.board.getValidOrdersForUnit(orderedUnit)
		const performedOrder = validOrders.find(
			(order) => order.targetCardId === hoveredCard?.id || (hoveredRow && Core.board.getRow(order.targetRowIndex) === hoveredRow)
		)
		if (performedOrder) {
			OutgoingMessageHandlers.sendUnitOrder(performedOrder)
		}
	}

	private onCardSelect(selectedCard: RenderedCard): void {
		const hoveredCard = MouseHover.getHoveredCard()
		if (hoveredCard !== selectedCard || !this.forcedTargetingMode) {
			return
		}

		AudioSystem.playEffect(AudioEffectCategory.TARGETING_CONFIRM)
		const message = this.forcedTargetingMode.validTargets.find((target) => target.targetCardData!.id === selectedCard.id)
		if (message && 'sourceCardId' in message) {
			OutgoingMessageHandlers.sendCardTarget(message)
		} else if (message) {
			OutgoingMessageHandlers.sendAnonymousTarget(message)
		}
	}

	public restoreLimboCard(cardMessage: CardRefMessage): RenderedCard | null {
		const cardInLimbo = this.cardLimbo.find((card) => card.id === cardMessage.id)
		if (!cardInLimbo) {
			return null
		}

		Core.renderer.showCard(cardInLimbo)
		this.evictCardFromLimbo(cardMessage.id)
		return cardInLimbo
	}

	public destroyLimboCard(cardMessage: CardRefMessage): void {
		if (Core.input.tutoredShadowUnit && Core.input.tutoredShadowUnit.card && Core.input.tutoredShadowUnit.card.id === cardMessage.id) {
			Core.input.tutoredShadowUnit = null
		}
		const cardInLimbo = this.cardLimbo.find((card) => card.id === cardMessage.id)
		if (!cardInLimbo) {
			return
		}
		Core.renderer.destroyCard(cardInLimbo)
		this.evictCardFromLimbo(cardMessage.id)
	}

	private evictCardFromLimbo(cardId: string): void {
		this.cardLimbo = this.cardLimbo.filter((card) => card.id !== cardId)
		if (this.limboShadowUnit && this.limboShadowUnit.card && this.limboShadowUnit.card.id === cardId) {
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
		store.commit.gameStateModule.setTargetingMode(targetMode)
		store.commit.gameStateModule.setPopupTargetingCardCount(this.forcedTargetingCards.length)
		store.commit.gameStateModule.setPopupTargetingCardsVisible(true)
	}

	public async createForcedTargetingCards(targets: CardTargetMessage[] | AnonymousTargetMessage[]): Promise<void> {
		const newCards = targets
			.filter(
				(target) =>
					target.targetType === TargetType.CARD_IN_LIBRARY ||
					target.targetType === TargetType.CARD_IN_UNIT_DECK ||
					target.targetType === TargetType.CARD_IN_SPELL_DECK ||
					target.targetType === TargetType.CARD_IN_UNIT_GRAVEYARD ||
					target.targetType === TargetType.CARD_IN_SPELL_GRAVEYARD
			)
			.map((target) => target.targetCardData!)

		const existingCards = this.forcedTargetingCards
		const addedCardMessages = newCards.filter((card) => !existingCards.find((existingCard) => existingCard.id === card.id))

		const cardsToAdd = addedCardMessages.map((message) => RenderedCard.fromMessage(message))
		const cardsToRemove = existingCards.filter((card) => newCards.every((newCard) => newCard.id !== card.id))
		const result = existingCards
			.reduce<RenderedCard[]>((result, existingCard) => {
				if (cardsToRemove.includes(existingCard) && cardsToAdd.length > 0) {
					return result.concat(cardsToAdd.shift()!)
				} else if (cardsToRemove.includes(existingCard)) {
					return result
				}

				return result.concat(existingCard)
			}, [])
			.concat(cardsToAdd)

		this.discardForcedTargetingCards(cardsToRemove)
		this.forcedTargetingCards = result
	}

	public disableForcedTargetingMode(): void {
		if (!this.forcedTargetingMode) {
			return
		}
		this.forcedTargetingMode.destroy()
		this.forcedTargetingMode = null

		this.discardForcedTargetingCards(this.forcedTargetingCards)
		this.forcedTargetingCards = []
		store.commit.gameStateModule.setTargetingMode(null)
		store.commit.gameStateModule.setPopupTargetingCardCount(0)
	}

	private discardForcedTargetingCards(cards: RenderedCard[]): void {
		this.discardedForcedTargetingCards = this.discardedForcedTargetingCards.concat(cards)
		cards.forEach((card) => {
			setTimeout(() => {
				Core.destroyCard(card)
				this.discardedForcedTargetingCards = this.discardedForcedTargetingCards.filter((discardedCard) => discardedCard !== card)
			}, 1000)
			gsap.to(card.coreContainer, {
				duration: 0.3,
				pixi: {
					alpha: 0,
					positionX: card.coreContainer.position.x + 75 * getRenderScale().superSamplingLevel,
				},
			})
		})
	}

	public destroyObject(): void {
		this.forcedTargetingCards.forEach((card) => Core.destroyCard(card))
	}
}
