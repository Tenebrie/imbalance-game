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

export default class UnitLabyrinthLostRaven extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.LOST, CardTribe.BIRD],
			features: [CardFeature.KEYWORD_DEPLOY],
			stats: {
				power: 3,
			},
			expansionSet: ExpansionSet.LABYRINTH,
		})
		this.addRelatedCards().requireTribe(CardTribe.LOST)

		this.createDeployTargets(TargetType.CARD_IN_UNIT_DECK)
			.requireAllied()
			.require((args) => args.targetCard.tribes.includes(CardTribe.LOST))
			.perform(({ targetCard }) => UnitLabyrinthLostRaven.onTargetSelected(targetCard))
	}

	private static onTargetSelected(target: ServerCard): void {
		Keywords.summonCard(target)
	}
}
