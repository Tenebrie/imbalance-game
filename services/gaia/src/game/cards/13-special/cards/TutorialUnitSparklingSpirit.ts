import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import LeaderStatType from '@shared/enums/LeaderStatType'
import SpellFleetingSpark from '@src/game/cards/01-arcane/tokens/SpellFleetingSpark'
import TutorialSpellFleetingSpark from '@src/game/cards/13-special/cards/TutorialSpellFleetingSpark'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class TutorialUnitSparklingSpirit extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.ARCANE,
			relatedCards: [SpellFleetingSpark],
			stats: {
				power: 16,
				[LeaderStatType.SPARK_DAMAGE]: 1,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.addRelatedCards().requireTribe(CardTribe.SPARK)
		this.dynamicTextVariables = {
			extraDamage: this.stats.leaderStats[LeaderStatType.SPARK_DAMAGE],
		}

		this.createLocalization({
			en: {
				name: 'Sparkling Spirit',
				description: 'Add a *Fleeting Spark* to your hand.',
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => {
			Keywords.addCardToHand.forOwnerOf(this).fromConstructor(TutorialSpellFleetingSpark)
		})
	}
}
