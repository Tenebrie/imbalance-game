import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

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
		this.makeResilient()

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
