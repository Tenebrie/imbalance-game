import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentEleyas extends ServerCard {
	public static readonly BOOST = 2

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.SOLDIER, CardTribe.ELF],
			stats: {
				power: 10,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Ele'yas`,
				description: `Whenever you draw this unit or return it to your deck, boost self by *${GwentEleyas.BOOST}*.`,
				flavor: `Love justifies madness in any of its forms.`,
			},
		})

		const boostEffect = () => this.boostBy(GwentEleyas.BOOST, this)

		this.createEffect(GameEventType.CARD_DRAWN).perform(boostEffect)
		this.createEffect(GameEventType.CARD_RETURNED).perform(boostEffect)
	}
}
