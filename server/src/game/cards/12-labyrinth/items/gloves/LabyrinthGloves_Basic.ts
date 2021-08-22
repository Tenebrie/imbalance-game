import ServerGame from '@src/game/models/ServerGame'
import CardTribe from '@shared/enums/CardTribe'
import { BaseLabyrinthPassiveItem } from '@src/game/cards/12-labyrinth/items/ItemLabyrinthBase'
import LeaderStatType from '@shared/enums/LeaderStatType'

export class LabyrinthItemOldGloves extends BaseLabyrinthPassiveItem {
	public readonly BONUS_POWER = 2
	public static readonly BONUS_HAND_SIZE = 7

	constructor(game: ServerGame) {
		super(game, {
			tier: 0,
			slot: CardTribe.LABYRINTH_GLOVES,
			stats: {
				[LeaderStatType.STARTING_HAND_SIZE]: LabyrinthItemOldGloves.BONUS_HAND_SIZE,
			},
		})
		this.dynamicTextVariables = {
			bonusPower: this.BONUS_POWER,
			bonusHandSize: LabyrinthItemOldGloves.BONUS_HAND_SIZE,
		}
		this.createLocalization({
			en: {
				name: 'Old Gloves',
				description: '*+*{bonusPower} Leader Power\n*+*{bonusHandSize} Hand Size',
			},
		})

		this.addLeaderPower(this.BONUS_POWER)
	}
}
