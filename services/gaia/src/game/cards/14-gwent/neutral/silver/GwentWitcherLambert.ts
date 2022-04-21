import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import GwentWitcherEskel from './GwentWitcherEskel'
import GwentWitcherVesemir from './GwentWitcherVesemir'

export default class GwentWitcherLambert extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.WITCHER],
			stats: {
				power: 5,
			},
			expansionSet: ExpansionSet.GWENT,
			relatedCards: [GwentWitcherVesemir, GwentWitcherEskel],
		})

		this.createLocalization({
			en: {
				name: 'Lambert',
				description: '*Summon* *Vesemir* and *Eskel* to this row.',
				flavor: "Now that's the kind of negotiating I understand.",
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(({ triggeringUnit, owner }) => {
			const vesemir = owner.cardDeck.allCards.find((card) => card instanceof GwentWitcherVesemir)
			if (vesemir) {
				Keywords.summonUnitFromDeck({
					card: vesemir,
					owner,
					rowIndex: triggeringUnit.rowIndex,
					unitIndex: triggeringUnit.unitIndex + 1,
					threadType: 'parallel',
				})
			}
			const eskel = owner.cardDeck.allCards.find((card) => card instanceof GwentWitcherEskel)
			if (eskel) {
				Keywords.summonUnitFromDeck({
					card: eskel,
					owner,
					rowIndex: triggeringUnit.rowIndex,
					unitIndex: triggeringUnit.unitIndex + 2,
					threadType: 'parallel',
				})
			}
		})
	}
}
