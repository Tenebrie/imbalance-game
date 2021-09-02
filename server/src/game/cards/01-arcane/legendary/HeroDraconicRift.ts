import BuffDuration from '@shared/enums/BuffDuration'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardLocation from '@shared/enums/CardLocation'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import HeroVoidIncarnate from '@src/game/cards/01-arcane/legendary/HeroVoidIncarnate'

import BuffStrength from '../../../buffs/BuffStrength'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class HeroDraconicRift extends ServerCard {
	powerPerMana = 2
	powerThreshold = 80

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.ARCANE,
			features: [CardFeature.KEYWORD_CONSUME, CardFeature.KEYWORD_TRANSFORM],
			stats: {
				power: 0,
				armor: 30,
			},
			relatedCards: [HeroVoidIncarnate],
			expansionSet: ExpansionSet.BASE,
			isExperimental: true,
		})
		this.dynamicTextVariables = {
			powerPerMana: this.powerPerMana,
			powerThreshold: this.powerThreshold,
		}

		this.createLocalization({
			en: {
				name: 'Draconic Rift',
				description:
					"*Turn end:*<br>*Consume* adjacent units.<p>If the Rift's Power reaches {powerThreshold}, *transform* into *Formidia*.",
			},
		})

		// TODO: Implement me
	}
}
