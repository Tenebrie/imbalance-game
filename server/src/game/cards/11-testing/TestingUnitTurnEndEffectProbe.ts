import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'
import GameEventType from '@shared/enums/GameEventType'
import { AnyCardLocation } from '@src/utils/Utils'

export default class TestingUnitTurnEndEffectProbe extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			stats: {
				power: 10,
			},
			expansionSet: ExpansionSet.BASE,
			hiddenFromLibrary: true,
			sortPriority: 0,
		})

		this.createCallback(GameEventType.TURN_ENDED, AnyCardLocation).perform(() => this.onTurnEnd())
	}

	public onTurnEnd(): void {
		// Empty
	}
}
