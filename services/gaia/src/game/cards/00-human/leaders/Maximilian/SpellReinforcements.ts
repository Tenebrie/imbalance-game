import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'

import Keywords from '../../../../../utils/Keywords'
import BotCardEvaluation from '../../../../AI/BotCardEvaluation'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class SpellReinforcements extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.GOLDEN,
			faction: CardFaction.HUMAN,
			features: [CardFeature.HERO_POWER, CardFeature.KEYWORD_SUMMON],
			stats: {
				cost: 8,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.botEvaluation = new CustomBotEvaluation(this)

		this.createEffect(GameEventType.SPELL_DEPLOYED).perform(() => {
			const owner = this.ownerPlayer
			Keywords.draw.topUnitCard(owner)
			owner.addUnitMana(1)
		})
	}
}

class CustomBotEvaluation extends BotCardEvaluation {
	get expectedValue(): number {
		return this.card.stats.basePower * 2
	}
}
