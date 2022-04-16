import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

import CardLibrary from '../../../libraries/CardLibrary'

export default class UnitEndlessArmy extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			stats: {
				power: 22,
			},
			expansionSet: ExpansionSet.BASE,
			relatedCards: [UnitEndlessArmy],
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => this.onDeploy())
	}

	private onDeploy(): void {
		const copy = CardLibrary.instantiate(this.game, UnitEndlessArmy)
		this.ownerPlayer.cardDeck.addUnitToBottom(copy)
	}
}
