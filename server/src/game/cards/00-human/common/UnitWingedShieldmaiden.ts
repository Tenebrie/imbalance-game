import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardLocation from '@shared/enums/CardLocation'
import MoveDirection from '@shared/enums/MoveDirection'
import GameEventType from '@shared/enums/GameEventType'
import BotCardEvaluation from '../../../AI/BotCardEvaluation'
import ExpansionSet from '@shared/enums/ExpansionSet'

export default class UnitWingedShieldmaiden extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.VALKYRIE],
			stats: {
				power: 4,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.botEvaluation = new CustomBotEvaluation(this)

		this.createCallback(GameEventType.CARD_TAKES_DAMAGE, [CardLocation.HAND])
			.require(({ triggeringCard }) => triggeringCard.owner === this.owner)
			.require(({ triggeringCard}) => !!triggeringCard.unit)
			.prepare(({ triggeringCard }) => {
				const targetUnit = triggeringCard.unit!
				const moveTargetRowIndex = this.game.board.rowMove(this.ownerInGame, targetUnit.rowIndex, MoveDirection.BACK, 1)
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
					owner: this.ownerInGame
				}
				const targetUnit = triggeringCard.unit

				if (!targetUnit || targetUnit.isDead()) {
					return
				}

				this.game.animation.createInstantAnimationThread()
				this.game.board.moveUnit(targetUnit, preparedState.moveTargetRowIndex, preparedState.moveTargetUnitIndex)
				this.game.animation.commitAnimationThread()

				if (this.game.board.rows[preparedState.playTargetRowIndex].isFull()) {
					return
				}

				this.game.animation.createInstantAnimationThread()
				this.game.cardPlay.forcedPlayCardFromHand(ownedCard, preparedState.playTargetRowIndex, preparedState.playTargetUnitIndex)
				this.ownerInGame.drawUnitCards(1)
				this.game.animation.commitAnimationThread()
			})
	}
}

class CustomBotEvaluation extends BotCardEvaluation {
	get expectedValue(): number {
		return this.card.stats.power - 1
	}
}
