import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class SpellScourTheSalvage extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			features: [CardFeature.HERO_POWER],
			stats: {
				cost: 2,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			targetSpellCost: this.stats.baseSpellCost,
		}

		this.createDeployTargets(TargetType.CARD_IN_SPELL_GRAVEYARD)
			.require(({ targetCard }) => targetCard.stats.spellCost <= this.stats.baseSpellCost)
			.require(({ targetCard }) => this.ownerGroup.owns(targetCard))
			.perform(({ targetCard }) => Keywords.playCardFromDeck(targetCard))
	}
}
