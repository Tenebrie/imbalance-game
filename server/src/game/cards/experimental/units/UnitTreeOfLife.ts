import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardTribe from '@shared/enums/CardTribe'
import ServerBoardRow from '../../../models/ServerBoardRow'
import ServerUnit from '../../../models/ServerUnit'
import ServerDamageInstance from '../../../models/ServerDamageSource'
import TargetMode from '@shared/enums/TargetMode'
import TargetType from '@shared/enums/TargetType'
import StandardTargetDefinitionBuilder from '../../../models/targetDefinitions/StandardTargetDefinitionBuilder'
import TargetDefinitionBuilder from '../../../models/targetDefinitions/TargetDefinitionBuilder'
import CardColor from '@shared/enums/CardColor'
import Utils from '../../../../utils/Utils'

export default class UnitTreeOfLife extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE)
		this.basePower = 4
		this.tribes = [CardTribe.BUILDING]
	}

	defineValidOrderTargets(): TargetDefinitionBuilder {
		return StandardTargetDefinitionBuilder.base(this.game)
			.singleAction()
			.allow(TargetMode.ORDER_SUPPORT, TargetType.BOARD_ROW)
			.label(TargetMode.ORDER_SUPPORT, TargetType.BOARD_ROW, 'card.target.buildingTreeOfLife.support.row')
			.validate(TargetMode.ORDER_SUPPORT, TargetType.BOARD_ROW, args => {
				const targetRow = args.targetRow!
				let adjacentRows = this.game.board.getAdjacentRows(targetRow)
				return targetRow.cards.length > 0 || !!adjacentRows.find(row => row.cards.length > 0)
			})
	}

	onPerformingRowSupport(thisUnit: ServerUnit, target: ServerBoardRow): void {
		let adjacentRows = this.game.board.getAdjacentRows(target)

		target.cards.forEach(unit => {
			unit.heal(ServerDamageInstance.fromUnit(3, thisUnit))
		})
		const cardsOnAdjacentRows = Utils.flat(adjacentRows.map(row => row.cards))
		cardsOnAdjacentRows.forEach(unit => {
			unit.heal(ServerDamageInstance.fromUnit(1, thisUnit))
		})
	}
}
