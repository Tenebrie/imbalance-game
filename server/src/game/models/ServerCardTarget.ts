import ServerUnit from './ServerUnit'
import ServerBoardRow from './ServerBoardRow'
import CardTarget from '@shared/models/CardTarget'
import TargetMode from '@shared/enums/TargetMode'
import TargetType from '@shared/enums/TargetType'
import CardTargetMessage from '@shared/models/network/CardTargetMessage'
import ServerGame from './ServerGame'
import ServerCard from './ServerCard'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import CardLibrary from '../libraries/CardLibrary'
import CardMessage from '@shared/models/network/card/CardMessage'

export default class ServerCardTarget implements CardTarget {
	targetMode: TargetMode
	targetType: TargetType
	sourceCard: ServerCard
	sourceCardOwner?: ServerPlayerInGame
	targetCard?: ServerCard
	targetRow?: ServerBoardRow
	targetLabel: string
	targetCardData: CardMessage
	expectedValue: number

	private constructor(targetMode: TargetMode, targetType: TargetType) {
		this.targetMode = targetMode
		this.targetType = targetType
		this.expectedValue = 0
	}

	public isEqual(other: ServerCardTarget): boolean {
		return this.targetMode === other.targetMode &&
			this.targetType === other.targetType &&
			(this.sourceCard === other.sourceCard) &&
			this.targetCard === other.targetCard &&
			this.targetRow === other.targetRow
	}

	public static cardTargetUnit(targetMode: TargetMode, sourceCard: ServerCard, targetUnit: ServerUnit, expectedValue: number, targetLabel = ''): ServerCardTarget {
		const order = new ServerCardTarget(targetMode, TargetType.UNIT)
		order.sourceCard = sourceCard
		order.targetCard = targetUnit.card
		order.targetLabel = targetLabel
		order.expectedValue = expectedValue
		return order
	}

	public static cardTargetRow(targetMode: TargetMode, sourceCard: ServerCard, targetRow: ServerBoardRow, targetLabel = ''): ServerCardTarget {
		const order = new ServerCardTarget(targetMode, TargetType.BOARD_ROW)
		order.sourceCard = sourceCard
		order.targetRow = targetRow
		order.targetLabel = targetLabel
		return order
	}

	public static cardTargetCardInLibrary(targetMode: TargetMode, sourceCard: ServerCard, targetCard: ServerCard, targetLabel = ''): ServerCardTarget {
		const order = new ServerCardTarget(targetMode, TargetType.CARD_IN_LIBRARY)
		order.sourceCard = sourceCard
		order.targetCard = targetCard
		order.targetLabel = targetLabel
		return order
	}

	public static cardTargetCardInUnitHand(targetMode: TargetMode, sourceCard: ServerCard, targetCard: ServerCard, targetLabel = ''): ServerCardTarget {
		const order = new ServerCardTarget(targetMode, TargetType.CARD_IN_UNIT_HAND)
		order.sourceCard = sourceCard
		order.targetCard = targetCard
		order.targetLabel = targetLabel
		return order
	}

	public static cardTargetCardInSpellHand(targetMode: TargetMode, sourceCard: ServerCard, targetCard: ServerCard, targetLabel = ''): ServerCardTarget {
		const order = new ServerCardTarget(targetMode, TargetType.CARD_IN_SPELL_HAND)
		order.sourceCard = sourceCard
		order.targetCard = targetCard
		order.targetLabel = targetLabel
		return order
	}

	public static cardTargetCardInUnitDeck(targetMode: TargetMode, sourceCard: ServerCard, targetCard: ServerCard, targetLabel = ''): ServerCardTarget {
		const order = new ServerCardTarget(targetMode, TargetType.CARD_IN_UNIT_DECK)
		order.sourceCard = sourceCard
		order.targetCard = targetCard
		order.targetLabel = targetLabel
		return order
	}

	public static cardTargetCardInSpellDeck(targetMode: TargetMode, sourceCard: ServerCard, targetCard: ServerCard, targetLabel = ''): ServerCardTarget {
		const order = new ServerCardTarget(targetMode, TargetType.CARD_IN_SPELL_DECK)
		order.sourceCard = sourceCard
		order.targetCard = targetCard
		order.targetLabel = targetLabel
		return order
	}

	public static fromMessage(game: ServerGame, message: CardTargetMessage): ServerCardTarget {
		const target = new ServerCardTarget(message.targetMode, message.targetType)
		if (message.sourceCardId) {
			target.sourceCard = game.findCardById(message.sourceCardId) || game.board.findUnitById(message.sourceCardId).card
		}
		if (message.sourceCardOwnerId) {
			target.sourceCardOwner = game.players.find(playerInGame => playerInGame.player.id === message.sourceCardOwnerId)
		}
		if (message.targetCardId) {
			target.targetCard = game.findCardById(message.targetCardId) || CardLibrary.findPrototypeById(message.targetCardData.id)
		} else if (message.targetCardData) {
			target.targetCard = game.findCardById(message.targetCardData.id) || CardLibrary.findPrototypeById(message.targetCardData.id)
		}
		if (message.targetRowIndex !== -1) {
			target.targetRow = game.board.rows[message.targetRowIndex]
		}
		target.targetLabel = message.targetLabel
		return target
	}
}
