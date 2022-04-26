import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'
import { getRandomArrayValue } from '@src/utils/Utils'

export default class GwentHanmarvynsDream extends ServerCard {
	public static readonly BOOST = 2

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.ALCHEMY],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Hanmarvyn's Dream`,
				description: `*Spawn* a default copy of a non-Leader Gold unit from your opponent's graveyard and boost it by *${GwentHanmarvynsDream.BOOST}*.`,
				flavor: `This spell lets you see the last moments of a dead man's life… if you can survive its casting.`,
			},
		})

		this.createEffect(GameEventType.SPELL_DEPLOYED).perform(({ owner }) => {
			const deck = owner.opponent.players[0].cardGraveyard
			const validTargets = deck.unitCards.filter((card) => card.type === CardType.UNIT).filter((card) => card.color === CardColor.GOLDEN)
			const target = getRandomArrayValue(validTargets)
			if (!target) {
				return
			}

			Keywords.createCard
				.for(owner)
				.with((card) => card.boostBy(GwentHanmarvynsDream.BOOST, this))
				.fromInstance(target)
		})
	}
}
