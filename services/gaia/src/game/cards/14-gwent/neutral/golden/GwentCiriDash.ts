import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

export default class GwentCiriDash extends ServerCard {
	public static readonly BOOST = 3

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.CINTRA, CardTribe.WITCHER],
			stats: {
				power: 11,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Ciri: Dash`,
				description: `Whenever this unit is *Discarded* or destroyed, return it to your deck and *Strengthen* it by *${GwentCiriDash.BOOST}*.`,
				flavor: `Know when fairy tales cease to be tales? When people start believing them.`,
			},
		})

		const returnToDeck = () => {
			Keywords.returnCardFromGraveyardToDeck(this)
			this.strengthen(GwentCiriDash.BOOST, this)
		}

		this.createEffect(GameEventType.CARD_DISCARDED).perform(() => returnToDeck())
		this.createEffect(GameEventType.AFTER_UNIT_DESTROYED).perform(() => returnToDeck())
	}
}
