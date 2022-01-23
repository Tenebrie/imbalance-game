import CardTribe from '@shared/enums/CardTribe'
import LeaderStatType from '@shared/enums/LeaderStatType'
import { BaseRitesPassiveItem } from '@src/game/cards/12-rites/items/ItemRitesBase'
import ServerGame from '@src/game/models/ServerGame'

export class RitesItemShadyCloak extends BaseRitesPassiveItem {
	public readonly BONUS_POWER = 10
	public readonly BONUS_REGEN = 5
	public static readonly BONUS_HAND_SIZE = 1

	constructor(game: ServerGame) {
		super(game, {
			tier: 1,
			slot: CardTribe.RITES_ARMOR,
			stats: {
				[LeaderStatType.STARTING_HAND_SIZE]: RitesItemShadyCloak.BONUS_HAND_SIZE,
			},
			upgrades: [RitesItemShadowCloak],
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

export class RitesItemShadowCloak extends BaseRitesPassiveItem {
	public readonly BONUS_POWER = 10
	public readonly BONUS_REGEN = 5
	public static readonly BONUS_HAND_SIZE = 2

	constructor(game: ServerGame) {
		super(game, {
			tier: 1,
			slot: CardTribe.RITES_ARMOR,
			stats: {
				[LeaderStatType.STARTING_HAND_SIZE]: RitesItemShadyCloak.BONUS_HAND_SIZE,
			},
		})
		this.dynamicTextVariables = {
			bonusPower: this.BONUS_POWER,
			bonusRegen: this.BONUS_REGEN,
		}
		this.createLocalization({
			en: {
				name: 'Shadow Cloak',
				description: '*+*{bonusPower} Leader Power\n*+*{bonusRegen} Mana Regen\n*+*{bonusHandSize} Hand Size',
			},
		})

		this.addLeaderPower(this.BONUS_POWER)
		this.addManaRegen(this.BONUS_REGEN)
	}
}
