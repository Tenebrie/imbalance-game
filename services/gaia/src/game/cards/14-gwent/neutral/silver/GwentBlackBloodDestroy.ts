import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

import { GwentBlackBlood } from './GwentBlackBlood'

export default class GwentBlackBloodDestroy extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.ALCHEMY, CardTribe.ITEM],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
			relatedCards: [GwentBlackBlood],
			hiddenFromLibrary: true,
		})

		this.createLocalization({
			en: {
				name: `Destructive Blood`,
				description: `Destroy a Bronze or Silver Necrophage or Vampire.`,
				flavor: `...however, some ways to use it are worse than others.`,
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.require(({ targetCard }) => targetCard.isBronzeOrSilver)
			.require(({ targetCard }) => targetCard.tribes.includes(CardTribe.VAMPIRE) || targetCard.tribes.includes(CardTribe.NECROPHAGE))
			.perform(({ targetUnit }) => {
				Keywords.destroyUnit({
					unit: targetUnit,
					source: this,
				})
			})
	}
}
