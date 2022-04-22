import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentHawkerSupport extends ServerCard {
	public static readonly BOOST = 3

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.ELF, CardTribe.SUPPORT],
			stats: {
				power: 7,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Hawker Support`,
				description: `Boost a unit in your hand by *${GwentHawkerSupport.BOOST}*.`,
				flavor: `Elf, dwarf, makes no difference – long as they've got coin.`,
			},
		})
		this.createDeployTargets(TargetType.CARD_IN_UNIT_HAND)
			.requireAllied()
			.perform(({ targetCard }) => {
				targetCard.boost(GwentHawkerSupport.BOOST, this)
			})
	}
}
