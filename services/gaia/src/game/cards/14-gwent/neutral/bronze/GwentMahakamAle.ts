import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import BuffStrength from '@src/game/buffs/BuffStrength'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import { getRandomArrayValue } from '@src/utils/Utils'

export default class GwentMahakamAle extends ServerCard {
	public static readonly BOOST = 4

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			boost: GwentMahakamAle.BOOST,
		}

		this.createLocalization({
			en: {
				name: 'Mahakam Ale',
				description: 'Boost a random ally on each row by {boost}.',
				flavor: "Considered to be the dwarves' greatest contribution to world culture.",
			},
		})

		this.createEffect(GameEventType.SPELL_DEPLOYED).perform(({ owner }) => {
			const alliedRows = game.board.getControlledRows(owner)
			const targets = alliedRows
				.map((row) => getRandomArrayValue(row.cards.filter((unit) => !unit.card.features.includes(CardFeature.UNTARGETABLE))))
				.filter((unit) => !!unit)
				.map((unit) => unit!)
			targets.forEach((unit) => {
				game.animation.thread(() => {
					unit.buffs.addMultiple(BuffStrength, GwentMahakamAle.BOOST, this)
				})
			})
			game.animation.syncAnimationThreads()
		})
	}
}
