import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'

import Keywords from '../../../../utils/Keywords'
import BotCardEvaluation from '../../../AI/BotCardEvaluation'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class UnitStormElemental extends ServerCard {
	manaGenerated = 3

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.ARCANE,
			tribes: [CardTribe.ELEMENTAL],
			stats: {
				power: 12,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			manaGenerated: this.manaGenerated,
		}
		this.botEvaluation = new CustomBotEvaluation(this)

		this.createLocalization({
			en: {
				name: 'Storm Elemental',
				description: '*Deploy:*\nGenerate {manaGenerated} Mana.',
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => Keywords.generateMana(this, this.manaGenerated))
	}
}

class CustomBotEvaluation extends BotCardEvaluation {
	get expectedValue(): number {
		const card = this.card as UnitStormElemental
		return card.stats.power + card.manaGenerated * 3
	}
}
