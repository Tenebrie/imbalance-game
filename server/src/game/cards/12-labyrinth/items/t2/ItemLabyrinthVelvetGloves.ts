import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import CardFeature from '@shared/enums/CardFeature'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import LeaderStatType from '@shared/enums/LeaderStatType'
import CardTribe from '@shared/enums/CardTribe'
import GameEventType from '@shared/enums/GameEventType'
import CardLocation from '@shared/enums/CardLocation'
import Keywords from '@src/utils/Keywords'

export default class ItemLabyrinthVelvetGloves extends ServerCard {
	public static readonly BONUS_HAND_SIZE = 8
	public static readonly BONUS_REGEN = 3

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.GLOVES],
			features: [CardFeature.PASSIVE, CardFeature.LABYRINTH_ITEM_T2],
			stats: {
				cost: 0,
				[LeaderStatType.STARTING_HAND_SIZE]: ItemLabyrinthVelvetGloves.BONUS_HAND_SIZE,
			},
			expansionSet: ExpansionSet.LABYRINTH,
		})
		this.dynamicTextVariables = {
			bonusHandSize: ItemLabyrinthVelvetGloves.BONUS_HAND_SIZE,
			bonusRegen: ItemLabyrinthVelvetGloves.BONUS_REGEN,
		}

		this.createCallback(GameEventType.ROUND_STARTED, [CardLocation.HAND])
			.require(({ player }) => player === this.owner)
			.perform(() => Keywords.generateMana(this, ItemLabyrinthVelvetGloves.BONUS_REGEN))
	}
}
