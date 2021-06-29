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

export default class ItemLabyrinthSimpleRobe extends ServerCard {
	public static readonly BONUS_POWER = 3
	public static readonly BONUS_REGEN = 10

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
			bonusPower: ItemLabyrinthSimpleRobe.BONUS_POWER,
			bonusRegen: ItemLabyrinthSimpleRobe.BONUS_REGEN,
		}

		this.createSelector()
			.requireTarget(({ target }) => target.ownerGroupInGame.owns(this) && target === this.ownerPlayerInGame.leader)
			.provide(BuffHiddenStrength, ItemLabyrinthSimpleRobe.BONUS_POWER)

		this.createCallback(GameEventType.ROUND_STARTED, [CardLocation.HAND])
			.require(({ group }) => group.owns(this))
			.perform(() => Keywords.generateMana(this, ItemLabyrinthSimpleRobe.BONUS_REGEN))
	}
}
