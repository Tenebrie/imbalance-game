import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardLocation from '@shared/enums/CardLocation'
import MoveDirection from '@shared/enums/MoveDirection'
import GameEventType from '@shared/enums/GameEventType'
import {CardTakesDamageEventArgs} from '../../../models/GameEventCreators'
import ServerAnimation from '../../../models/ServerAnimation'
import BotCardEvaluation from '../../../AI/BotCardEvaluation'

export default class UnitWingedShieldmaiden extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.CASTLE,
			tribes: [CardTribe.VALKYRIE],
			stats: {
				power: 4,
			}
		})
		this.botEvaluation = new CustomBotEvaluation(this)

		this.createCallback<CardTakesDamageEventArgs>(GameEventType.CARD_TAKES_DAMAGE, [CardLocation.HAND])
			.require(({ triggeringCard }) => triggeringCard.owner === this.owner)
			.require(({ triggeringCard}) => !!triggeringCard.unit)
			.prepare(({ triggeringCard }) => {
				const targetUnit = triggeringCard.unit
				const moveTargetRowIndex = this.game.board.rowMove(this.owner, targetUnit.rowIndex, MoveDirection.BACK, 1)
				const moveTargetUnitIndex = targetUnit.unitIndex
				return {
					playTargetRowIndex: targetUnit.rowIndex,
					playTargetUnitIndex: targetUnit.unitIndex,
					moveTargetRowIndex,
					moveTargetUnitIndex
				}
			})
			.perform(({ triggeringCard }, preparedState) => {
				const ownedCard = {
					card: this,
					owner: this.owner
				}
				const targetUnit = triggeringCard.unit

				this.game.cardPlay.forcedPlayCardFromHand(ownedCard, preparedState.playTargetRowIndex, preparedState.playTargetUnitIndex)
				if (targetUnit && targetUnit.isAlive()) {
					this.game.board.moveUnit(targetUnit, preparedState.moveTargetRowIndex, preparedState.moveTargetUnitIndex)
				}
				this.game.animation.play(ServerAnimation.unitMove())
				this.owner.drawUnitCards(1)
			})
	}
}

class CustomBotEvaluation extends BotCardEvaluation {
	get expectedValue(): number {
		return this.card.stats.power - 1
	}
}
