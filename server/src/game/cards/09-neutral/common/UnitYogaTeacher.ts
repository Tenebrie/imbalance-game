import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import CardFeature from '@shared/enums/CardFeature'
import Keywords from '../../../../utils/Keywords'

export default class UnitYogaTeacher extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			features: [CardFeature.KEYWORD_DISCARD],
			stats: {
				power: 11,
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.createDeployTargets(TargetType.CARD_IN_UNIT_HAND)
			.totalTargetCount(1)
			.requireAllied()
			.finalize(({ targetCard }) => this.onTargetSelected(targetCard))
		this.createDeployTargets(TargetType.CARD_IN_SPELL_HAND)
			.totalTargetCount(1)
			.requireAllied()
			.finalize(({ targetCard }) => this.onTargetSelected(targetCard))
	}

	private onTargetSelected(targetCard: ServerCard): void {
		Keywords.discardCard(targetCard)
		Keywords.addCardToHand.for(this.ownerInGame).fromInstance(targetCard)
	}
}
