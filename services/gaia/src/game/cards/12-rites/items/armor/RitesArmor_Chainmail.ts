import CardTribe from '@shared/enums/CardTribe'
import { BaseRitesPassiveItem } from '@src/game/cards/12-rites/items/ItemRitesBase'
import ServerGame from '@src/game/models/ServerGame'

export class RitesItemChainmail extends BaseRitesPassiveItem {
	public readonly BONUS_POWER = 25
	public readonly BONUS_REGEN = 5

	constructor(game: ServerGame) {
		super(game, {
			tier: 1,
			slot: CardTribe.RITES_ARMOR,
			upgrades: [RitesItemPlateArmor],
		})
		this.dynamicTextVariables = {
			bonusPower: this.BONUS_POWER,
			bonusRegen: this.BONUS_REGEN,
		}
		this.createLocalization({
			en: {
				name: 'Chainmail',
				description: '*+*{bonusPower} Leader Power\n*+*{bonusRegen} Mana Regen',
			},
		})

		this.addLeaderPower(this.BONUS_POWER)
		this.addManaRegen(this.BONUS_REGEN)
	}
}

export class RitesItemPlateArmor extends BaseRitesPassiveItem {
	public readonly BONUS_POWER = 35
	public readonly BONUS_REGEN = 5

	constructor(game: ServerGame) {
		super(game, {
			tier: 1,
			slot: CardTribe.RITES_ARMOR,
		})
		this.dynamicTextVariables = {
			bonusPower: this.BONUS_POWER,
			bonusRegen: this.BONUS_REGEN,
		}
		this.createLocalization({
			en: {
				name: 'Chainmail',
				description: '*+*{bonusPower} Leader Power\n*+*{bonusRegen} Mana Regen',
			},
		})

		this.addLeaderPower(this.BONUS_POWER)
		this.addManaRegen(this.BONUS_REGEN)
	}
}
