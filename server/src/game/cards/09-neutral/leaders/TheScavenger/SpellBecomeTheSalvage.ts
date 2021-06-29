import CardType from '@shared/enums/CardType'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import TargetType from '@shared/enums/TargetType'
import CardFeature from '@shared/enums/CardFeature'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import CardTribe from '@src/../../shared/src/enums/CardTribe'

export default class SpellBecomeTheSalvage extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			features: [CardFeature.HERO_POWER, CardFeature.KEYWORD_EXILE],
			stats: {
				cost: 0,
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.createDeployTargets(TargetType.CARD_IN_SPELL_GRAVEYARD)
			.require(({ targetCard }) => targetCard.tribes.includes(CardTribe.SALVAGE))
			.perform(({ targetCard }) => {
				this.ownerPlayerInGame.addSpellMana(targetCard.stats.spellCost)
				this.ownerPlayerInGame.cardGraveyard.removeCard(targetCard)
			})
	}
}
