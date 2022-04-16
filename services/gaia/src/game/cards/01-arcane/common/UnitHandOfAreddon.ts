import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import ServerUnit from '@src/game/models/ServerUnit'
import Keywords from '@src/utils/Keywords'

export default class UnitHandOfAreddon extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.ARCANE,
			tribes: [CardTribe.ELEMENTAL],
			stats: {
				power: 17,
				armor: 2,
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.createLocalization({
			en: {
				name: 'Hand of Areddon',
				description: '*Deploy:*\n*Consume* adjacent units twice.',
			},
		})

		const consumeAdjacent = (triggeringUnit: ServerUnit) => {
			const adjacentUnits = game.board.getAdjacentUnits(triggeringUnit)
			Keywords.consume.units({
				targets: adjacentUnits,
				consumer: triggeringUnit.card,
			})
		}

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(({ triggeringUnit }) => {
			consumeAdjacent(triggeringUnit)
			consumeAdjacent(triggeringUnit)
		})
	}
}
