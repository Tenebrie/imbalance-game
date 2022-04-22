import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

import GwentChironex from '../silver/GwentChironex'
import GwentUnicorn from '../silver/GwentUnicorn'

export default class GwentYennefer extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.MAGE, CardTribe.AEDIRN],
			stats: {
				power: 6,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Yennefer`,
				description: `Choose One: *Spawn* a *Unicorn*; or *Spawn* a *Chironex*.`,
				flavor: `Magic is Chaos, Art and Science. It is a curse, a blessing and a progression.`,
			},
		})

		this.createDeployTargets(TargetType.CARD_IN_LIBRARY)
			.require(({ targetCard }) => targetCard instanceof GwentUnicorn || targetCard instanceof GwentChironex)
			.perform(({ targetCard }) => {
				Keywords.createCard.forOwnerOf(this).fromInstance(targetCard)
			})
	}
}
