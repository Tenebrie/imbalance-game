import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentHawkerHealer extends ServerCard {
	public static readonly TARGET_COUNT = 2
	public static readonly BOOST = 3

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.ELF, CardTribe.SUPPORT],
			stats: {
				power: 5,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Hawker Healer`,
				description: `Boost *${GwentHawkerHealer.TARGET_COUNT}* allies by *${GwentHawkerHealer.BOOST}*.`,
				flavor: `Sure, I'll patch you up. Gonna cost you though.`,
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireNotSelf()
			.requireAllied()
			.targetCount(GwentHawkerHealer.TARGET_COUNT)
			.perform(({ targetUnit }) => {
				targetUnit.boost(GwentHawkerHealer.BOOST, this)
			})
	}
}
