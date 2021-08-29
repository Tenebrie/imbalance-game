import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'

import ServerCard from '../../models/ServerCard'
import ServerDamageInstance from '../../models/ServerDamageSource'
import ServerGame from '../../models/ServerGame'

export default class TestingSpellHeavyStrike extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			stats: {
				cost: 0,
			},
			expansionSet: ExpansionSet.TESTING,
		})

		this.createDeployTargets(TargetType.UNIT).perform(({ targetCard }) => {
			targetCard.dealDamage(ServerDamageInstance.fromCard(100, this))
		})
	}
}
