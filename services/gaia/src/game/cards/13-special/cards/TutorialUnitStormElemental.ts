import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import UnitStormElemental from '@src/game/cards/01-arcane/common/UnitStormElemental'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

import Keywords from '../../../../utils/Keywords'

export default class TutorialUnitStormElemental extends ServerCard {
	manaGenerated = 5

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.ARCANE,
			tribes: [CardTribe.ELEMENTAL],
			stats: {
				power: 12,
			},
			sharedArtwork: UnitStormElemental,
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
