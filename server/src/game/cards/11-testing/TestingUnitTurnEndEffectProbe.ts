import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import { AnyCardLocation } from '@src/utils/Utils'

import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'

export default class TestingUnitTurnEndEffectProbe extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			stats: {
				power: 10,
			},
			expansionSet: ExpansionSet.TESTING,
			sortPriority: 0,
		})

		this.createCallback(GameEventType.TURN_ENDED, AnyCardLocation).perform(() => this.onTurnEnd())
	}

	public onTurnEnd(): void {
		// Empty
	}
}
