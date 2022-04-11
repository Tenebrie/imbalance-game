import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class GwentForktail extends ServerCard {
	public static readonly TARGETS = 2

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.DRACONID],
			stats: {
				power: 8,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			targets: GwentForktail.TARGETS,
		}

		this.createLocalization({
			en: {
				name: 'Forktail',
				description: '*Consume* {targets} allies and boost self by their power.',
				flavor:
					'As for forktails, bait them thusly: pound a stake in the soil, bind a goat to it, then hide ye in nearto shrubbery posthaste.',
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireAllied()
			.requireNotSelf()
			.targetCount(GwentForktail.TARGETS)
			.perform(({ targetUnit }) => {
				Keywords.consume.units({
					targets: [targetUnit],
					consumer: this,
				})
			})
	}
}
