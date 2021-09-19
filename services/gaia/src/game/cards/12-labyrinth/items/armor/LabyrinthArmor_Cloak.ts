import CardTribe from '@shared/enums/CardTribe'
import LeaderStatType from '@shared/enums/LeaderStatType'
import { BaseLabyrinthPassiveItem } from '@src/game/cards/12-labyrinth/items/ItemLabyrinthBase'
import ServerGame from '@src/game/models/ServerGame'

export class LabyrinthItemShadyCloak extends BaseLabyrinthPassiveItem {
	public readonly BONUS_POWER = 10
	public readonly BONUS_REGEN = 5
	public static readonly BONUS_HAND_SIZE = 1

	constructor(game: ServerGame) {
		super(game, {
			tier: 1,
			slot: CardTribe.LABYRINTH_ARMOR,
			stats: {
				[LeaderStatType.STARTING_HAND_SIZE]: LabyrinthItemShadyCloak.BONUS_HAND_SIZE,
			},
		})
		this.dynamicTextVariables = {
			bonusPower: this.BONUS_POWER,
			bonusRegen: this.BONUS_REGEN,
		}
		this.createLocalization({
			en: {
				name: 'Shady Cloak',
				description: '*+*{bonusPower} Leader Power\n*+*{bonusRegen} Mana Regen\n*+*{bonusHandSize} Hand Size',
			},
		})

		this.addLeaderPower(this.BONUS_POWER)
		this.addManaRegen(this.BONUS_REGEN)
	}
}
