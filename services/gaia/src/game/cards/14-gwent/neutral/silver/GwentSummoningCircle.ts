import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

export default class GwentSummoningCircle extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.SILVER,
			tribes: [CardTribe.SPELL],
			faction: CardFaction.NEUTRAL,
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: 'Summoning Circle',
				description: '*Spawn* a default copy of the last Bronze or Silver non-Agent unit that appeared.',
				flavor:
					'There exist a great many realities outside our own… With the right knowledge, one can contact them and summon beings beyond human fathoming.',
			},
		})

		this.createEffect(GameEventType.SPELL_DEPLOYED).perform(({ owner }) => {
			const lastMatchingUnit = game.board.insertedUnitList
				.reverse()
				.find((unit) => [CardColor.BRONZE, CardColor.SILVER].includes(unit.card.color))

			if (!lastMatchingUnit) {
				return
			}

			Keywords.createCard.for(owner).fromInstance(lastMatchingUnit.card)
		})
	}
}
