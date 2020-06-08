import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import ServerUnit from '../../../models/ServerUnit'
import ServerBoardRow from '../../../models/ServerBoardRow'
import BuffStrength from '../../../buffs/BuffStrength'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'

export default class UnitUnfeelingWarrior extends ServerCard {
	bonusPower = 5
	hasBeenAttacked = false

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE, CardFaction.EXPERIMENTAL)
		this.basePower = 28
		this.baseAttack = 5
		this.dynamicTextVariables = {
			bonusPower: this.bonusPower
		}
	}

	onPlayedAsUnit(thisUnit: ServerUnit, targetRow: ServerBoardRow): void {
		this.buffs.add(new BuffStrength(), this)
	}

	onTurnStarted(): void {
		if (this.location !== CardLocation.BOARD) {
			return
		}

		const thisUnit = this.unit

		if (this.hasBeenAttacked) {
			thisUnit.setPower(thisUnit.card.power + this.bonusPower)
		}
		this.hasBeenAttacked = false
	}

	onAfterBeingAttacked(thisUnit: ServerUnit, attacker: ServerUnit): void {
		this.hasBeenAttacked = true
	}
}
