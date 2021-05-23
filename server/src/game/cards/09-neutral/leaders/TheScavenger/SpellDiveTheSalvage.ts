import CardType from '@shared/enums/CardType'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import TargetType from '@shared/enums/TargetType'
import CardFeature from '@shared/enums/CardFeature'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import Keywords from '@src/utils/Keywords'
import CardTribe from '@src/../../shared/src/enums/CardTribe'

export default class SpellDiveTheSalvage extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			features: [CardFeature.HERO_POWER, CardFeature.KEYWORD_CREATE],
			stats: {
				cost: 3,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			targetSpellCost: this.stats.baseSpellCost,
		}

		this.createDeployTargets(TargetType.CARD_IN_SPELL_GRAVEYARD)
			.require(({ targetCard }) => targetCard.stats.spellCost <= this.stats.baseSpellCost)
			.perform(({ targetCard }) => {
				if (targetCard.tribes.includes(CardTribe.SALVAGE)) {
					Keywords.createCard.forOwnerOf(this).fromInstance(targetCard)
				}
			})
			.perform(({ targetCard }) => Keywords.summonCard(targetCard))
	}
}
