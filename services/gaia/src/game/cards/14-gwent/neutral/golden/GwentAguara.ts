import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentAguara extends ServerCard {
	public static readonly VAR_0 = 5
	public static readonly VAR_1 = 5
	public static readonly VAR_2 = 5
	public static readonly VAR_3 = 5

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.CURSED, CardTribe.RELICT],
			stats: {
				power: 5,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
			isExperimental: true,
		})

		this.createLocalization({
			en: {
				name: `Aguara`,
				description: `Choose Two: Boost the *Lowest* ally by *${GwentAguara.VAR_0}*; Boost a random unit in your hand by *${GwentAguara.VAR_1}*; Deal *${GwentAguara.VAR_2}* damage to the *Highest* enemy; *Charm* a random enemy Elf with *${GwentAguara.VAR_3}* power or less.`,
				flavor: `Smarten up right now, or it's off to an aguara with you!`,
			},
		})
	}
}
