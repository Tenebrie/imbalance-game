import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import BuffGwentBloodMoon from '@src/game/buffs/14-gwent/BuffGwentBloodMoon'
import BuffGwentFullMoon from '@src/game/buffs/14-gwent/BuffGwentFullMoon'

import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class GwentMoonlight extends ServerCard {
	public static readonly DAMAGE = 2

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			tribes: [CardTribe.BOON, CardTribe.HAZARD],
			faction: CardFaction.MONSTER,
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: 'Moonlight',
				description: 'Apply a *Full Moon* *Boon* to an allied row or a *Blood Moon* *Hazard* to an enemy row.',
				flavor: 'When the moon is full, nightmares crawl out of all the dark nooks and crannies of the world.',
			},
		})

		this.createDeployTargets(TargetType.BOARD_ROW)
			.requireAllied()
			.perform(({ targetRow }) => {
				targetRow.buffs.add(BuffGwentFullMoon, this)
			})

		this.createDeployTargets(TargetType.BOARD_ROW)
			.requireEnemy()
			.perform(({ targetRow }) => {
				targetRow.buffs.add(BuffGwentBloodMoon, this)
			})
	}
}
