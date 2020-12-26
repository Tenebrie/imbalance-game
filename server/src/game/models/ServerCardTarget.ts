import ServerUnit from './ServerUnit'
import ServerBoardRow from './ServerBoardRow'
import TargetMode from '@shared/enums/TargetMode'
import TargetType from '@shared/enums/TargetType'
import CardTargetMessage from '@shared/models/network/CardTargetMessage'
import ServerGame from './ServerGame'
import ServerCard from './ServerCard'
import CardLibrary from '../libraries/CardLibrary'
import CardMessage from '@shared/models/network/card/CardMessage'
import OpenCardMessage from '@shared/models/network/card/OpenCardMessage'
import { CardTargetCard, CardTargetCardAllowedTypes, CardTargetRow, CardTargetUnit } from '@shared/models/CardTarget'
import AnonymousTargetCard from '@shared/models/AnonymousTarget'
import AnonymousTargetMessage from '@shared/models/network/AnonymousTargetMessage'

export class ServerCardTargetCard implements CardTargetCard {
	public readonly targetMode: TargetMode
	public readonly targetType: CardTargetCardAllowedTypes
	public readonly targetCard: ServerCard
	public readonly sourceCard: ServerCard
	public targetLabel: string
	public expectedValue: number

	public constructor(targetMode: TargetMode, targetType: CardTargetCardAllowedTypes, sourceCard: ServerCard, targetCard: ServerCard) {
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

	public isEqual(other: ServerCardTargetCard | ServerCardTargetUnit | ServerCardTargetRow): boolean {
		return (
			other instanceof ServerCardTargetCard &&
			this.targetMode === other.targetMode &&
			this.targetType === other.targetType &&
			this.sourceCard === other.sourceCard &&
			this.targetCard === other.targetCard
		)
	}
}

export class ServerCardTargetUnit extends ServerCardTargetCard {
	public constructor(targetMode: TargetMode, targetType: TargetType.UNIT, sourceCard: ServerCard, targetCard: ServerCard) {
		super(targetMode, targetType, sourceCard, targetCard)
	}
}

export class ServerCardTargetRow implements CardTargetRow {
	public readonly targetMode: TargetMode
	public readonly targetType: TargetType.BOARD_ROW
	public readonly sourceCard: ServerCard
	public readonly targetRow: ServerBoardRow
	public targetLabel: string
	public expectedValue: number

	public constructor(targetMode: TargetMode, targetType: TargetType.BOARD_ROW, sourceCard: ServerCard, targetRow: ServerBoardRow) {
		this.targetMode = targetMode
		this.targetType = targetType
		this.sourceCard = sourceCard
		this.targetRow = targetRow
		this.targetLabel = ''
		this.expectedValue = 0
	}

	// noinspection JSUnusedGlobalSymbols
	public isEqual(other: ServerCardTargetCard | ServerCardTargetUnit | ServerCardTargetRow): boolean {
		return (
			other instanceof ServerCardTargetRow &&
			this.targetMode === other.targetMode &&
			this.targetType === other.targetType &&
			this.sourceCard === other.sourceCard &&
			this.targetRow === other.targetRow
		)
	}
}

export class ServerAnonymousTargetCard implements AnonymousTargetCard {
	public readonly targetMode: TargetMode
	public readonly targetType: CardTargetCardAllowedTypes
	public readonly targetCard: ServerCard
	public targetLabel: string
	public expectedValue: number

	public constructor(targetMode: TargetMode, targetType: CardTargetCardAllowedTypes, targetCard: ServerCard) {
		this.targetMode = targetMode
		this.targetType = targetType
		this.targetCard = targetCard
		this.targetLabel = ''
		this.expectedValue = 0
	}

	public isEqual(other: ServerCardTargetCard | ServerCardTargetUnit | ServerCardTargetRow): boolean {
		return (
			other instanceof ServerAnonymousTargetCard &&
			this.targetMode === other.targetMode &&
			this.targetType === other.targetType &&
			this.targetCard === other.targetCard
		)
	}
}

export default class ServerCardTarget {
	public static cardTargetCardInLibrary(
		targetMode: TargetMode,
		sourceCard: ServerCard,
		targetCard: ServerCard,
		targetLabel = ''
	): ServerCardTargetCard {
		const order = new ServerCardTargetCard(targetMode, TargetType.CARD_IN_LIBRARY, sourceCard, targetCard)
		order.targetLabel = targetLabel
		return order
	}

	public static cardTargetCardInUnitHand(
		targetMode: TargetMode,
		sourceCard: ServerCard,
		targetCard: ServerCard,
		targetLabel = ''
	): ServerCardTargetCard {
		const order = new ServerCardTargetCard(targetMode, TargetType.CARD_IN_UNIT_HAND, sourceCard, targetCard)
		order.targetLabel = targetLabel
		return order
	}

	public static cardTargetCardInSpellHand(
		targetMode: TargetMode,
		sourceCard: ServerCard,
		targetCard: ServerCard,
		targetLabel = ''
	): ServerCardTargetCard {
		const order = new ServerCardTargetCard(targetMode, TargetType.CARD_IN_SPELL_HAND, sourceCard, targetCard)
		order.targetLabel = targetLabel
		return order
	}

	public static cardTargetCardInUnitDeck(
		targetMode: TargetMode,
		sourceCard: ServerCard,
		targetCard: ServerCard,
		targetLabel = ''
	): ServerCardTargetCard {
		const order = new ServerCardTargetCard(targetMode, TargetType.CARD_IN_UNIT_DECK, sourceCard, targetCard)
		order.targetLabel = targetLabel
		return order
	}

	public static cardTargetCardInSpellDeck(
		targetMode: TargetMode,
		sourceCard: ServerCard,
		targetCard: ServerCard,
		targetLabel = ''
	): ServerCardTargetCard {
		const order = new ServerCardTargetCard(targetMode, TargetType.CARD_IN_SPELL_DECK, sourceCard, targetCard)
		order.targetLabel = targetLabel
		return order
	}

	public static cardTargetUnit(
		targetMode: TargetMode,
		sourceCard: ServerCard,
		targetUnit: ServerUnit,
		expectedValue: number,
		targetLabel = ''
	): ServerCardTargetUnit {
		const order = new ServerCardTargetUnit(targetMode, TargetType.UNIT, sourceCard, targetUnit.card)
		order.targetLabel = targetLabel
		order.expectedValue = expectedValue
		return order
	}

	public static cardTargetRow(
		targetMode: TargetMode,
		sourceCard: ServerCard,
		targetRow: ServerBoardRow,
		targetLabel = ''
	): ServerCardTargetRow {
		const order = new ServerCardTargetRow(targetMode, TargetType.BOARD_ROW, sourceCard, targetRow)
		order.targetLabel = targetLabel
		return order
	}

	public static anonymousTargetCardInUnitDeck(targetMode: TargetMode, targetCard: ServerCard): ServerAnonymousTargetCard {
		return new ServerAnonymousTargetCard(targetMode, TargetType.CARD_IN_UNIT_DECK, targetCard)
	}

	public static fromCardMessage(
		game: ServerGame,
		message: CardTargetMessage
	): ServerCardTargetCard | ServerCardTargetUnit | ServerCardTargetRow {
		let target: ServerCardTargetCard | ServerCardTargetUnit | ServerCardTargetRow

		const sourceCard = game.findCardById(message.sourceCardId)!

		if (message.targetType === TargetType.BOARD_ROW) {
			const targetRow = game.board.rows[message.targetRowIndex]
			if (!targetRow) {
				throw new Error('Invalid target row index')
			}
			target = new ServerCardTargetRow(message.targetMode, message.targetType, sourceCard, targetRow)
		} else {
			let targetCard
			if (message.targetCardId) {
				targetCard = game.findCardById(message.targetCardId) || CardLibrary.findPrototypeById(message.targetCardId)
			} else if (message.targetCardData) {
				targetCard = game.findCardById(message.targetCardData.id) || CardLibrary.findPrototypeById(message.targetCardData.id)
			}
			if (!targetCard) {
				console.error('Invalid target card id', message)
				throw new Error('Invalid target card id')
			}

			if (message.targetType === TargetType.UNIT) {
				target = new ServerCardTargetUnit(message.targetMode, message.targetType, sourceCard, targetCard)
			} else {
				target = new ServerCardTargetCard(message.targetMode, message.targetType, sourceCard, targetCard)
			}
		}
		target.targetLabel = message.targetLabel
		return target
	}

	public static fromAnonymousMessage(game: ServerGame, message: AnonymousTargetMessage): ServerAnonymousTargetCard {
		if (message.targetType === TargetType.UNIT || message.targetType === TargetType.BOARD_ROW) {
			throw new Error('Not supported')
		}

		const targetCard = game.findCardById(message.targetCardId)
		if (!targetCard) {
			console.error('Invalid target card id', message)
			throw new Error('Invalid target card id')
		}

		return new ServerAnonymousTargetCard(message.targetMode, message.targetType, targetCard)
	}
}
