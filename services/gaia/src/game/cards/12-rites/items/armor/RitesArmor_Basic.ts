import CardTribe from '@shared/enums/CardTribe'
import { RitesItemChainmail } from '@src/game/cards/12-rites/items/armor/RitesArmor_Chainmail'
import { RitesItemShadyCloak } from '@src/game/cards/12-rites/items/armor/RitesArmor_Cloak'
import { RitesItemCasualDress } from '@src/game/cards/12-rites/items/armor/RitesArmor_Dress'
import { RitesItemApprenticeRobes } from '@src/game/cards/12-rites/items/armor/RitesArmor_Robes'
import { BaseRitesPassiveItem } from '@src/game/cards/12-rites/items/ItemRitesBase'
import ServerGame from '@src/game/models/ServerGame'

export class RitesItemTravelingGarb extends BaseRitesPassiveItem {
	public readonly BONUS_POWER = 5
	public readonly BONUS_REGEN = 5

	constructor(game: ServerGame) {
		super(game, {
			tier: 0,
			slot: CardTribe.RITES_ARMOR,
			upgrades: [RitesItemChainmail, RitesItemShadyCloak, RitesItemCasualDress, RitesItemApprenticeRobes],
		})
		this.dynamicTextVariables = {
			bonusPower: this.BONUS_POWER,
			bonusRegen: this.BONUS_REGEN,
		}
		this.createLocalization({
			en: {
				name: 'Traveling Garb',
				description: '*+*{bonusPower} Leader Power\n*+*{bonusRegen} Mana Regen',
			},
		})

		this.addLeaderPower(this.BONUS_POWER)
		this.addManaRegen(this.BONUS_REGEN)
	}
}
