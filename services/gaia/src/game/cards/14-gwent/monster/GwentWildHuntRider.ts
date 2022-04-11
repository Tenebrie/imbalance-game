import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'

import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class GwentWildHuntRider extends ServerCard {
	public static readonly EXTRA_DAMAGE = 1

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.WILD_HUNT, CardTribe.SOLDIER],
			stats: {
				power: 10,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			extraDamage: GwentWildHuntRider.EXTRA_DAMAGE,
		}

		this.createLocalization({
			en: {
				name: 'Wild Hunt Rider',
				description: 'Increase the damage dealt by *Biting Frost* on the opposite row by {extraDamage}.',
				flavor:
					"First the buffalo horns atop their helms penetrate one's view, then the crest betwixt them, and finally the skull-like face exposed beneath their visors.",
			},
		})
	}
}
