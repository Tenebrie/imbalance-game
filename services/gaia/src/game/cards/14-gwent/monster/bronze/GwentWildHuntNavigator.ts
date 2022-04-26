import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

export default class GwentWildHuntNavigator extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.WILD_HUNT, CardTribe.MAGE],
			stats: {
				power: 3,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: 'Wild Hunt Navigator',
				description: 'Play a Bronze non-Mage Wild Hunt card from your deck.',
				flavor:
					"For hundreds of years, Avallac'h tried to recreate the Elder Blood gene through back breeding - yet the elven children thus fostered were but dim sparks compared to Lara's flame.",
			},
		})

		this.createDeployTargets(TargetType.CARD_IN_UNIT_DECK)
			.requireAllied()
			.require(({ targetCard }) => targetCard.tribes.includes(CardTribe.WILD_HUNT))
			.require(({ targetCard }) => targetCard.color === CardColor.BRONZE)
			.require(({ targetCard }) => !targetCard.tribes.includes(CardTribe.MAGE))
			.perform(({ targetCard }) => {
				Keywords.playCardFromDeck(targetCard)
			})
	}
}
