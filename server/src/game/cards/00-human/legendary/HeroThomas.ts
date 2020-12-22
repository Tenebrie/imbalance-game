import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import GameEventType from '@shared/enums/GameEventType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import Keywords from '../../../../utils/Keywords'
import CardFeature from '@shared/enums/CardFeature'
import BuffNoArmor from '../../../buffs/BuffNoArmor'

export default class HeroThomas extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.PEASANT],
			stats: {
				power: 9,
			},
			expansionSet: ExpansionSet.BASE,
			isExperimental: true
		})
	}
}
