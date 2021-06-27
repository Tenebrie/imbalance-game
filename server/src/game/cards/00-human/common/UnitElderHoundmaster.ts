import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardTribe from '@shared/enums/CardTribe'
import CardFaction from '@shared/enums/CardFaction'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'
import UnitTrainedHound from '../tokens/UnitTrainedHound'

export default class UnitElderHoundmaster extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.PEASANT, CardTribe.SOLDIER],
			features: [CardFeature.KEYWORD_DEPLOY],
			relatedCards: [UnitTrainedHound],
			stats: {
				power: 6,
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => {
			const targetRow = this.game.board.getRowWithDistanceToFront(this.ownerInGame, 0)
			this.game.animation.instantThread(() => {
				this.game.board.createUnit(new UnitTrainedHound(game), targetRow.index, targetRow.farRightUnitIndex)
			})
			this.game.animation.instantThread(() => {
				this.game.board.createUnit(new UnitTrainedHound(game), targetRow.index, targetRow.farRightUnitIndex)
			})
		})
	}
}
