import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

import Keywords from '../../../../utils/Keywords'

export default class UnitRavenMessenger extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.BIRD],
			stats: {
				power: 4,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.addRelatedCards().requireTribe(CardTribe.COMMONER).requireColor(CardColor.BRONZE)

		this.createDeployTargets(TargetType.CARD_IN_UNIT_DECK)
			.requireSamePlayer()
			.require((args) => args.targetCard.color === CardColor.BRONZE)
			.require((args) => args.targetCard.tribes.includes(CardTribe.SOLDIER))
			.perform(({ targetCard }) => UnitRavenMessenger.onTargetSelected(targetCard))
	}

	private static onTargetSelected(target: ServerCard): void {
		Keywords.playCardFromDeckOrGraveyard(target)
	}
}
