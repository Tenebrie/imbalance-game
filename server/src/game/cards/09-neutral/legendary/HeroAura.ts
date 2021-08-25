import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import TargetType from '@shared/enums/TargetType'
import CardTribe from '@shared/enums/CardTribe'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'
import Keywords from '../../../../utils/Keywords'

export default class HeroAura extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.BIRD],
			features: [CardFeature.KEYWORD_DEPLOY],
			stats: {
				power: 3,
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.createDeployTargets(TargetType.CARD_IN_UNIT_DECK)
			.targetCount(1)
			.requireSamePlayer()
			.require((args) => args.targetCard.color === CardColor.GOLDEN)
			.perform(({ targetCard }) => {
				Keywords.summonCard(targetCard)
			})
	}
}
