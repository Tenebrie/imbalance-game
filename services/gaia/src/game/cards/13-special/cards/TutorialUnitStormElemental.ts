import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'

import Keywords from '../../../../utils/Keywords'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class TutorialUnitStormElemental extends ServerCard {
	manaGenerated = 5

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.ARCANE,
			tribes: [CardTribe.ELEMENTAL],
			features: [CardFeature.KEYWORD_DEPLOY],
			stats: {
				power: 12,
			},
			expansionSet: ExpansionSet.TUTORIAL,
		})
		this.dynamicTextVariables = {
			manaGenerated: this.manaGenerated,
		}

		this.createLocalization({
			en: {
				name: 'Storm Elemental',
				description: '*Deploy:*\nGenerate {manaGenerated} Mana.',
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => Keywords.generateMana(this, this.manaGenerated))
	}
}
