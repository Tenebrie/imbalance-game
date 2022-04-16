import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

import GwentCantripSkies from './GwentCantripSkies'
import GwentClearSkies from './GwentClearSkies'

export default class GwentFirstLight extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.TACTIC],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
			relatedCards: [GwentClearSkies, GwentCantripSkies],
		})
		this.dynamicTextVariables = {
			boost: GwentClearSkies.BOOST,
		}

		this.createLocalization({
			en: {
				name: 'First Light',
				description: '*Spawn* either a *Clear Skies* or a *Cantrip Skies*.',
				flavor: "The sun's shinin', Dromle! The sun's shinin'! Maybe there's hope after all...",
			},
		})

		this.createDeployTargets(TargetType.CARD_IN_LIBRARY)
			.require(({ targetCard }) => targetCard instanceof GwentClearSkies || targetCard instanceof GwentCantripSkies)
			.perform(({ targetCard }) => {
				Keywords.createCard.forOwnerOf(this).fromInstance(targetCard)
			})
	}
}
