import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import CardFeature from '@shared/enums/CardFeature'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import LeaderStatType from '@shared/enums/LeaderStatType'
import CardTribe from '@shared/enums/CardTribe'

export default class ItemLabyrinthWarBanner extends ServerCard {
	public static readonly BONUS_HAND_SIZE = 1

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.TREASURE],
			features: [CardFeature.PASSIVE, CardFeature.LABYRINTH_ITEM_T1],
			stats: {
				cost: 0,
				[LeaderStatType.STARTING_HAND_SIZE]: ItemLabyrinthWarBanner.BONUS_HAND_SIZE,
			},
			expansionSet: ExpansionSet.LABYRINTH,
		})
		this.dynamicTextVariables = {
			bonusHandSize: ItemLabyrinthWarBanner.BONUS_HAND_SIZE,
		}
	}
}
