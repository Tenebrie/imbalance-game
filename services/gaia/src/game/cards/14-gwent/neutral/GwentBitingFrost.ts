import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import BuffGwentRowFrost from '@src/game/buffs/14-gwent/BuffGwentRowFrost'

import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class GwentBitingFrost extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			stats: {
				cost: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			damage: BuffGwentRowFrost.DAMAGE,
		}

		this.createLocalization({
			en: {
				name: 'Biting Frost',
				description: 'Apply a Hazard to an enemy row that deals {damage} damage to the Lowest unit on turn start.',
				flavor: "Best thing about frost? Bodies of the fallen don't rot so quickly.",
			},
		})

		this.createDeployTargets(TargetType.BOARD_ROW)
			.requireEnemy()
			.perform(({ targetRow }) => {
				targetRow.buffs.add(BuffGwentRowFrost, this)
			})
	}
}
