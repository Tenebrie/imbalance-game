import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import GwentCroneBrewess from './GwentCroneBrewess'
import GwentCroneWeavess from './GwentCroneWeavess'

export default class GwentCroneWhispess extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.MAGE, CardTribe.RELICT],
			stats: {
				power: 6,
			},
			expansionSet: ExpansionSet.GWENT,
			relatedCards: [GwentCroneBrewess, GwentCroneWeavess],
		})

		this.createLocalization({
			en: {
				name: 'Whispess',
				description: '*Summon* *Brewess* and *Weavess* to this row.',
				flavor: "I'd be your best - and last.",
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(({ triggeringUnit, owner }) => {
			const brewess = owner.cardDeck.allCards.find((card) => card instanceof GwentCroneBrewess)
			if (brewess) {
				game.animation.thread(() => {
					Keywords.summonUnitFromDeck({
						card: brewess,
						owner,
						rowIndex: triggeringUnit.rowIndex,
						unitIndex: triggeringUnit.unitIndex + 1,
					})
				})
			}
			const weavess = owner.cardDeck.allCards.find((card) => card instanceof GwentCroneWeavess)
			if (weavess) {
				game.animation.thread(() => {
					Keywords.summonUnitFromDeck({
						card: weavess,
						owner,
						rowIndex: triggeringUnit.rowIndex,
						unitIndex: triggeringUnit.unitIndex + 2,
					})
				})
			}
			game.animation.syncAnimationThreads()
		})
	}
}
