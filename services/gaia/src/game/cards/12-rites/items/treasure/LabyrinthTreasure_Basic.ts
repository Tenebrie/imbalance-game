import CardTribe from '@shared/enums/CardTribe'
import LeaderStatType from '@shared/enums/LeaderStatType'
import { BaseLabyrinthPassiveItem } from '@src/game/cards/12-rites/items/ItemLabyrinthBase'
import ServerGame from '@src/game/models/ServerGame'

export class LabyrinthItemWarBanner extends BaseLabyrinthPassiveItem {
	public static readonly BONUS_HAND_SIZE = 1

	constructor(game: ServerGame) {
		super(game, {
			tier: 1,
			slot: CardTribe.LABYRINTH_TREASURE,
			stats: {
				[LeaderStatType.STARTING_HAND_SIZE]: LabyrinthItemWarBanner.BONUS_HAND_SIZE,
			},
		})
		this.dynamicTextVariables = {
			bonusHandSize: LabyrinthItemWarBanner.BONUS_HAND_SIZE,
		}
		this.createLocalization({
			en: {
				name: 'War Banner',
				description: '*+*{bonusHandSize} Hand Size',
			},
		})
	}
}
