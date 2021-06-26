import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import CardFeature from '@shared/enums/CardFeature'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import BuffHiddenStrength from '@src/game/buffs/BuffHiddenStrength'
import GameEventType from '@shared/enums/GameEventType'
import CardLocation from '@shared/enums/CardLocation'
import Keywords from '@src/utils/Keywords'
import CardTribe from '@shared/enums/CardTribe'

export default class ItemLabyrinthSimpleDress extends ServerCard {
	public static readonly BONUS_REGEN = 3
	public static readonly BONUS_UNIT_POWER = 1

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.ARMOR],
			features: [CardFeature.PASSIVE, CardFeature.LABYRINTH_ITEM_T1],
			stats: {
				cost: 0,
			},
			expansionSet: ExpansionSet.LABYRINTH,
		})
		this.dynamicTextVariables = {
			bonusRegen: ItemLabyrinthSimpleDress.BONUS_REGEN,
			bonusUnitPower: ItemLabyrinthSimpleDress.BONUS_UNIT_POWER,
		}

		this.createSelector()
			.requireTarget(({ target }) => target.owner === this.owner && target.location === CardLocation.BOARD)
			.provide(BuffHiddenStrength, ItemLabyrinthSimpleDress.BONUS_UNIT_POWER)

		this.createCallback(GameEventType.ROUND_STARTED, [CardLocation.HAND])
			.require(({ player }) => player === this.owner)
			.perform(() => Keywords.generateMana(this, ItemLabyrinthSimpleDress.BONUS_REGEN))
	}
}
