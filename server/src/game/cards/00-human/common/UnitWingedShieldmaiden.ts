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
				power: 8,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.botEvaluation = new CustomBotEvaluation(this)

		this.createCallback(GameEventType.CARD_TAKES_DAMAGE, [CardLocation.HAND])
			.require(({ triggeringCard }) => triggeringCard.owner === this.owner)
			.require(({ triggeringCard }) => !!triggeringCard.unit)
			.prepare(({ triggeringCard }) => {
				const targetUnit = triggeringCard.unit!
				const moveTargetRowIndex = this.game.board.rowMove(this.ownerInGame, targetUnit.rowIndex, MoveDirection.BACK, 1)
				const moveTargetUnitIndex = targetUnit.unitIndex
				return {
					playTargetRowIndex: targetUnit.rowIndex,
					playTargetUnitIndex: targetUnit.unitIndex,
					moveTargetRowIndex,
					moveTargetUnitIndex,
				}
			})
			.requireImmediate(({ triggeringCard }, preparedState) => {
				return (
					this.location === CardLocation.HAND && triggeringCard.unit?.rowIndex === preparedState.playTargetRowIndex && !!triggeringCard.unit
				)
			})
			.perform(({ triggeringCard }, preparedState) => {
				const ownedCard = {
					card: this,
					owner: this.ownerInGame,
				}
				const targetUnit = triggeringCard.unit

				this.game.board.moveUnitToFarRight(targetUnit!, preparedState.moveTargetRowIndex)

				if (this.game.board.rows[preparedState.playTargetRowIndex].isFull()) {
					return
				}

				this.game.cardPlay.playCardFromHand(ownedCard, preparedState.playTargetRowIndex, preparedState.playTargetUnitIndex)
				this.ownerInGame.drawUnitCards(1)
			})
	}
}

class CustomBotEvaluation extends BotCardEvaluation {
	get expectedValue(): number {
		return this.card.stats.power - 1
	}
}
