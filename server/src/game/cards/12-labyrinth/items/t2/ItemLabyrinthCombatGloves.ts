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

export default class ItemLabyrinthCombatGloves extends ServerCard {
	public static readonly BONUS_POWER = 7
	public static readonly BONUS_HAND_SIZE = 8

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.GLOVES],
			features: [CardFeature.PASSIVE, CardFeature.LABYRINTH_ITEM_T2],
			stats: {
				cost: 0,
				[LeaderStatType.STARTING_HAND_SIZE]: ItemLabyrinthCombatGloves.BONUS_HAND_SIZE,
			},
			expansionSet: ExpansionSet.LABYRINTH,
		})
		this.dynamicTextVariables = {
			bonusPower: ItemLabyrinthCombatGloves.BONUS_POWER,
			bonusHandSize: ItemLabyrinthCombatGloves.BONUS_HAND_SIZE,
		}

		this.createSelector()
			.requireTarget(({ target }) => target.ownerGroupInGame.owns(this) && target === this.ownerPlayerInGame.leader)
			.provide(BuffHiddenStrength, ItemLabyrinthCombatGloves.BONUS_POWER)
	}
}
