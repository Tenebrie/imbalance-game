import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'
import TargetType from '@shared/enums/TargetType'
import TargetDefinitionBuilder from '../../models/targetDefinitions/TargetDefinitionBuilder'
import PostPlayTargetDefinitionBuilder from '../../models/targetDefinitions/PostPlayTargetDefinitionBuilder'
import ServerBoardRow from '../../models/ServerBoardRow'
import ServerUnit from '../../models/ServerUnit'
import ServerAnimation from '../../models/ServerAnimation'
import BuffStun from '../../buffs/BuffStun'
import BuffDuration from '@shared/enums/BuffDuration'
import Constants from '@shared/Constants'
import CardFaction from '@shared/enums/CardFaction'

export default class HeroKroLah extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.GOLDEN, CardFaction.ARCANE)
		this.basePower = 7
	}

	definePostPlayRequiredTargets(): TargetDefinitionBuilder {
		return PostPlayTargetDefinitionBuilder.base(this.game)
			.singleTarget()
			.allow(TargetType.BOARD_ROW)
			.opponentsRow()
			.notEmptyRow()
	}

	onUnitPlayTargetRowSelected(thisUnit: ServerUnit, target: ServerBoardRow): void {
		const targetUnits = target.cards

		const pushDirection = target.index - thisUnit.rowIndex

		this.game.animation.play(ServerAnimation.unitAttacksUnits(thisUnit, targetUnits))
		targetUnits.forEach(targetUnit => {
			targetUnit.card.buffs.add(new BuffStun(), thisUnit.card, BuffDuration.START_OF_NEXT_TURN)
		})

		if (pushDirection > 0 && target.index < Constants.GAME_BOARD_ROW_COUNT - 1) {
			targetUnits.forEach(targetUnit => this.game.board.moveUnitToFarRight(targetUnit, target.index + 1))
		} else if (pushDirection < 0 && target.index > 0) {
			targetUnits.forEach(targetUnit => this.game.board.moveUnitToFarRight(targetUnit, target.index - 1))
		}
	}
}
