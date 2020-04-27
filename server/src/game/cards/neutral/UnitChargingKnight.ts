import CardType from '@shared/enums/CardType'
import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'
import ServerUnit from '../../models/ServerUnit'
import ServerBoardRow from '../../models/ServerBoardRow'
import TargetDefinition from '../../models/targetDefinitions/TargetDefinition'
import TargetMode from '@shared/enums/TargetMode'
import TargetType from '@shared/enums/TargetType'
import TargetDefinitionBuilder from '../../models/targetDefinitions/TargetDefinitionBuilder'
import CardColor from '@shared/enums/CardColor'
import CardTribe from '@shared/enums/CardTribe'
import CardFaction from '@shared/enums/CardFaction'

export default class UnitChargingKnight extends ServerCard {
	hasMovedThisTurn = false

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE, CardFaction.NEUTRAL)
		this.basePower = 10
		this.baseAttack = 2
		this.baseTribes = [CardTribe.HUMAN]
	}

	defineValidOrderTargets(): TargetDefinitionBuilder {
		let orderTargets = TargetDefinition.defaultUnitOrder(this.game)
		if (this.hasMovedThisTurn) {
			orderTargets = orderTargets
				.actions(1)
				.allow(TargetMode.ORDER_ATTACK, TargetType.UNIT)
				.allowSimultaneously([TargetMode.ORDER_ATTACK, TargetType.UNIT], [TargetMode.ORDER_MOVE, TargetType.BOARD_ROW])
		}
		return orderTargets
	}

	onAfterPerformingMove(thisUnit: ServerUnit, target: ServerBoardRow): void {
		this.hasMovedThisTurn = true
	}

	onTurnEnded(thisUnit: ServerUnit): void {
		this.hasMovedThisTurn = false
	}
}
