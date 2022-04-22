import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentShupesDayOff extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.ORGANIC],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
			isExperimental: true,
		})

		this.createLocalization({
			en: {
				name: `Shupe's Day Off`,
				description: `If your starting deck has no duplicates, send Shupe on an adventure.`,
				flavor: `Other trolls always considered him a bit odd - after all, who in their right mind would prefer colorful scraps of paper to rocks?`,
			},
		})
	}
}
