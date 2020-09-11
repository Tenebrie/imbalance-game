import Core from '@/Pixi/Core'
import RenderedUnit from '@/Pixi/cards/RenderedUnit'
import RenderedGameBoardRow from '@/Pixi/cards/RenderedGameBoardRow'
import CardTarget from '@shared/models/CardTarget'
import CardTargetMessage from '@shared/models/network/CardTargetMessage'
import TargetMode from '@shared/enums/TargetMode'
import TargetType from '@shared/enums/TargetType'
import Card from '@shared/models/Card'
import ClientPlayerInGame from '@/Pixi/models/ClientPlayerInGame'
import CardMessage from '@shared/models/network/card/CardMessage'

export default class ClientCardTarget implements CardTarget {
	targetMode: TargetMode
	targetType: TargetType
	sourceCard: Card | CardMessage
	sourceCardOwner?: ClientPlayerInGame
	targetCard?: Card | CardMessage
	targetRow?: RenderedGameBoardRow
	targetLabel: string
	targetCardData?: CardMessage

	constructor(targetMode: TargetMode, targetType: TargetType) {
		this.targetMode = targetMode
		this.targetType = targetType
	}

	public static fromMessage(message: CardTargetMessage): ClientCardTarget {
		const target = new ClientCardTarget(message.targetMode, message.targetType)
		if (message.sourceCardId) {
			target.sourceCard = Core.game.findCardById(message.sourceCardId)
		}
		if (message.sourceCardOwnerId) {
			target.sourceCardOwner = Core.getPlayer(message.sourceCardOwnerId)
		}
		if (message.targetCardId) {
			target.targetCard = Core.game.findCardById(message.targetCardId)
		}
		if (message.targetRowIndex !== -1) {
			target.targetRow = Core.board.rows[message.targetRowIndex]
		}
		if (message.targetCardData) {
			target.targetCardData = message.targetCardData
		}
		target.targetLabel = message.targetLabel
		return target
	}
}
