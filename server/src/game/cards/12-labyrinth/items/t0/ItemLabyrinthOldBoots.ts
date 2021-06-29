import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import CardFeature from '@shared/enums/CardFeature'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import BuffHiddenStrength from '@src/game/buffs/BuffHiddenStrength'
import CardTribe from '@shared/enums/CardTribe'

export default class ItemLabyrinthOldBoots extends ServerCard {
	public static readonly BONUS_POWER = 3
	public static readonly BONUS_POWER_PER_GAME = 1

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.BOOTS],
			features: [CardFeature.PASSIVE, CardFeature.LABYRINTH_ITEM_T0],
			stats: {
				cost: 0,
			},
			expansionSet: ExpansionSet.LABYRINTH,
		})
		this.dynamicTextVariables = {
			bonusPower: ItemLabyrinthOldBoots.BONUS_POWER,
			bonusPowerPerGame: ItemLabyrinthOldBoots.BONUS_POWER_PER_GAME,
		}

		this.createSelector()
			.requireTarget(({ target }) => target.ownerGroupInGame.owns(this) && target === this.ownerPlayerInGame.leader)
			.provide(BuffHiddenStrength, () => totalBonusPower())

		const totalBonusPower = () => {
			const state = this.game.progression.labyrinth.state.run
			return ItemLabyrinthOldBoots.BONUS_POWER + ItemLabyrinthOldBoots.BONUS_POWER_PER_GAME * state.encounterHistory.length
		}
	}
}
