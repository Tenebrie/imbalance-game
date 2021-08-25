import ServerGame from '@src/game/models/ServerGame'
import CardTribe from '@shared/enums/CardTribe'
import { BaseLabyrinthPassiveItem } from '@src/game/cards/12-labyrinth/items/ItemLabyrinthBase'

export class LabyrinthItemApprenticeRobes extends BaseLabyrinthPassiveItem {
	public readonly BONUS_POWER = 5
	public readonly BONUS_REGEN = 7

	constructor(game: ServerGame) {
		super(game, {
			tier: 1,
			slot: CardTribe.LABYRINTH_ARMOR,
			upgrades: [LabyrinthItemAdeptRobes],
		})
		this.dynamicTextVariables = {
			bonusPower: this.BONUS_POWER,
			bonusRegen: this.BONUS_REGEN,
		}
		this.createLocalization({
			en: {
				name: 'Apprentice Robes',
				description: '*+*{bonusPower} Leader Power\n*+*{bonusRegen} Mana Regen',
			},
		})

		this.addManaRegen(this.BONUS_REGEN)
		this.addBonusUnitPower(this.BONUS_POWER)
	}
}

export class LabyrinthItemAdeptRobes extends BaseLabyrinthPassiveItem {
	public readonly BONUS_POWER = 5
	public readonly BONUS_REGEN = 10

	constructor(game: ServerGame) {
		super(game, {
			tier: 2,
			slot: CardTribe.LABYRINTH_ARMOR,
		})
		this.dynamicTextVariables = {
			bonusPower: this.BONUS_POWER,
			bonusRegen: this.BONUS_REGEN,
		}
		this.createLocalization({
			en: {
				name: 'Adept Robes',
				description: '*+*{bonusPower} Leader Power\n*+*{bonusRegen} Mana Regen',
			},
		})

		this.addManaRegen(this.BONUS_REGEN)
		this.addBonusUnitPower(this.BONUS_POWER)
	}
}
