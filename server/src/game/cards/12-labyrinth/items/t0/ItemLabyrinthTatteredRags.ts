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

export default class ItemLabyrinthTatteredRags extends ServerCard {
	public static readonly BONUS_POWER = 5
	public static readonly BONUS_REGEN = 3

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.ARMOR],
			features: [CardFeature.PASSIVE, CardFeature.LABYRINTH_ITEM_T0],
			stats: {
				cost: 0,
			},
			expansionSet: ExpansionSet.LABYRINTH,
		})
		this.dynamicTextVariables = {
			bonusPower: ItemLabyrinthTatteredRags.BONUS_POWER,
			bonusRegen: ItemLabyrinthTatteredRags.BONUS_REGEN,
		}

		this.createSelector()
			.requireTarget(({ target }) => target.owner === this.owner && target === this.ownerInGame.leader)
			.provide(BuffHiddenStrength, ItemLabyrinthTatteredRags.BONUS_POWER)

		this.createCallback(GameEventType.ROUND_STARTED, [CardLocation.HAND])
			.require(({ player }) => player === this.owner)
			.perform(() => Keywords.generateMana(this, ItemLabyrinthTatteredRags.BONUS_REGEN))
	}
}
