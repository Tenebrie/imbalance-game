import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardLocation from '@shared/enums/CardLocation'
import MoveDirection from '@shared/enums/MoveDirection'
import GameEvent, {CardTakesDamageEventArgs} from '../../../models/GameEvent'

export default class UnitWingedShieldmaiden extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE, CardFaction.CASTLE)
		this.basePower = 4
		this.baseTribes = [CardTribe.VALKYRIE]

		this.createCallback<CardTakesDamageEventArgs>(GameEvent.CARD_TAKES_DAMAGE)
			.requireLocation(CardLocation.HAND)
			.require(({ targetCard }) => targetCard.owner === this.owner)
			.require(({ targetCard}) => !!targetCard.unit)
			.prepare(({ targetCard }) => {
				const targetUnit = targetCard.unit
				const moveTargetRowIndex = this.game.board.rowMove(this.owner, targetUnit.rowIndex, MoveDirection.BACK, 1)
				const moveTargetUnitIndex = targetUnit.unitIndex
				return {
					playTargetRowIndex: targetUnit.rowIndex,
					playTargetUnitIndex: targetUnit.unitIndex,
					moveTargetRowIndex,
					moveTargetUnitIndex
				}
			})
			.perform(({ targetCard }, preparedState) => {
				const ownedCard = {
					card: this,
					owner: this.owner
				}
				const targetUnit = targetCard.unit

				this.game.cardPlay.forcedPlayCardFromHand(ownedCard, preparedState.playTargetRowIndex, preparedState.playTargetUnitIndex)
				this.game.board.moveUnit(targetUnit, preparedState.moveTargetRowIndex, preparedState.moveTargetUnitIndex)
				this.owner.drawUnitCards(1)
			})
	}
}
