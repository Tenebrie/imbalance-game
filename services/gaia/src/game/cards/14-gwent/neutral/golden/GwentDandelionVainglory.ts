import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentDandelionVainglory extends ServerCard {
	public static readonly BOOST = 3

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.SUPPORT],
			stats: {
				power: 9,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Dandelion: Vainglory`,
				description: `Boost self by *${GwentDandelionVainglory.BOOST}* for each Geralt, Yennefer, Triss and Zoltan card in your starting deck.`,
				flavor: `Dandelion told me all about your adventures. How he'd ready you for battle with his songs, how he tamed the kayran by playin' his lute...`,
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(({ owner }) => {
			const validSubstrings = ['geralt', 'yennefer', 'triss', 'zoltan']
			const alliesCount = owner.startingDeck.unitCards.filter((card) =>
				validSubstrings.some((substr) => card.class.toLowerCase().includes(substr))
			).length
			this.boostBy(GwentDandelionVainglory.BOOST * alliesCount, this)
		})
	}
}
