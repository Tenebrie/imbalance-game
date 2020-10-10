import ServerUnit from './ServerUnit'
import ServerBoardRow from './ServerBoardRow'
import TargetMode from '@shared/enums/TargetMode'
import TargetType from '@shared/enums/TargetType'
import CardTargetMessage from '@shared/models/network/CardTargetMessage'
import ServerGame from './ServerGame'
import ServerCard from './ServerCard'
import CardLibrary from '../libraries/CardLibrary'
import CardMessage from '@shared/models/network/card/CardMessage'

export class ServerCardTargetCard {
	public readonly targetMode: TargetMode
	public readonly targetType: TargetType
	public readonly targetCard: ServerCard
	public sourceCard: ServerCard | undefined
	public targetLabel: string
	public targetCardData: CardMessage | undefined
	public expectedValue: number

	public constructor(targetMode: TargetMode, targetType: TargetType, targetCard: ServerCard) {
		this.targetMode = targetMode
		this.targetType = targetType
		this.targetCard = targetCard
		this.targetLabel = ''
		this.expectedValue = 0
	}

	public isEqual(other: ServerCardTargetCard | ServerCardTargetRow): boolean {
		return other instanceof ServerCardTargetCard &&
			this.targetMode === other.targetMode &&
			this.targetType === other.targetType &&
			(this.sourceCard === other.sourceCard) &&
			this.targetCard === other.targetCard
	}
}

export class ServerCardTargetRow {
	public readonly targetMode: TargetMode
	public readonly targetType: TargetType
	public readonly targetRow: ServerBoardRow
	public sourceCard: ServerCard | undefined
	public targetLabel: string
	public targetCardData: CardMessage | undefined
	public expectedValue: number

	public constructor(targetMode: TargetMode, targetType: TargetType, targetRow: ServerBoardRow) {
		this.targetMode = targetMode
		this.targetType = targetType
		this.targetRow = targetRow
		this.targetLabel = ''
		this.expectedValue = 0
	}

	public isEqual(other: ServerCardTargetCard | ServerCardTargetRow): boolean {
		return other instanceof ServerCardTargetRow &&
			this.targetMode === other.targetMode &&
			this.targetType === other.targetType &&
			(this.sourceCard === other.sourceCard) &&
			this.targetRow === other.targetRow
	}
}

export default class ServerCardTarget {
	public static cardTargetUnit(targetMode: TargetMode, sourceCard: ServerCard, targetUnit: ServerUnit, expectedValue: number, targetLabel = ''): ServerCardTargetCard {
		const order = new ServerCardTargetCard(targetMode, TargetType.UNIT, targetUnit.card)
		order.sourceCard = sourceCard
		order.targetLabel = targetLabel
		order.expectedValue = expectedValue
		return order
	}

	public static cardTargetRow(targetMode: TargetMode, sourceCard: ServerCard, targetRow: ServerBoardRow, targetLabel = ''): ServerCardTargetRow {
		const order = new ServerCardTargetRow(targetMode, TargetType.BOARD_ROW, targetRow)
		order.sourceCard = sourceCard
		order.targetLabel = targetLabel
		return order
	}

	public static cardTargetCardInLibrary(targetMode: TargetMode, sourceCard: ServerCard, targetCard: ServerCard, targetLabel = ''): ServerCardTargetCard {
		const order = new ServerCardTargetCard(targetMode, TargetType.CARD_IN_LIBRARY, targetCard)
		order.sourceCard = sourceCard
		order.targetLabel = targetLabel
		return order
	}

	public static cardTargetCardInUnitHand(targetMode: TargetMode, sourceCard: ServerCard, targetCard: ServerCard, targetLabel = ''): ServerCardTargetCard {
		const order = new ServerCardTargetCard(targetMode, TargetType.CARD_IN_UNIT_HAND, targetCard)
		order.sourceCard = sourceCard
		order.targetLabel = targetLabel
		return order
	}

	public static cardTargetCardInSpellHand(targetMode: TargetMode, sourceCard: ServerCard, targetCard: ServerCard, targetLabel = ''): ServerCardTargetCard {
		const order = new ServerCardTargetCard(targetMode, TargetType.CARD_IN_SPELL_HAND, targetCard)
		order.sourceCard = sourceCard
		order.targetLabel = targetLabel
		return order
	}

	public static cardTargetCardInUnitDeck(targetMode: TargetMode, sourceCard: ServerCard, targetCard: ServerCard, targetLabel = ''): ServerCardTargetCard {
		const order = new ServerCardTargetCard(targetMode, TargetType.CARD_IN_UNIT_DECK, targetCard)
		order.sourceCard = sourceCard
		order.targetLabel = targetLabel
		return order
	}

	public static cardTargetCardInSpellDeck(targetMode: TargetMode, sourceCard: ServerCard, targetCard: ServerCard, targetLabel = ''): ServerCardTargetCard {
		const order = new ServerCardTargetCard(targetMode, TargetType.CARD_IN_SPELL_DECK, targetCard)
		order.sourceCard = sourceCard
		order.targetLabel = targetLabel
		return order
	}

	public static anonymousTargetCardInUnitDeck(targetMode: TargetMode, targetCard: ServerCard, targetLabel = ''): ServerCardTargetCard {
		const order = new ServerCardTargetCard(targetMode, TargetType.CARD_IN_UNIT_DECK, targetCard)
		order.targetLabel = targetLabel
		return order
	}

	public static fromMessage(game: ServerGame, message: CardTargetMessage): ServerCardTargetCard | ServerCardTargetRow {
		let target: ServerCardTargetCard | ServerCardTargetRow
		if (message.targetType === TargetType.BOARD_ROW) {
			const targetRow = game.board.rows[message.targetRowIndex]
			if (!targetRow) {
				throw new Error('Invalid target row index')
			}
			target = new ServerCardTargetRow(message.targetMode, message.targetType, targetRow)
		} else {
			let targetCard
			if (message.targetCardId) {
				targetCard = game.findCardById(message.targetCardId) || CardLibrary.findPrototypeById(message.targetCardId)
			} else if (message.targetCardData) {
				targetCard = game.findCardById(message.targetCardData.id) || CardLibrary.findPrototypeById(message.targetCardData.id)
			}
			if (!targetCard) {
				throw new Error('Invalid target card id')
			}
			target = new ServerCardTargetCard(message.targetMode, message.targetType, targetCard)
		}
		if (message.sourceCardId) {
			target.sourceCard = game.findCardById(message.sourceCardId) || game.board.findUnitById(message.sourceCardId)?.card
		}
		target.targetLabel = message.targetLabel
		return target
	}
}
