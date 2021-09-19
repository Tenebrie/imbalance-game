import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import BuffRowHealingRain from '@src/game/buffs/BuffRowHealingRain'
import ServerBoardRow from '@src/game/models/ServerBoardRow'

import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class UnitMerfolkSkygazer extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.MERFOLK],
			features: [CardFeature.KEYWORD_DEPLOY, CardFeature.KEYWORD_BUFF_ROW_HEALING_RAIN, CardFeature.KEYWORD_HEAL],
			stats: {
				power: 14,
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.createDeployTargets(TargetType.BOARD_ROW)
			.require(({ targetRow }) => targetRow.owner === this.ownerGroup)
			.perform(({ targetRow }) => onTargetSelected(targetRow))

		const onTargetSelected = (target: ServerBoardRow): void => {
			target.buffs.add(BuffRowHealingRain, this)
		}
	}
}
