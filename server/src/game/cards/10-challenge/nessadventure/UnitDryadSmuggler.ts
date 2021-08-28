import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@src/../../shared/src/enums/GameEventType'

export default class UnitDryadSmuggler extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			features: [CardFeature.QUICK],
			stats: {
				power: 3,
			},
			expansionSet: ExpansionSet.BASE,
			hiddenFromLibrary: true,
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => {
			const owner = this.ownerPlayer
			owner.drawUnitCards(1, true)
		})
	}
}
