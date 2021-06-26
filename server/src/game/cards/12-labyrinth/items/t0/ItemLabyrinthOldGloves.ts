import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import CardFeature from '@shared/enums/CardFeature'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import BuffHiddenStrength from '@src/game/buffs/BuffHiddenStrength'
import LeaderStatType from '@shared/enums/LeaderStatType'
import CardTribe from '@shared/enums/CardTribe'

export default class ItemLabyrinthOldGloves extends ServerCard {
	public static readonly BONUS_POWER = 2
	public static readonly BONUS_HAND_SIZE = 7

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.GLOVES],
			features: [CardFeature.PASSIVE, CardFeature.LABYRINTH_ITEM_T0],
			stats: {
				cost: 0,
				[LeaderStatType.STARTING_HAND_SIZE]: ItemLabyrinthOldGloves.BONUS_HAND_SIZE,
			},
			expansionSet: ExpansionSet.LABYRINTH,
		})
		this.dynamicTextVariables = {
			bonusPower: ItemLabyrinthOldGloves.BONUS_POWER,
			bonusHandSize: ItemLabyrinthOldGloves.BONUS_HAND_SIZE,
		}

		this.createSelector()
			.requireTarget(({ target }) => target.owner === this.owner && target === this.ownerInGame.leader)
			.provide(BuffHiddenStrength, ItemLabyrinthOldGloves.BONUS_POWER)
	}
}
