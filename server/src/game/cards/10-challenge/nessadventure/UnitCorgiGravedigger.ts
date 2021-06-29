import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import TargetType from '@shared/enums/TargetType'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'

export default class UnitCorgiGravedigger extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			features: [CardFeature.QUICK],
			stats: {
				power: 3,
			},
			expansionSet: ExpansionSet.BASE,
			hiddenFromLibrary: true,
		})

		this.createDeployTargets(TargetType.CARD_IN_UNIT_GRAVEYARD)
			.requireAllied()
			.require(({ targetCard }) => targetCard.type === CardType.UNIT)
			.perform(({ targetCard }) => {
				const owner = targetCard.ownerPlayerInGame
				owner.cardGraveyard.removeCard(targetCard)
				owner.cardHand.addUnit(targetCard)
			})
	}
}
