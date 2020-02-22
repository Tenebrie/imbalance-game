import CardType from '../../../shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerCardOnBoard from '../../../models/ServerCardOnBoard'
import GameTurnPhase from '../../../shared/enums/GameTurnPhase'
import ServerDamageInstance from '../../../models/ServerDamageSource'
import CardColor from '../../../shared/enums/CardColor'

export default class UnitUnfeelingWarrior extends ServerCard {
	bonusPower = 5
	hasBeenAttacked = false

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE)
		this.basePower = 28
		this.baseAttack = 5
		this.cardTextVariables = {
			bonusPower: this.bonusPower
		}
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
