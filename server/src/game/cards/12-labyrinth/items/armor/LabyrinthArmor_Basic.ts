import ServerGame from '@src/game/models/ServerGame'
import CardTribe from '@shared/enums/CardTribe'
import { BaseLabyrinthPassiveItem } from '@src/game/cards/12-labyrinth/items/ItemLabyrinthBase'

export class LabyrinthItemTatteredRags extends BaseLabyrinthPassiveItem {
	public readonly BONUS_POWER = 5
	public readonly BONUS_REGEN = 5

	constructor(game: ServerGame) {
		super(game, {
			tier: 0,
			slot: CardTribe.LABYRINTH_ARMOR,
		})
		this.dynamicTextVariables = {
			bonusPower: this.BONUS_POWER,
			bonusRegen: this.BONUS_REGEN,
		}
		this.createLocalization({
			en: {
				name: 'Tattered Rags',
				description: '*+*{bonusPower} Leader Power\n*+*{bonusRegen} Mana Regen',
			},
		})

		this.addLeaderPower(this.BONUS_POWER)
		this.addManaRegen(this.BONUS_REGEN)
	}
}

/**
 * Upgrade Branch 1 (Armor): {@link LabyrinthItemChainmail}
 * Upgrade Branch 2 (Cloak): {@link LabyrinthItemShadyCloak}
 * Upgrade Branch 3 (Dress): {@link LabyrinthItemCasualDress}
 * Upgrade Branch 4 (Robes): {@link LabyrinthItemApprenticeRobes}
 */
