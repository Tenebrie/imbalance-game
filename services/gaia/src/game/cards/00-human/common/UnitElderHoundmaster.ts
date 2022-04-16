import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

import UnitTrainedHound from '../tokens/UnitTrainedHound'

export default class UnitElderHoundmaster extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.COMMONER, CardTribe.SOLDIER],
			relatedCards: [UnitTrainedHound],
			stats: {
				power: 6,
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(({ owner }) => {
			const targetRow = this.game.board.getRowWithDistanceToFront(this.ownerPlayer, 0)
			this.game.animation.instantThread(() => {
				this.game.board.createUnit(new UnitTrainedHound(game), owner, targetRow.index, targetRow.farRightUnitIndex)
			})
			this.game.animation.instantThread(() => {
				this.game.board.createUnit(new UnitTrainedHound(game), owner, targetRow.index, targetRow.farRightUnitIndex)
			})
		})
	}
}
