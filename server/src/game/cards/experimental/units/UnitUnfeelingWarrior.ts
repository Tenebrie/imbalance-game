import CardType from '../../../shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '../../../shared/enums/CardColor'
import ServerCardOnBoard from '../../../models/ServerCardOnBoard'
import ServerGameBoardRow from '../../../models/ServerGameBoardRow'
import BuffStrength from '../../../buffs/BuffStrength'

export default class UnitUnfeelingWarrior extends ServerCard {
	bonusPower = 5
	hasBeenAttacked = false

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE)
		this.basePower = 28
		this.baseAttack = 5
		this.dynamicTextVariables = {
			bonusPower: this.bonusPower
		}
	}

	onPlayedAsUnit(thisUnit: ServerCardOnBoard, targetRow: ServerGameBoardRow): void {
		this.cardBuffs.add(new BuffStrength(), this)
	}

	onTurnStarted(thisUnit: ServerCardOnBoard): void {
		if (this.hasBeenAttacked) {
			thisUnit.setPower(thisUnit.card.power + this.bonusPower)
		}
		this.hasBeenAttacked = false
	}

	onAfterBeingAttacked(thisUnit: ServerCardOnBoard, attacker: ServerCardOnBoard): void {
		this.hasBeenAttacked = true
	}
}
