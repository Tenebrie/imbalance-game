import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerAnimation from '@src/game/models/ServerAnimation'
import Keywords from '@src/utils/Keywords'
import { getConstructorFromCard } from '@src/utils/Utils'

import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class GwentCockatrice extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.DRACONID],
			stats: {
				power: 6,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: 'Cockatrice',
				description: '*Reset* a unit.',
				flavor:
					'Always strikes between the vertebrae, under your left kidney or straight into your aorta. That way, it only needs to strike once.',
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireNotSelf()
			.perform(({ targetUnit }) => {
				game.animation.play(ServerAnimation.cardAffectsCards(this, [targetUnit.card]))
				Keywords.transformUnit(targetUnit, getConstructorFromCard(targetUnit.card))
			})
	}
}
