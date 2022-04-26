import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

export default class GwentRoyalDecree extends ServerCard {
	public static readonly BOOST = 2

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.TACTIC],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Royal Decree`,
				description: `Play a Gold unit from your deck and boost it by *${GwentRoyalDecree.BOOST}*.`,
				flavor: `We, Foltest, by divine right King of Temeria, Prince of Sodden, Senior Protector of Brugge, etcetera, etcetera, do hereby decree the following…`,
			},
		})

		this.createDeployTargets(TargetType.CARD_IN_UNIT_DECK)
			.requireAllied()
			.require(({ targetCard }) => targetCard.color === CardColor.GOLDEN)
			.perform(({ targetCard }) => {
				Keywords.playCardFromDeck(targetCard)
				targetCard.boostBy(GwentRoyalDecree.BOOST, this)
			})
	}
}
