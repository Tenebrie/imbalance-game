import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import TargetType from '@shared/enums/TargetType'
import ServerUnit from '../../../models/ServerUnit'
import TargetDefinitionBuilder from '../../../models/targetDefinitions/TargetDefinitionBuilder'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import PostPlayTargetDefinitionBuilder from '../../../models/targetDefinitions/PostPlayTargetDefinitionBuilder'
import ServerBoardRow from '../../../models/ServerBoardRow'
import ServerAnimation from '../../../models/ServerAnimation'
import BuffDuration from '@shared/enums/BuffDuration'
import BuffBurning from '../../../buffs/BuffBurning'

export default class HeroFlameDancer extends ServerCard {
	burnDuration = 3

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.SILVER, CardFaction.ARCANE)
		this.basePower = 5
		this.dynamicTextVariables = {
			burnDuration: this.burnDuration
		}
	}

	definePostPlayRequiredTargets(): TargetDefinitionBuilder {
		return PostPlayTargetDefinitionBuilder.base(this.game)
			.require(TargetType.BOARD_ROW)
			.validate(TargetType.BOARD_ROW, args => {
				return args.targetRow.owner === args.thisUnit.owner.opponent && args.targetRow.cards.length > 0
			})
	}

	onUnitPlayTargetRowSelected(thisUnit: ServerUnit, target: ServerBoardRow): void {
		const targetUnits = target.cards

		this.game.animation.play(ServerAnimation.unitAttacksUnits(thisUnit, targetUnits))
		targetUnits.forEach(targetUnit => {
			targetUnit.card.buffs.add(BuffBurning, thisUnit.card, BuffDuration.FULL_TURN * this.burnDuration)
		})
	}
}
