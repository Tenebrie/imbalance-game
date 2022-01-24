import CardTribe from '@shared/enums/CardTribe'
import { BaseRitesPassiveItem } from '@src/game/cards/12-rites/items/ItemRitesBase'
import ServerGame from '@src/game/models/ServerGame'

export class RitesItemApprenticeRobes extends BaseRitesPassiveItem {
	public readonly BONUS_POWER = 5
	public readonly BONUS_REGEN = 7

	constructor(game: ServerGame) {
		super(game, {
			tier: 1,
			slot: CardTribe.RITES_ARMOR,
			upgrades: [RitesItemAdeptRobes],
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

export class RitesItemAdeptRobes extends BaseRitesPassiveItem {
	public readonly BONUS_POWER = 5
	public readonly BONUS_REGEN = 10

	constructor(game: ServerGame) {
		super(game, {
			tier: 2,
			slot: CardTribe.RITES_ARMOR,
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
