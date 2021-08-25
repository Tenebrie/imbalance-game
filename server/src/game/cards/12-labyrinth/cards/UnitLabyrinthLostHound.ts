import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import CardTribe from '@shared/enums/CardTribe'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

export default class UnitLabyrinthLostHound extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.LOST, CardTribe.BEAST],
			features: [CardFeature.KEYWORD_DEPLOY],
			stats: {
				power: 8,
			},
			expansionSet: ExpansionSet.LABYRINTH,
			relatedCards: [UnitLabyrinthLostHound],
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => {
			const cardToSummon = this.ownerPlayerInGame.cardDeck.findCard(UnitLabyrinthLostHound)
			if (cardToSummon) {
				Keywords.summonCard(cardToSummon)
			}
		})
	}
}
