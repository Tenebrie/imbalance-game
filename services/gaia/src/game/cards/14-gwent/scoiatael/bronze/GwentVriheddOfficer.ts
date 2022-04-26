import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

export default class GwentVriheddOfficer extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.ELF, CardTribe.OFFICER],
			stats: {
				power: 5,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Vrihedd Officer`,
				description: `*Swap* a card and boost self by its base power.`,
				flavor: `Hatred burns brighter than any fire, and cuts deeper than any blade.`,
			},
		})

		this.createDeployTargets(TargetType.CARD_IN_UNIT_HAND)
			.requireAllied()
			.require(() => this.ownerPlayer.cardDeck.allCards.length > 0)
			.perform(({ targetCard, player }) => {
				game.animation.instantThread(() => Keywords.draw.topUnitCard(player))
				game.animation.instantThread(() => Keywords.returnCardFromHandToDeck(targetCard))
				this.boostBy(targetCard.stats.basePower, this)
			})
	}
}
