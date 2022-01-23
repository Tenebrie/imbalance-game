import CardTribe from '@shared/enums/CardTribe'
import { BaseRitesPassiveItem } from '@src/game/cards/12-rites/items/ItemRitesBase'
import ServerGame from '@src/game/models/ServerGame'

export class RitesItemCasualDress extends BaseRitesPassiveItem {
	public readonly BONUS_REGEN = 5
	public readonly BONUS_UNIT_POWER = 1

	constructor(game: ServerGame) {
		super(game, {
			tier: 1,
			slot: CardTribe.RITES_ARMOR,
			upgrades: [RitesItemNobleDress],
		})
		this.dynamicTextVariables = {
			bonusRegen: this.BONUS_REGEN,
			bonusUnitPower: this.BONUS_UNIT_POWER,
		}
		this.createLocalization({
			en: {
				name: 'Casual Dress',
				description: '*+*{bonusRegen} Mana Regen\nYour units have *+*{bonusUnitPower} Power.',
			},
		})

		this.addManaRegen(this.BONUS_REGEN)
		this.addBonusUnitPower(this.BONUS_UNIT_POWER)
	}
}

export class RitesItemNobleDress extends BaseRitesPassiveItem {
	public readonly BONUS_REGEN = 5
	public readonly BONUS_UNIT_POWER = 3

	constructor(game: ServerGame) {
		super(game, {
			tier: 2,
			slot: CardTribe.RITES_ARMOR,
		})
		this.dynamicTextVariables = {
			bonusRegen: this.BONUS_REGEN,
			bonusUnitPower: this.BONUS_UNIT_POWER,
		}
		this.createLocalization({
			en: {
				name: 'Noble Dress',
				description: '*+*{bonusRegen} Mana Regen\nYour units have *+*{bonusUnitPower} Power.',
			},
		})

		this.addManaRegen(this.BONUS_REGEN)
		this.addBonusUnitPower(this.BONUS_UNIT_POWER)
	}
}
