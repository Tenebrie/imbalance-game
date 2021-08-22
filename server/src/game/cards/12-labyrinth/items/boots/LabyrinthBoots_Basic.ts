import ServerGame from '@src/game/models/ServerGame'
import CardTribe from '@shared/enums/CardTribe'
import { BaseLabyrinthPassiveItem } from '@src/game/cards/12-labyrinth/items/ItemLabyrinthBase'

export class LabyrinthItemOldBoots extends BaseLabyrinthPassiveItem {
	public readonly BONUS_POWER = 3
	public readonly BONUS_POWER_PER_GAME = 1

	constructor(game: ServerGame) {
		super(game, {
			tier: 0,
			slot: CardTribe.LABYRINTH_BOOTS,
		})
		this.dynamicTextVariables = {
			bonusPower: this.BONUS_POWER,
			bonusPowerPerGame: this.BONUS_POWER_PER_GAME,
		}
		this.createLocalization({
			en: {
				name: 'Old Boots',
				description: '*+*{bonusPower} Leader Power\n*+*{bonusPowerPerGame} Leader Power per game played this run.',
			},
		})

		this.addLeaderPower(this.BONUS_POWER)
		this.addLeaderPowerPerGame(this.BONUS_POWER_PER_GAME)
	}
}

export class LabyrinthItemWornBoots extends BaseLabyrinthPassiveItem {
	public readonly BONUS_POWER = 5
	public readonly BONUS_POWER_PER_GAME = 2

	constructor(game: ServerGame) {
		super(game, {
			tier: 1,
			slot: CardTribe.LABYRINTH_BOOTS,
		})
		this.dynamicTextVariables = {
			bonusPower: this.BONUS_POWER,
			bonusPowerPerGame: this.BONUS_POWER_PER_GAME,
		}
		this.createLocalization({
			en: {
				name: 'Worn Boots',
				description: '*+*{bonusPower} Leader Power\n*+*{bonusPowerPerGame} Leader Power per game played this run.',
			},
		})

		this.addLeaderPower(this.BONUS_POWER)
		this.addLeaderPowerPerGame(this.BONUS_POWER_PER_GAME)
	}
}
