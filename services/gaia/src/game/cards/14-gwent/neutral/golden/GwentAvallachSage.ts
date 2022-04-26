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

export default class GwentAvallachSage extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.MAGE, CardTribe.ELF],
			stats: {
				power: 3,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Avallac'h: Sage`,
				description: `*Spawn* a default copy of a random Gold or Silver unit from your opponent's starting deck.`,
				flavor: `Amongst the free elves were a handful of Aen Saevherne, or Sages. They were an enigma, bordering on a legend.`,
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(({ owner }) => {
			const deck = owner.opponent.players[0].startingDeck
			const validTargets = deck.unitCards
				.filter((card) => card.type === CardType.UNIT)
				.filter((card) => card.color === CardColor.GOLDEN || card.color === CardColor.SILVER)
			const target = getRandomArrayValue(validTargets)
			if (!target) {
				return
			}

			Keywords.createCard.for(owner).fromInstance(target)
		})
	}
}
