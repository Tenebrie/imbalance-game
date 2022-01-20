import CardTribe from '@shared/enums/CardTribe'
import { LabyrinthItemChainmail } from '@src/game/cards/12-rites/items/armor/LabyrinthArmor_Chainmail'
import { LabyrinthItemShadyCloak } from '@src/game/cards/12-rites/items/armor/LabyrinthArmor_Cloak'
import { LabyrinthItemCasualDress } from '@src/game/cards/12-rites/items/armor/LabyrinthArmor_Dress'
import { LabyrinthItemApprenticeRobes } from '@src/game/cards/12-rites/items/armor/LabyrinthArmor_Robes'
import { BaseLabyrinthPassiveItem } from '@src/game/cards/12-rites/items/ItemLabyrinthBase'
import ServerGame from '@src/game/models/ServerGame'

export class LabyrinthItemTatteredRags extends BaseLabyrinthPassiveItem {
	public readonly BONUS_POWER = 5
	public readonly BONUS_REGEN = 5

	constructor(game: ServerGame) {
		super(game, {
			tier: 0,
			slot: CardTribe.LABYRINTH_ARMOR,
			upgrades: [LabyrinthItemChainmail, LabyrinthItemShadyCloak, LabyrinthItemCasualDress, LabyrinthItemApprenticeRobes],
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
