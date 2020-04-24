import CardType from '@shared/enums/CardType'
import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'
import ServerUnit from '../../models/ServerUnit'
import CardColor from '@shared/enums/CardColor'
import ServerBoardRow from '../../models/ServerBoardRow'

export default class UnitForestScout extends ServerCard {
	boardPowerBonus = 7
	moralePowerBonus = 3

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE)
		this.basePower = 4
		this.dynamicTextVariables = {
			boardPowerBonus: this.boardPowerBonus,
			moralePowerBonus: this.moralePowerBonus
		}
	}

	onPlayedAsUnit(thisUnit: ServerUnit, targetRow: ServerBoardRow): void {
		const owner = thisUnit.owner
		const ownPower = this.game.board.getTotalPlayerPower(thisUnit.owner)
		const opponentsPower = this.game.board.getTotalPlayerPower(thisUnit.owner.opponent)
		if (ownPower < opponentsPower) {
			thisUnit.addPower(this.boardPowerBonus)
		}
		if (owner.morale < owner.opponent.morale) {
			thisUnit.addPower(this.moralePowerBonus)
		}
	}
}
