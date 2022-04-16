import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentLesserDao extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.CONSTRUCT, CardTribe.DOOMED],
			stats: {
				power: 4,
			},
			expansionSet: ExpansionSet.GWENT,
			hiddenFromLibrary: true,
		})

		this.createLocalization({
			en: {
				name: "Lesser D'ao",
				description: 'No ability.',
				flavor: "They're easily mistaken for rocks. Many a troll's been unpleasantly surprised by gastric grief on that very account",
			},
		})
	}
}
