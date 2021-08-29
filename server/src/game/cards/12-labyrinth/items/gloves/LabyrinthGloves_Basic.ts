import CardTribe from '@shared/enums/CardTribe'
import LeaderStatType from '@shared/enums/LeaderStatType'
import { BaseLabyrinthPassiveItem } from '@src/game/cards/12-labyrinth/items/ItemLabyrinthBase'
import ServerGame from '@src/game/models/ServerGame'

export class LabyrinthItemOldGloves extends BaseLabyrinthPassiveItem {
	public readonly BONUS_POWER = 2
	public static readonly BONUS_HAND_SIZE = 7

	constructor(game: ServerGame) {
		super(game, {
			tier: 0,
			slot: CardTribe.LABYRINTH_GLOVES,
			stats: {
				[LeaderStatType.STARTING_HAND_SIZE]: LabyrinthItemOldGloves.BONUS_HAND_SIZE,
			},
			upgrades: [LabyrinthItemCombatGloves, LabyrinthItemVelvetGloves],
		})
		this.dynamicTextVariables = {
			bonusPower: this.BONUS_POWER,
			bonusHandSize: LabyrinthItemOldGloves.BONUS_HAND_SIZE,
		}
		this.createLocalization({
			en: {
				name: 'Old Gloves',
				description: '*+*{bonusPower} Leader Power\n*+*{bonusHandSize} Hand Size',
			},
		})

		this.addLeaderPower(this.BONUS_POWER)
	}
}

export class LabyrinthItemCombatGloves extends BaseLabyrinthPassiveItem {
	public readonly BONUS_POWER = 5
	public static readonly BONUS_HAND_SIZE = 8

	constructor(game: ServerGame) {
		super(game, {
			tier: 1,
			slot: CardTribe.LABYRINTH_GLOVES,
			stats: {
				[LeaderStatType.STARTING_HAND_SIZE]: LabyrinthItemCombatGloves.BONUS_HAND_SIZE,
			},
		})
		this.dynamicTextVariables = {
			bonusPower: this.BONUS_POWER,
			bonusHandSize: LabyrinthItemCombatGloves.BONUS_HAND_SIZE,
		}
		this.createLocalization({
			en: {
				name: 'Combat Gloves',
				description: '*+*{bonusPower} Leader Power\n*+*{bonusHandSize} Hand Size',
			},
		})

		this.addLeaderPower(this.BONUS_POWER)
	}
}

export class LabyrinthItemVelvetGloves extends BaseLabyrinthPassiveItem {
	public readonly BONUS_POWER = 5
	public readonly BONUS_REGEN = 3
	public static readonly BONUS_HAND_SIZE = 7

	constructor(game: ServerGame) {
		super(game, {
			tier: 1,
			slot: CardTribe.LABYRINTH_GLOVES,
			stats: {
				[LeaderStatType.STARTING_HAND_SIZE]: LabyrinthItemVelvetGloves.BONUS_HAND_SIZE,
			},
		})
		this.dynamicTextVariables = {
			bonusPower: this.BONUS_POWER,
			bonusRegen: this.BONUS_REGEN,
			bonusHandSize: LabyrinthItemVelvetGloves.BONUS_HAND_SIZE,
		}
		this.createLocalization({
			en: {
				name: 'Velvet Gloves',
				description: '*+*{bonusPower} Leader Power\n*+*{bonusRegen} Mana Regen\n*+*{bonusHandSize} Hand Size',
			},
		})

		this.addLeaderPower(this.BONUS_POWER)
	}
}
