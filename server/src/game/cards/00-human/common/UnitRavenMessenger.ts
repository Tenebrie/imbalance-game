import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import TargetType from '@shared/enums/TargetType'
import CardTribe from '@shared/enums/CardTribe'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'
import Keywords from '../../../../utils/Keywords'

export default class UnitRavenMessenger extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.BIRD],
			features: [CardFeature.KEYWORD_DEPLOY, CardFeature.KEYWORD_SUMMON],
			stats: {
				power: 4,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.addRelatedCards().requireTribe(CardTribe.PEASANT).requireColor(CardColor.BRONZE)

		this.createDeployTargets(TargetType.CARD_IN_UNIT_DECK)
			.requireAllied()
			.require((args) => args.targetCard.color === CardColor.BRONZE)
			.require((args) => args.targetCard.tribes.includes(CardTribe.SOLDIER))
			.perform(({ targetCard }) => UnitRavenMessenger.onTargetSelected(targetCard))
	}

	private static onTargetSelected(target: ServerCard): void {
		Keywords.summonCard(target)
	}
}
