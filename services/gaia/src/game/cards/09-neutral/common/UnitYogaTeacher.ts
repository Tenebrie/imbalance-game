import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'

import Keywords from '../../../../utils/Keywords'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class UnitYogaTeacher extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			stats: {
				power: 21,
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.createDeployTargets(TargetType.CARD_IN_UNIT_HAND)
			.totalTargetCount(1)
			.requireSamePlayer()
			.finalize(({ targetCard }) => this.onTargetSelected(targetCard))
		this.createDeployTargets(TargetType.CARD_IN_SPELL_HAND)
			.totalTargetCount(1)
			.requireSamePlayer()
			.finalize(({ targetCard }) => this.onTargetSelected(targetCard))
	}

	private onTargetSelected(targetCard: ServerCard): void {
		Keywords.discardCard(targetCard)
		Keywords.addCardToHand.for(this.ownerPlayer).fromInstance(targetCard)
	}
}
