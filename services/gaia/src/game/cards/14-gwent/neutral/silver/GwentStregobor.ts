import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentStregobor extends ServerCard {
	public static readonly POWER_SET = 1

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.MAGE],
			stats: {
				power: 1,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Stregobor`,
				description: `*Truce*: Each player draws a unit and sets its power to *${GwentStregobor.POWER_SET}*.`,
				flavor: `The witcher had met thieves that looked like town councilors, town councilors that looked like beggars and kings that looked like thieves. Stregobor, though, always looked exactly like the commonly accepted imagining of a what a mage should look like.`,
			},
		})
	}
}
