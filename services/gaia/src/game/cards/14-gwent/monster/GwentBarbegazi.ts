import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import BuffGwentResilience from '@src/game/buffs/14-gwent/BuffGwentResilience'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class GwentBarbegazi extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.INSECTOID],
			stats: {
				power: 6,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.buffs.add(BuffGwentResilience, this)

		this.createLocalization({
			en: {
				name: 'Barbegazi',
				description: '*Consume* an ally and boost self by its power.',
				flavor: 'What moments before looked like round rocks among the stalagmites now stared at him with enormous, bright, menacing eyes.',
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireAllied()
			.requireNotSelf()
			.perform(({ targetUnit }) => {
				Keywords.consume.units({
					consumer: this,
					targets: [targetUnit],
				})
			})
	}
}