import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import GwentWitcherLambert from './GwentWitcherLambert'
import GwentWitcherVesemir from './GwentWitcherVesemir'

export default class GwentWitcherEskel extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.RELICT],
			stats: {
				power: 6,
			},
			expansionSet: ExpansionSet.GWENT,
			relatedCards: [GwentWitcherLambert, GwentWitcherVesemir],
		})

		this.createLocalization({
			en: {
				name: 'Eskel',
				description: '*Summon* *Lambert* and *Vesemir* to this row.',
				flavor: "I'm a simple witcher, Wolf. Don't fight dragons, don't fraternize with kings and don't sleep with sorceresses…",
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(({ triggeringUnit, owner }) => {
			const lambert = owner.cardDeck.allCards.find((card) => card instanceof GwentWitcherLambert)
			if (lambert) {
				Keywords.summonUnitFromDeck({
					card: lambert,
					owner,
					rowIndex: triggeringUnit.rowIndex,
					unitIndex: triggeringUnit.unitIndex,
					threadType: 'parallel',
				})
			}
			const vesemir = owner.cardDeck.allCards.find((card) => card instanceof GwentWitcherVesemir)
			if (vesemir) {
				Keywords.summonUnitFromDeck({
					card: vesemir,
					owner,
					rowIndex: triggeringUnit.rowIndex,
					unitIndex: triggeringUnit.unitIndex,
					threadType: 'parallel',
				})
			}
		})
	}
}
