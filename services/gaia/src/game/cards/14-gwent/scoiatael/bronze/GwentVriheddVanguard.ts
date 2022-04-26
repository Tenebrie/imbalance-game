import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentVriheddVanguard extends ServerCard {
	public static readonly BOOST = 1

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.SOLDIER, CardTribe.ELF],
			stats: {
				power: 6,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Vrihedd Vanguard`,
				description: `Boost Elf allies by *${GwentVriheddVanguard.BOOST}*.<p> Whenever you *Swap* this card, trigger its ability.`,
				flavor: `Temerians, Redanians, all the same. Better off dead.`,
			},
		})

		const boostEffect = () =>
			game.board
				.getSplashableUnitsOfTribe(CardTribe.ELF, this.ownerGroup)
				.filter((unit) => unit.card !== this)
				.forEach((unit) => unit.boostBy(GwentVriheddVanguard.BOOST, this))

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(boostEffect)
		this.createEffect(GameEventType.CARD_RETURNED).perform(boostEffect)
	}
}
