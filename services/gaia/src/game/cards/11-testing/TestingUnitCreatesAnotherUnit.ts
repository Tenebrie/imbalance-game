import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import TestingUnitNoEffect from '@src/game/cards/11-testing/TestingUnitNoEffect'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

export default class TestingUnitCreatesAnotherUnit extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			stats: {
				power: 0,
			},
			expansionSet: ExpansionSet.TESTING,
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => {
			Keywords.createCard.forOwnerOf(this).fromConstructor(TestingUnitNoEffect)
		})
	}
}
