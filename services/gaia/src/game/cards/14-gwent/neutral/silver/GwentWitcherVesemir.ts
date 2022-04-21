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
import GwentWitcherLambert from './GwentWitcherLambert'

export default class GwentWitcherVesemir extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.WITCHER],
			stats: {
				power: 7,
			},
			expansionSet: ExpansionSet.GWENT,
			relatedCards: [GwentWitcherLambert, GwentWitcherEskel],
		})

		this.createLocalization({
			en: {
				name: 'Vesemir',
				description: '*Summon* *Lambert* and *Eskel* to this row.',
				flavor: "If you're to be hanged, ask for water. Anything can happen before they fetch it.",
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
			const eskel = owner.cardDeck.allCards.find((card) => card instanceof GwentWitcherEskel)
			if (eskel) {
				Keywords.summonUnitFromDeck({
					card: eskel,
					owner,
					rowIndex: triggeringUnit.rowIndex,
					unitIndex: triggeringUnit.unitIndex + 1,
					threadType: 'parallel',
				})
			}
		})
	}
}
