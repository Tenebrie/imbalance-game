import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import GwentArtefactCompression from './GwentArtefactCompression'

export default class GwentJadeFigurine extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.CURSED],
			stats: {
				power: 2,
			},
			expansionSet: ExpansionSet.GWENT,
			relatedCards: [GwentArtefactCompression],
			hiddenFromLibrary: true,
		})

		this.createLocalization({
			en: {
				name: 'Jade Figurine',
				description: `No ability.`,
				flavor: `The figurine expanded in a flash, pulsing and throbbing, changing its shape and structure like a puff of smoke crawling over the floor. Beams of light revealed movement and hardening materials. A moment later, in the centrum of the magic circle a human form suddenly appeared.`,
			},
		})
	}
}
