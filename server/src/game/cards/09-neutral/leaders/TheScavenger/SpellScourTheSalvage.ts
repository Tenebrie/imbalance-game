import CardType from '@shared/enums/CardType'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import TargetType from '@shared/enums/TargetType'
import CardFeature from '@shared/enums/CardFeature'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import Keywords from '@src/utils/Keywords'

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
			.require(({ targetCard }) => this.ownerGroupInGame.owns(targetCard))
			.perform(({ targetCard }) => Keywords.summonCard(targetCard))
	}
}
