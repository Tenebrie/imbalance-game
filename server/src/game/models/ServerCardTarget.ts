import ServerUnit from './ServerUnit'
import ServerBoardRow from './ServerBoardRow'
import TargetMode from '@shared/enums/TargetMode'
import TargetType from '@shared/enums/TargetType'
import ServerGame from './ServerGame'
import ServerCard from './ServerCard'
import CardMessage from '@shared/models/network/card/CardMessage'
import OpenCardMessage from '@shared/models/network/card/OpenCardMessage'
import { CardTargetCard, CardTargetCardAllowedTypes, CardTargetPosition, CardTargetRow } from '@shared/models/CardTarget'
import AnonymousTargetCard from '@shared/models/AnonymousTarget'
import AnonymousTargetMessage from '@shared/models/network/AnonymousTargetMessage'

export class ServerCardTargetCard implements CardTargetCard {
	public readonly id: string
	public readonly targetMode: TargetMode
	public readonly targetType: CardTargetCardAllowedTypes
	public readonly targetCard: ServerCard
	public readonly sourceCard: ServerCard
	public targetLabel: string
	public expectedValue: number

	public constructor(
		rootId: string,
		targetMode: TargetMode,
		targetType: CardTargetCardAllowedTypes,
		sourceCard: ServerCard,
		targetCard: ServerCard
	) {
		this.id = `${rootId}/${targetCard.id}`
		this.targetMode = targetMode
		this.targetType = targetType
		this.sourceCard = sourceCard
		this.targetCard = targetCard
		this.targetLabel = ''
		this.expectedValue = 0
	}

	public get targetCardData(): CardMessage {
		return new OpenCardMessage(this.targetCard)
	}
}

export class ServerCardTargetUnit extends ServerCardTargetCard {
	public constructor(rootId: string, targetMode: TargetMode, targetType: TargetType.UNIT, sourceCard: ServerCard, targetCard: ServerCard) {
		super(rootId, targetMode, targetType, sourceCard, targetCard)
	}
}

export class ServerCardTargetRow implements CardTargetRow {
	public readonly id: string
	public readonly targetMode: TargetMode
	public readonly targetType: TargetType.BOARD_ROW
	public readonly sourceCard: ServerCard
	public readonly targetRow: ServerBoardRow
	public targetLabel: string
	public expectedValue: number

	public constructor(
		rootId: string,
		targetMode: TargetMode,
		targetType: TargetType.BOARD_ROW,
		sourceCard: ServerCard,
		targetRow: ServerBoardRow
	) {
		this.id = `${rootId}/row${targetRow.index}`
		this.targetMode = targetMode
		this.targetType = targetType
		this.sourceCard = sourceCard
		this.targetRow = targetRow
		this.targetLabel = ''
		this.expectedValue = 0
	}
}

export class ServerCardTargetPosition implements CardTargetPosition {
	public readonly id: string
	public readonly targetMode: TargetMode
	public readonly targetType: TargetType.BOARD_POSITION
	public readonly sourceCard: ServerCard
	public readonly targetRow: ServerBoardRow
	public readonly targetPosition: number
	public targetLabel: string
	public expectedValue: number

	public constructor(
		rootId: string,
		targetMode: TargetMode,
		targetType: TargetType.BOARD_POSITION,
		sourceCard: ServerCard,
		targetRow: ServerBoardRow,
		targetPosition: number
	) {
		this.id = `${rootId}/row${targetRow.index}/${targetPosition}`
		this.targetMode = targetMode
		this.targetType = targetType
		this.sourceCard = sourceCard
		this.targetRow = targetRow
		this.targetPosition = targetPosition
		this.targetLabel = ''
		this.expectedValue = 0
	}
}

export class ServerAnonymousTargetCard implements AnonymousTargetCard {
	public readonly id: string
	public readonly targetMode: TargetMode
	public readonly targetType: CardTargetCardAllowedTypes
	public readonly targetCard: ServerCard
	public targetLabel: string
	public expectedValue: number

	public constructor(rootId: string, targetMode: TargetMode, targetType: CardTargetCardAllowedTypes, targetCard: ServerCard) {
		this.id = `${rootId}/${targetCard.id}`
		this.targetMode = targetMode
		this.targetType = targetType
		this.targetCard = targetCard
		this.targetLabel = ''
		this.expectedValue = 0
	}
}

export default class ServerCardTarget {
	public static cardTargetCardInLibrary(
		rootId: string,
		targetMode: TargetMode,
		sourceCard: ServerCard,
		targetCard: ServerCard,
		targetLabel = ''
	): ServerCardTargetCard {
		const order = new ServerCardTargetCard(rootId, targetMode, TargetType.CARD_IN_LIBRARY, sourceCard, targetCard)
		order.targetLabel = targetLabel
		return order
	}

	public static cardTargetCardInUnitHand(
		rootId: string,
		targetMode: TargetMode,
		sourceCard: ServerCard,
		targetCard: ServerCard,
		targetLabel = ''
	): ServerCardTargetCard {
		const order = new ServerCardTargetCard(rootId, targetMode, TargetType.CARD_IN_UNIT_HAND, sourceCard, targetCard)
		order.targetLabel = targetLabel
		return order
	}

	public static cardTargetCardInSpellHand(
		rootId: string,
		targetMode: TargetMode,
		sourceCard: ServerCard,
		targetCard: ServerCard,
		targetLabel = ''
	): ServerCardTargetCard {
		const order = new ServerCardTargetCard(rootId, targetMode, TargetType.CARD_IN_SPELL_HAND, sourceCard, targetCard)
		order.targetLabel = targetLabel
		return order
	}

	public static cardTargetCardInUnitDeck(
		rootId: string,
		targetMode: TargetMode,
		sourceCard: ServerCard,
		targetCard: ServerCard,
		targetLabel = ''
	): ServerCardTargetCard {
		const order = new ServerCardTargetCard(rootId, targetMode, TargetType.CARD_IN_UNIT_DECK, sourceCard, targetCard)
		order.targetLabel = targetLabel
		return order
	}

	public static cardTargetCardInSpellDeck(
		rootId: string,
		targetMode: TargetMode,
		sourceCard: ServerCard,
		targetCard: ServerCard,
		targetLabel = ''
	): ServerCardTargetCard {
		const order = new ServerCardTargetCard(rootId, targetMode, TargetType.CARD_IN_SPELL_DECK, sourceCard, targetCard)
		order.targetLabel = targetLabel
		return order
	}

	public static cardTargetCardInUnitGraveyard(
		rootId: string,
		targetMode: TargetMode,
		sourceCard: ServerCard,
		targetCard: ServerCard,
		targetLabel = ''
	): ServerCardTargetCard {
		const order = new ServerCardTargetCard(rootId, targetMode, TargetType.CARD_IN_UNIT_GRAVEYARD, sourceCard, targetCard)
		order.targetLabel = targetLabel
		return order
	}

	public static cardTargetCardInSpellGraveyard(
		rootId: string,
		targetMode: TargetMode,
		sourceCard: ServerCard,
		targetCard: ServerCard,
		targetLabel = ''
	): ServerCardTargetCard {
		const order = new ServerCardTargetCard(rootId, targetMode, TargetType.CARD_IN_SPELL_GRAVEYARD, sourceCard, targetCard)
		order.targetLabel = targetLabel
		return order
	}

	public static cardTargetUnit(
		rootId: string,
		targetMode: TargetMode,
		sourceCard: ServerCard,
		targetUnit: ServerUnit,
		expectedValue: number,
		targetLabel = ''
	): ServerCardTargetUnit {
		const order = new ServerCardTargetUnit(rootId, targetMode, TargetType.UNIT, sourceCard, targetUnit.card)
		order.targetLabel = targetLabel
		order.expectedValue = expectedValue
		return order
	}

	public static cardTargetRow(
		rootId: string,
		targetMode: TargetMode,
		sourceCard: ServerCard,
		targetRow: ServerBoardRow,
		targetLabel = ''
	): ServerCardTargetRow {
		const order = new ServerCardTargetRow(rootId, targetMode, TargetType.BOARD_ROW, sourceCard, targetRow)
		order.targetLabel = targetLabel
		order.expectedValue = 0
		return order
	}

	public static cardTargetPosition(
		rootId: string,
		targetMode: TargetMode,
		sourceCard: ServerCard,
		targetRow: ServerBoardRow,
		targetPosition: number,
		targetLabel = ''
	): ServerCardTargetPosition {
		const order = new ServerCardTargetPosition(rootId, targetMode, TargetType.BOARD_POSITION, sourceCard, targetRow, targetPosition)
		order.targetLabel = targetLabel
		order.expectedValue = 0
		return order
	}

	public static anonymousTargetCardInUnitHand(targetMode: TargetMode, targetCard: ServerCard): ServerAnonymousTargetCard {
		// Intentionally sets target type to TargetType.CARD_IN_UNIT_DECK
		return new ServerAnonymousTargetCard('game', targetMode, TargetType.CARD_IN_UNIT_DECK, targetCard)
	}

	public static anonymousTargetCardInUnitDeck(targetMode: TargetMode, targetCard: ServerCard): ServerAnonymousTargetCard {
		return new ServerAnonymousTargetCard('game', targetMode, TargetType.CARD_IN_UNIT_DECK, targetCard)
	}

	public static fromAnonymousMessage(game: ServerGame, message: AnonymousTargetMessage): ServerAnonymousTargetCard {
		if (
			message.targetType === TargetType.UNIT ||
			message.targetType === TargetType.BOARD_ROW ||
			message.targetType === TargetType.BOARD_POSITION
		) {
			throw new Error('Not supported')
		}

		const targetCard = game.findCardById(message.targetCardId)
		if (!targetCard) {
			console.error('Invalid target card id', message)
			throw new Error('Invalid target card id')
		}

		return new ServerAnonymousTargetCard('game', message.targetMode, message.targetType, targetCard)
	}
}
