import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

export default class GwentArachasDrone extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.INSECTOID],
			stats: {
				power: 3,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: 'Arachas Drone',
				description: '*Summon* all copies of this unit to this row.',
				flavor: "Ugly - nature's way of saying stay away.",
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(({ triggeringUnit, owner }) => {
			const unitsToSummon = owner.cardDeck.allCards.filter((card) => card.class === this.class)
			unitsToSummon.forEach((card) => {
				game.animation.thread(() => {
					Keywords.summonUnitFromDeck({
						card,
						owner,
						rowIndex: triggeringUnit.rowIndex,
						unitIndex: triggeringUnit.unitIndex + 1,
					})
				})
			})
			game.animation.syncAnimationThreads()
		})
	}
}
