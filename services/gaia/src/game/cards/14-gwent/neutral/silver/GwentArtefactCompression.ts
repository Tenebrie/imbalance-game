import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

import GwentJadeFigurine from './GwentJadeFigurine'

export default class GwentArtefactCompression extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.SPELL],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
			relatedCards: [GwentJadeFigurine],
		})

		this.createLocalization({
			en: {
				name: `Artefact Compression`,
				description: `Transform a Bronze or Silver unit into a *Jade Figurine*.`,
				flavor: `The figurine expanded in a flash, pulsing and throbbing, changing its shape and structure like a puff of smoke crawling over the floor. Beams of light revealed movement and hardening materials. A moment later, in the center of the magic circle a human form suddenly appeared.`,
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.require(({ targetCard }) => targetCard.isBronzeOrSilver)
			.perform(({ targetUnit }) => {
				Keywords.transformUnit(targetUnit, GwentJadeFigurine)
			})
	}
}
