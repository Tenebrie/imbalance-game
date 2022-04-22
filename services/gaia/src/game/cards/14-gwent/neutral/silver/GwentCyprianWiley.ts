import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import BuffBaseWeakness from '@src/game/buffs/BuffBaseWeakness'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentCyprianWiley extends ServerCard {
	public static readonly WEAKEN = 4

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.REDANIA],
			stats: {
				power: 8,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Cyprian Wiley`,
				description: `*Weaken* a unit by *${GwentCyprianWiley.WEAKEN}*.`,
				flavor: `One of four bosses who control the city's underworld - the others being Sigi Reuven, Carlo The Cleaver Varese and the King of Beggars.`,
			},
		})

		this.createDeployTargets(TargetType.UNIT).perform(({ targetUnit }) => {
			targetUnit.buffs.addMultiple(BuffBaseWeakness, GwentCyprianWiley.WEAKEN, this)
		})
	}
}
