import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentGaunterODimm extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.RELICT],
			stats: {
				power: 6,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
			isExperimental: true,
		})

		this.createLocalization({
			en: {
				name: `Gaunter O'Dimm`,
				description: `Gamble with Gaunter: Guess the power of the card he's picked to play it.`,
				flavor: `He always grants exactly what you wish for. That's the problem.`,
			},
		})
	}
}
