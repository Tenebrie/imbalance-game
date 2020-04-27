import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerUnit from '../../../models/ServerUnit'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'

export default class UnitPossessedVulture extends ServerCard {
	bonusPower = 4
	bonusAttack = 1

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE, CardFaction.EXPERIMENTAL)
		this.basePower = 26
		this.baseAttack = 4 // 20
		this.baseAttackRange = 2 // 30
		this.dynamicTextVariables = {
			bonusPower: this.bonusPower,
			bonusAttack: this.bonusAttack
		}
	}

	onAfterPerformingUnitAttack(thisUnit: ServerUnit, target: ServerUnit): void {
		if (target.isDead()) {
			thisUnit.setPower(thisUnit.card.power + 4)
		}
	}
}
