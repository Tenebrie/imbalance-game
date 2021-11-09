import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'

import Keywords from '../../../../utils/Keywords'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class HeroLightOracle extends ServerCard {
	cardsToSee = 3

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			sortPriority: 1,
			stats: {
				power: 8,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			cardsToSee: this.cardsToSee,
		}

		this.createDeployTargets(TargetType.CARD_IN_UNIT_DECK)
			.requireSamePlayer()
			.require((args) => args.targetCard.deckPosition < this.cardsToSee)
			.preventSorting()
			.perform(({ targetCard }) => HeroLightOracle.onTargetSelected(targetCard))
	}

	private static onTargetSelected(target: ServerCard): void {
		Keywords.playCardFromDeck(target)
	}
}
