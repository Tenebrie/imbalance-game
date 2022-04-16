import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import GwentCroneWeavess from './GwentCroneWeavess'
import GwentCroneWhispess from './GwentCroneWhispess'

export default class GwentCroneBrewess extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.MAGE, CardTribe.RELICT],
			stats: {
				power: 8,
			},
			expansionSet: ExpansionSet.GWENT,
			relatedCards: [GwentCroneWhispess, GwentCroneWeavess],
		})

		this.createLocalization({
			en: {
				name: 'Brewess',
				description: '*Summon* *Whispess* and *Weavess* to this row.',
				flavor: "We'll cut you up, boy. A fine broth you'll make.",
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(({ triggeringUnit, owner }) => {
			const whispess = owner.cardDeck.allCards.find((card) => card instanceof GwentCroneWhispess)
			if (whispess) {
				game.animation.instantThread(() => {
					Keywords.summonUnitFromDeck({
						card: whispess,
						owner,
						rowIndex: triggeringUnit.rowIndex,
						unitIndex: triggeringUnit.unitIndex,
					})
				})
			}
			const weavess = owner.cardDeck.allCards.find((card) => card instanceof GwentCroneWeavess)
			if (weavess) {
				game.animation.instantThread(() => {
					Keywords.summonUnitFromDeck({
						card: weavess,
						owner,
						rowIndex: triggeringUnit.rowIndex,
						unitIndex: triggeringUnit.unitIndex + 1,
					})
				})
			}
			game.animation.syncAnimationThreads()
		})
	}
}
