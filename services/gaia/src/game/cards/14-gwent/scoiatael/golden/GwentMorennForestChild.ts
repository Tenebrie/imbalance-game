import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import BuffGwentAmbush from '@src/game/buffs/14-gwent/BuffGwentAmbush'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class GwentMorennForestChild extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.DRYAD],
			stats: {
				power: 6,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.buffs.add(BuffGwentAmbush, this)

		this.createLocalization({
			en: {
				name: 'Morenn: Forest Child',
				description: '*Ambush:* When your opponent plays a Bronze or Silver special card, flip over and cancel its ability.',
				flavor:
					'I hold Brokilon dearer than my own life. She is a mother who cares for her children. I will defend her to my final breath.',
			},
		})
	}
}
