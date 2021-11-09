import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'

import Keywords from '../../../../utils/Keywords'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class UnitLabyrinthLostRaven extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.LOST, CardTribe.BIRD],
			stats: {
				power: 3,
			},
			expansionSet: ExpansionSet.LABYRINTH,
		})
		this.addRelatedCards().requireTribe(CardTribe.LOST)

		this.createDeployTargets(TargetType.CARD_IN_UNIT_DECK)
			.requireSamePlayer()
			.require((args) => args.targetCard.tribes.includes(CardTribe.LOST))
			.perform(({ targetCard }) => UnitLabyrinthLostRaven.onTargetSelected(targetCard))
	}

	private static onTargetSelected(target: ServerCard): void {
		Keywords.playCardFromDeck(target)
	}
}
