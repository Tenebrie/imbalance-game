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
import GwentCroneWhispess from './GwentCroneWhispess'

export default class GwentCroneWeavess extends ServerCard {
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
			relatedCards: [GwentCroneWhispess, GwentCroneBrewess],
		})

		this.createLocalization({
			en: {
				name: 'Weavess',
				description: '*Summon* *Brewess* and *Whispess* to this row.',
				flavor: 'I sense your pain. I see your fear.',
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(({ triggeringUnit, owner }) => {
			const whispess = owner.cardDeck.allCards.find((card) => card instanceof GwentCroneWhispess)
			if (whispess) {
				game.animation.thread(() => {
					Keywords.summonUnitFromDeck({
						card: whispess,
						owner,
						rowIndex: triggeringUnit.rowIndex,
						unitIndex: triggeringUnit.unitIndex,
					})
				})
			}
			const brewess = owner.cardDeck.allCards.find((card) => card instanceof GwentCroneBrewess)
			if (brewess) {
				game.animation.thread(() => {
					Keywords.summonUnitFromDeck({
						card: brewess,
						owner,
						rowIndex: triggeringUnit.rowIndex,
						unitIndex: triggeringUnit.unitIndex,
					})
				})
			}
			game.animation.syncAnimationThreads()
		})
	}
}
