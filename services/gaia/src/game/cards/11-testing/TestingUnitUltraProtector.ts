import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'

import GameHookType from '../../models/events/GameHookType'
import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'

export default class TestingUnitUltraProtector extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			stats: {
				power: 10,
			},
			expansionSet: ExpansionSet.TESTING,
		})

		this.createHook(GameHookType.CARD_TAKES_DAMAGE, [CardLocation.BOARD])
			.require(({ targetCard }) => targetCard !== this)
			.replace((values) => ({
				...values,
				targetCard: this,
			}))
	}
}
