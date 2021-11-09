import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class UnitEphemeralParrot extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.ARCANE,
			tribes: [CardTribe.ELEMENTAL, CardTribe.BIRD],
			features: [CardFeature.QUICK],
			stats: {
				power: 2,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.addRelatedCards().requireTribe(CardTribe.ELEMENTAL).requireCollectible()

		this.createLocalization({
			en: {
				name: 'Ephemeral Parrot',
				description: '*Deploy:*\nDraw an Elemental.',
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => {
			const card = this.ownerPlayer.cardDeck.unitCards.find((card) => card.tribes.includes(CardTribe.ELEMENTAL))
			if (!card) {
				return
			}
			Keywords.drawExactCard(this.ownerPlayer, card)
		})
	}
}
