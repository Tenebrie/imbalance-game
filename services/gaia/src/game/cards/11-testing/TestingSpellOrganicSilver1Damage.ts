import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'

import ServerCard from '../../models/ServerCard'
import { DamageInstance } from '../../models/ServerDamageSource'
import ServerGame from '../../models/ServerGame'

export default class TestingSpellOrganicSilver1Damage extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.SILVER,
			tribes: [CardTribe.ORGANIC],
			faction: CardFaction.NEUTRAL,
			stats: {
				cost: 0,
			},
			expansionSet: ExpansionSet.TESTING,
		})

		this.createDeployTargets(TargetType.UNIT).perform(({ targetCard }) => {
			targetCard.dealDamage(DamageInstance.fromCard(1, this))
		})
	}
}
