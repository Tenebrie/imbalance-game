import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'
import CardLibrary from '../../../libraries/CardLibrary'

export default class UnitEndlessArmy extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			features: [CardFeature.KEYWORD_DEPLOY],
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
		this.ownerPlayerInGame.cardDeck.addUnitToBottom(copy)
	}
}
